-- ================================================
-- QCY轻创业资源库  数据库 Schema
-- 在 Supabase SQL Editor 中完整执行此文件
-- ================================================

create extension if not exists "uuid-ossp";

-- 1. profiles
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  email          text not null,
  nickname       text,
  is_vip         boolean not null default false,
  vip_expire_at  timestamptz,
  ref_code       text unique,
  created_at     timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "service role full access profiles" on public.profiles for all using (true) with check (true);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, nickname, ref_code)
  values (new.id, new.email, split_part(new.email, '@', 1),
          substring(replace(new.id::text, '-', ''), 1, 8));
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute procedure public.handle_new_user();

-- 2. resources
create table if not exists public.resources (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  category    text not null,
  description text,
  cover_url   text,
  pan_url     text,
  is_vip      boolean not null default true,
  sort_order  integer default 0,
  created_at  timestamptz not null default now()
);
alter table public.resources enable row level security;
create policy "anyone can read resources" on public.resources for select using (true);
create policy "service role manage resources" on public.resources for all using (true) with check (true);

-- 3. orders
create table if not exists public.orders (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  amount           numeric(10,2) not null,
  status           text not null default 'pending',
  payment_provider text,
  payment_id       text,
  created_at       timestamptz not null default now(),
  paid_at          timestamptz
);
alter table public.orders enable row level security;
create policy "users view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "service role manage orders" on public.orders for all using (true) with check (true);

-- 4. referrals
create table if not exists public.referrals (
  id                uuid primary key default uuid_generate_v4(),
  referrer_id       uuid not null references public.profiles(id) on delete cascade,
  referred_user_id  uuid not null references public.profiles(id) on delete cascade,
  order_id          uuid references public.orders(id) on delete set null,
  commission_amount numeric(10,2),
  status            text not null default 'pending',
  created_at        timestamptz not null default now()
);
alter table public.referrals enable row level security;
create policy "referrers view own referrals" on public.referrals for select using (auth.uid() = referrer_id);
create policy "service role manage referrals" on public.referrals for all using (true) with check (true);

-- 5. ref_registrations
create table if not exists public.ref_registrations (
  id               uuid primary key default uuid_generate_v4(),
  referrer_id      uuid not null references public.profiles(id) on delete cascade,
  referred_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at       timestamptz not null default now(),
  unique (referred_user_id)
);
alter table public.ref_registrations enable row level security;
create policy "service role manage ref_registrations" on public.ref_registrations for all using (true) with check (true);

-- 6. fulfill_order function
create or replace function public.fulfill_order(p_order_id uuid)
returns void language plpgsql security definer as $$
declare
  v_user_id  uuid;
  v_amount   numeric;
  v_referrer uuid;
  v_comm     numeric;
begin
  update public.orders set status = 'paid', paid_at = now()
  where id = p_order_id and status = 'pending'
  returning user_id, amount into v_user_id, v_amount;
  if v_user_id is null then return; end if;
  update public.profiles set is_vip = true, vip_expire_at = null where id = v_user_id;
  select referrer_id into v_referrer from public.ref_registrations where referred_user_id = v_user_id;
  if v_referrer is not null then
    v_comm := round(v_amount * 0.8, 2);
    insert into public.referrals (referrer_id, referred_user_id, order_id, commission_amount, status)
    values (v_referrer, v_user_id, p_order_id, v_comm, 'pending');
  end if;
end;
$$;

-- 7. sample data
insert into public.resources (title, category, description, pan_url, is_vip, sort_order) values
('ChatGPT变现实战全攻略 2024','ai','从零学会ChatGPT，掌握写作变现、项目策划、自动化工作流，含完整提示词模板库。','https://pan.baidu.com/placeholder',true,1),
('Midjourney商业变现·AI绘画接单全流程','ai','系统掌握AI绘画技巧，商业订单接单攻略、高转化提示词、作品集搭建。','https://pan.baidu.com/placeholder',true,2),
('AI视频创作变现·可灵/即梦实战课','ai','用AI生成高质量短视频，矩阵运营+内容变现，零基础可学。','https://pan.baidu.com/placeholder',true,3),
('小红书0粉起号·万粉变现完整路径','media','从账号定位到内容规划到粉丝变现，全套可复制的小红书运营方法论。','https://pan.baidu.com/placeholder',true,1),
('微信公众号流量主变现课','media','快速涨粉开通流量主，选题、排版、涨粉、广告变现全链路。','https://pan.baidu.com/placeholder',true,2),
('拼多多无货源店群·从开店到月入过万','ecommerce','无需备货，完整讲解店群模式下的选品、上架、客服、物流全流程。','https://pan.baidu.com/placeholder',true,1),
('抖音小店运营实战·从0到爆单','ecommerce','抖音电商从选品到投流全流程，达人带货+直播运营+数据分析。','https://pan.baidu.com/placeholder',true,2),
('抖音短视频运营·从0到百万粉丝','video','账号搭建、内容选题、拍摄剪辑、算法推流核心技能，含爆款选题库。','https://pan.baidu.com/placeholder',true,1),
('手机剪辑实战·剪映进阶全套教程','video','从基础操作到高级特效，手机剪出专业级视频，零基础可用。','https://pan.baidu.com/placeholder',true,2),
('跨平台数字商品搬运·信息差套利','project','挖掘国内外平台信息差，低买高卖数字资源，含选品+定价+批量操作SOP。','https://pan.baidu.com/placeholder',true,1),
('一人公司·轻创业项目落地手册','project','适合个人或小团队的轻量创业模型，从选赛道到产品上线的完整实操指南。','https://pan.baidu.com/placeholder',true,2)
on conflict do nothing;
