-- ================================================================
-- QCY资源站 支付系统 v2 — 微信商家收款码模式
-- 在 Supabase SQL Editor 中执行（追加到原 schema 之后）
-- ================================================================

-- ----------------------------------------------------------------
-- 1. products  商品表（VIP / 单独课程 / 站长加盟）
-- ----------------------------------------------------------------
create table if not exists public.products (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  slug         text unique not null,          -- vip | course_xxx | franchise
  type         text not null,                 -- vip | course | franchise
  price        numeric(10,2) not null,
  cover_url    text,
  description  text,
  resource_id  uuid references public.resources(id) on delete set null,
  -- 授权后的动作
  grants_vip      boolean not null default false,
  grants_franchise boolean not null default false,
  is_active    boolean not null default true,
  sort_order   integer default 0,
  created_at   timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "anyone can read active products"
  on public.products for select using (is_active = true);
create policy "service role manage products"
  on public.products for all using (true) with check (true);

-- ----------------------------------------------------------------
-- 2. 重构 orders 表（兼容旧结构，新增微信收款字段）
-- ----------------------------------------------------------------

-- 新增列（如已存在会报错可忽略）
alter table public.orders
  add column if not exists product_id       uuid references public.products(id) on delete set null,
  add column if not exists product_name     text,
  add column if not exists product_type     text,             -- vip | course | franchise
  -- 微信收款码模式专属
  add column if not exists wechat_nickname  text,             -- 用户填写的微信昵称
  add column if not exists paid_amount      numeric(10,2),    -- 用户填写的付款金额
  add column if not exists paid_at_claimed  text,             -- 用户填写的付款时间（文本）
  add column if not exists screenshot_url   text,             -- 付款截图 URL
  -- 审核
  add column if not exists review_note      text,             -- 管理员审核备注
  add column if not exists reviewed_by      text,             -- 审核管理员邮箱
  add column if not exists reviewed_at      timestamptz;

-- 更新 status 含义（兼容旧值）：
--   pending          → 创建订单，未提交凭证
--   pending_review   → 已提交截图，等待审核
--   paid             → 审核通过，权益已发放
--   rejected         → 审核拒绝
--   refunded         → 已退款
--   cancelled        → 已取消

-- payment_provider 保留字段，值为 'wechat_qr' 或未来 'wechat_api'|'alipay'|'stripe'
-- payment_id       保留字段，微信订单模式填 null，API支付填交易号

-- ----------------------------------------------------------------
-- 3. user_grants  用户已解锁的单独课程（非VIP单课购买）
-- ----------------------------------------------------------------
create table if not exists public.user_grants (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  order_id    uuid references public.orders(id) on delete set null,
  granted_at  timestamptz not null default now(),
  unique (user_id, resource_id)
);
alter table public.user_grants enable row level security;
create policy "users view own grants"
  on public.user_grants for select using (auth.uid() = user_id);
create policy "service role manage grants"
  on public.user_grants for all using (true) with check (true);

-- ----------------------------------------------------------------
-- 4. profiles 新增站长身份字段
-- ----------------------------------------------------------------
alter table public.profiles
  add column if not exists is_franchise boolean not null default false;

-- ----------------------------------------------------------------
-- 5. fulfill_order_v2  审核通过后的授权函数
-- ----------------------------------------------------------------
create or replace function public.fulfill_order_v2(p_order_id uuid, p_admin_email text)
returns jsonb language plpgsql security definer as $$
declare
  v_order      public.orders%rowtype;
  v_referrer   uuid;
  v_comm       numeric;
  v_result     jsonb;
begin
  -- 取订单
  select * into v_order from public.orders where id = p_order_id;
  if not found then return jsonb_build_object('ok', false, 'error', 'order not found'); end if;
  if v_order.status not in ('pending_review') then
    return jsonb_build_object('ok', false, 'error', 'order not in pending_review status');
  end if;

  -- 标记审核通过
  update public.orders set
    status       = 'paid',
    paid_at      = now(),
    reviewed_by  = p_admin_email,
    reviewed_at  = now(),
    payment_provider = coalesce(payment_provider, 'wechat_qr')
  where id = p_order_id;

  -- 按商品类型发放权益
  case v_order.product_type
    when 'vip' then
      update public.profiles set is_vip = true, vip_expire_at = null where id = v_order.user_id;

    when 'franchise' then
      update public.profiles set is_franchise = true where id = v_order.user_id;

    when 'course' then
      -- 解锁单独课程
      if v_order.product_id is not null then
        declare v_resource_id uuid;
        begin
          select resource_id into v_resource_id from public.products where id = v_order.product_id;
          if v_resource_id is not null then
            insert into public.user_grants (user_id, resource_id, order_id)
            values (v_order.user_id, v_resource_id, p_order_id)
            on conflict (user_id, resource_id) do nothing;
          end if;
        end;
      end if;

    else null;
  end case;

  -- 推广佣金
  select referrer_id into v_referrer from public.ref_registrations where referred_user_id = v_order.user_id;
  if v_referrer is not null then
    v_comm := round(v_order.amount * 0.8, 2);
    insert into public.referrals (referrer_id, referred_user_id, order_id, commission_amount, status)
    values (v_referrer, v_order.user_id, p_order_id, v_comm, 'pending')
    on conflict do nothing;
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

-- ----------------------------------------------------------------
-- 6. reject_order  拒绝审核
-- ----------------------------------------------------------------
create or replace function public.reject_order(p_order_id uuid, p_admin_email text, p_note text)
returns jsonb language plpgsql security definer as $$
begin
  update public.orders set
    status      = 'rejected',
    review_note = p_note,
    reviewed_by = p_admin_email,
    reviewed_at = now()
  where id = p_order_id and status = 'pending_review';

  if not found then return jsonb_build_object('ok', false, 'error', 'order not found or wrong status'); end if;
  return jsonb_build_object('ok', true);
end;
$$;

-- ----------------------------------------------------------------
-- 7. Supabase Storage bucket for payment screenshots
-- ----------------------------------------------------------------
-- 在 Supabase Dashboard → Storage 中创建一个 bucket 叫 "payment-screenshots"
-- 设置为 public read（或用 signed URL），允许认证用户上传
-- 以下是对应的 Storage policy（在 SQL Editor 执行）：

insert into storage.buckets (id, name, public)
values ('payment-screenshots', 'payment-screenshots', false)
on conflict (id) do nothing;

create policy "auth users can upload screenshots"
  on storage.objects for insert
  with check (bucket_id = 'payment-screenshots' and auth.role() = 'authenticated');

create policy "auth users can view own screenshots"
  on storage.objects for select
  using (bucket_id = 'payment-screenshots' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "service role manage screenshots"
  on storage.objects for all
  using (bucket_id = 'payment-screenshots');

-- ----------------------------------------------------------------
-- 8. 默认商品数据
-- ----------------------------------------------------------------
insert into public.products (name, slug, type, price, description, grants_vip, grants_franchise, sort_order) values
  ('VIP终身会员', 'vip', 'vip', 99, '解锁全站 1000+ 精选资源，持续更新，永久有效。包含AI实战、自媒体、电商、短视频、创业项目全部内容。', true, false, 1),
  ('站长加盟套餐', 'franchise', 'franchise', 998, '获得同款网站源码、一键部署教程、AI运营提示词大礼包、1000+资源同步更新、1v1运营指导服务。', false, true, 2)
on conflict (slug) do nothing;
