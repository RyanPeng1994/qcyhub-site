# QCY轻创业资源库

Next.js 14 + Supabase + Vercel 全栈会员资源站

---

## 项目结构

```
src/
├── app/
│   ├── (auth)/login/         # 登录页
│   ├── (auth)/register/      # 注册页
│   ├── admin/                # 后台管理（仅 ADMIN_EMAILS）
│   ├── api/
│   │   ├── create-checkout/  # 创建订单
│   │   ├── payment-callback/ # 支付回调 webhook
│   │   ├── verify-order/     # 前端轮询订单状态
│   │   ├── resources/        # 资源 CRUD（管理员）
│   │   └── user/record-ref/  # 记录推广关系
│   ├── auth/callback/        # Supabase 邮件验证回调
│   ├── franchise/            # 站长加盟页
│   ├── promote/              # 推广赚钱页
│   ├── refund-policy/        # 退款政策页
│   ├── resources/            # 课程资源列表
│   ├── vip/                  # VIP购买页 + 待支付页
│   ├── layout.tsx
│   └── page.tsx              # 首页
├── components/
│   ├── layout/               # Navbar, Footer
│   └── ui/                   # Button, Card, Badge, Input, ResourceCard
├── hooks/useUser.ts          # 客户端用户状态
├── lib/
│   ├── supabase-browser.ts   # 客户端 Supabase
│   ├── supabase-server.ts    # 服务端 Supabase（带 cookies）
│   ├── supabase-admin.ts     # service_role 客户端（API专用）
│   └── utils.ts              # 工具函数 / 常量
├── middleware.ts             # 推广码 cookie + session 刷新
└── types/index.ts            # TypeScript 类型定义
```

---

## 第一步：创建 Supabase 项目

1. 前往 https://supabase.com → New Project
2. 记录：
   - Project URL：`https://xxxx.supabase.co`
   - anon key（公开密钥）
   - service_role key（仅在服务端使用，不要泄露）
3. 进入 **SQL Editor** → 复制粘贴 `supabase/schema.sql` 全部内容 → Run
4. 进入 **Authentication → Email** 开启 Email Auth
5. 在 **Authentication → URL Configuration** 添加：
   - Site URL: `https://你的域名.vercel.app`
   - Redirect URLs: `https://你的域名.vercel.app/auth/callback`

---

## 第二步：配置环境变量

复制 `.env.local.example` 为 `.env.local`：

```bash
cp .env.local.example .env.local
```

填入真实值：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
ADMIN_EMAILS=your@email.com
NEXT_PUBLIC_APP_URL=https://你的域名.vercel.app
```

---

## 第三步：本地开发

```bash
npm install
npm run dev
# 访问 http://localhost:3000
```

---

## 第四步：部署到 Vercel

```bash
npm install -g vercel
vercel login
vercel
```

或者直接在 Vercel 控制台：
1. Import GitHub Repository
2. Framework Preset: Next.js
3. Environment Variables → 添加以上全部变量
4. Deploy

---

## 第五步：接入真实支付

打开 `src/app/api/create-checkout/route.ts`，找到注释掉的 provider case：

### Stripe（推荐，支持国际支付）

```bash
npm install stripe
```

在 Stripe Dashboard 创建 Product + Price，取得 `price_xxx`，
取消注释 `case 'stripe'`，填入 `price_xxx`。

Webhook 配置：`/api/payment-callback`，事件：`checkout.session.completed`

### 爱发电（国内，支持微信/支付宝，无商户资质要求）

参考爱发电开放平台文档，实现 `case 'aifadian'`。

### Lemon Squeezy（国际，类 Stripe）

```bash
npm install @lemonsqueezy/lemonsqueezy.js
```

### 微信支付 / 支付宝（需企业主体 + 商户资质）

实现对应 case，接入 jsapi 或 native 支付。

---

## 权限逻辑说明

| 状态 | 可见内容 |
|------|----------|
| 未登录 | 课程标题 + 简介，无网盘链接 |
| 已登录非VIP | 同上，显示「开通VIP解锁」按钮 |
| VIP用户 | 全部内容 + 网盘链接按钮 |
| 管理员 | 额外访问 `/admin` 后台 |

- `pan_url` 字段通过 server component 条件 select 控制，非VIP用户的请求不返回此字段
- 所有 API 均在服务端验证 session，无法通过前端绕过
- 管理员通过 `ADMIN_EMAILS` 环境变量控制，无需数据库字段

---

## 推广系统说明

1. 用户访问 `/?ref=abc123` → middleware 写入 cookie `qcy_ref=abc123`
2. 注册时，register 页面读取 `?ref` 参数，调用 `/api/user/record-ref` 记录推荐关系
3. 被推荐用户购买VIP → `fulfill_order()` PostgreSQL 函数自动生成 `referrals` 记录
4. 管理员在 `/admin` 查看佣金记录，手动线下结算后更新 status 为 `settled`

---

## 添加资源

**方式一（推荐）**：登录管理员账号，访问 `/admin`，在「添加资源」表单中填写。

**方式二**：直接在 Supabase 控制台 → Table Editor → resources 表插入数据。
