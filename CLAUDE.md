# CLAUDE.md

Hướng dẫn cho Claude Code khi làm việc trong repo này.

## Tổng quan dự án

Dự án học tập gồm **2 phần** trong một monorepo:

- **`backend/`** — REST API authentication bằng **NestJS 11** (JWT qua cookie, Prisma, PostgreSQL).
- **`frontend/`** — giao diện web bằng **Next.js 15 + React 19 + Tailwind v4**,
  trang đăng nhập/đăng ký phong cách **Glassmorphism** (nền tĩnh, không animation chạy nền).

Luồng auth (đăng ký, đăng nhập, refresh, đăng xuất, `/me`) đã implement đầy đủ, dùng
**access token + refresh token đặt trong cookie HttpOnly**.

## Cấu trúc thư mục (gốc repo)

```
.
├── CLAUDE.md
├── backend/      # NestJS API  (cổng 3000)
└── frontend/     # Next.js app (cổng 3001)
```

---

## Backend (`backend/`)

### Stack
- NestJS 11 (Express), TypeScript 5.7 strict, target ES2023, module `nodenext`
- Prisma 7.8 + PostgreSQL 15 (Docker) — kết nối runtime qua **driver adapter** `@prisma/adapter-pg`
- Auth: `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`, `cookie-parser`
- Bảo mật: `@nestjs/throttler` (rate limit), `helmet` (security headers)
- Validation: `class-validator`, `class-transformer`
- Config: `dotenv` (nạp `.env` lúc runtime — xem `main.ts`)
- Lint/Format: ESLint + Prettier • Package manager: **pnpm**

> Không có test (đã gỡ toàn bộ). Toàn bộ mã nguồn là **TypeScript**; không commit file `.js`
> biên dịch vào `src/`. Không có endpoint `GET /` — API chỉ gồm `/auth/*`.

### Lệnh (chạy trong `backend/`)
```bash
pnpm install
docker compose up -d          # PostgreSQL (hoặc: docker start nest_postgres)
pnpm prisma migrate dev       # áp dụng migration + sinh lại Prisma Client
pnpm prisma generate          # chỉ sinh lại client (khi đổi schema)
pnpm start:dev                # dev watch (cổng 3000)
pnpm build && pnpm start:prod  # build ra dist/main.js
pnpm lint                     # eslint --fix
pnpm format                   # prettier --write
```

### Kiến trúc auth
- `src/prisma/` — `PrismaService` (extends `PrismaClient`, kết nối qua `PrismaPg` adapter +
  `DATABASE_URL`) + `PrismaModule` (global).
- `src/users/` — **tách 2 tầng** (service ↔ repository):
  - `users.repository.ts` — interface `UsersRepository` (hợp đồng truy cập DB) + token DI
    `USERS_REPOSITORY` (Symbol) + type `CreateUserData`. Service phụ thuộc abstraction này,
    KHÔNG đụng Prisma trực tiếp (Dependency Inversion → dễ mock/test, dễ đổi nguồn dữ liệu).
  - `prisma-users.repository.ts` — `PrismaUsersRepository implements UsersRepository`: tầng DB
    thuần, chỉ map sang truy vấn Prisma (`prisma.user.*`), không có logic nghiệp vụ.
  - `users.service.ts` — `UsersService`: tầng nghiệp vụ (`findByUsername`, `findByEmail`,
    `findById`, `create`, `setRefreshTokenHash`), uỷ thác mọi thao tác dữ liệu cho repository
    (inject qua `@Inject(USERS_REPOSITORY)`).
  - `users.module.ts` — bind token → impl: `{ provide: USERS_REPOSITORY, useClass: PrismaUsersRepository }`;
    chỉ `export` `UsersService`. Đổi nguồn dữ liệu sau này chỉ cần thay `useClass`.
- `src/auth/`
  - `dto/` — `RegisterDto` (name, username, email, password), `LoginDto` (username, password).
    Validation + message tiếng Việt. Mật khẩu đăng ký: 8–72 ký tự, có cả chữ và số.
  - `auth.service.ts` — `register`, `login`, `refresh` (xoay vòng), `logout`. `issueTokens`
    cấp access + refresh và lưu **sha256(refreshToken)** vào `User.refreshTokenHash`.
    Không bao giờ trả `password`/`refreshTokenHash`. Có bcrypt giả chống timing attack.
  - `auth.controller.ts` — `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`,
    `POST /auth/logout`, `GET /auth/me` (`JwtAuthGuard`). Set/clear cookie HttpOnly.
  - `strategies/jwt.strategy.ts` — đọc access token từ **cookie `access_token`** (không phải header).
  - `guards/jwt-auth.guard.ts`, `jwt-secret.ts` (đọc secret, fail-fast nếu thiếu/yếu).
- `src/main.ts` — `dotenv/config` → `cookieParser()` → `helmet()` → CORS (cho frontend,
  `credentials: true`) → `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`).
  `ThrottlerGuard` được đăng ký global trong `app.module.ts`.

### Token & bảo mật
- **Access token**: 15 phút, cookie `access_token` (path `/`).
- **Refresh token**: 7 ngày, cookie `refresh_token` (path `/auth`), ký bằng secret riêng;
  mỗi lần `/auth/refresh` cấp cặp mới + cập nhật hash (rotation). `/auth/logout` xoá hash → thu hồi.
- Cookie: `httpOnly`, `sameSite: 'strict'`, `secure` khi `NODE_ENV=production`.
- Rate limit: global 100/60s; `/auth/login` 5/60s; `/auth/register` 3/60s; `/auth/refresh` 20/60s.
- JWT thuật toán ghim `HS256`. Đăng ký trả message gộp (chống dò tài khoản tồn tại).

### Database — model `User` ([backend/prisma/schema.prisma](backend/prisma/schema.prisma))
| Field | Kiểu | Ghi chú |
|-------|------|---------|
| id | Int | PK, autoincrement |
| name | String | |
| username | String | unique — dùng để **đăng nhập** |
| email | String | unique |
| password | String | hash bcrypt |
| refreshTokenHash | String? | sha256 của refresh token hiện tại (null = đã đăng xuất) |
| createdAt / updatedAt | DateTime | |

> **Prisma 7**: datasource trong schema **chỉ có `provider`**, KHÔNG có `url`. URL cấp cho CLI
> qua [backend/prisma.config.ts](backend/prisma.config.ts); client runtime kết nối qua `PrismaPg` adapter.

### Biến môi trường (`backend/.env`)
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/nest_auth?sslmode=disable"
JWT_SECRET="<chuỗi ngẫu nhiên ≥ 32 ký tự>"
JWT_REFRESH_SECRET="<chuỗi ngẫu nhiên khác ≥ 32 ký tự>"
FRONTEND_URL="http://localhost:3001"   # (tuỳ chọn) origin cho CORS
```
Tạo secret: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.
Docker: container `nest_postgres`, DB `nest_auth`, user `postgres` / pass `password`, cổng `5432`.

---

## Frontend (`frontend/`)

### Stack
- Next.js 15 (App Router) + React 19 + TypeScript • Tailwind CSS v4 (`@tailwindcss/postcss`)
- Package manager: **pnpm** (cho phép build `sharp` qua `pnpm-workspace.yaml`)

### Lệnh (chạy trong `frontend/`)
```bash
pnpm install
pnpm dev      # dev (cổng 3001)
pnpm build && pnpm start
```
> Tránh chạy xen kẽ `pnpm build` rồi `pnpm dev` trên cùng máy; nếu lỡ, `rm -rf .next` trước khi `pnpm dev`.

### Cấu trúc
- `app/layout.tsx` — `lang="vi"`, `suppressHydrationWarning` (tránh cảnh báo do extension trình duyệt).
- `app/page.tsx` — redirect `/` → `/login`.
- `app/login/page.tsx` — trang đăng nhập/đăng ký (client component): thẻ kính, tab chuyển chế độ,
  show/hide mật khẩu, loading & lỗi, màn hình chào mừng. Nền **tĩnh** (gradient + lưới), chỉ còn
  hiệu ứng xuất hiện thẻ 1 lần và spinner khi loading — đã gỡ animation nền để tránh lag.
- `app/globals.css` — chỉ còn keyframes `card-in`, `spin-slow` + `prefers-reduced-motion`.
- `lib/api.ts` — gọi `/auth/login|register|refresh|logout` với **`credentials: 'include'`**
  (token nằm trong cookie HttpOnly, client KHÔNG tự lưu token). Map lỗi sang tiếng Việt.

### Biến môi trường (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Chạy toàn bộ (dev)
1. `docker start nest_postgres` (hoặc `cd backend && docker compose up -d`)
2. `cd backend && pnpm prisma migrate dev && pnpm start:dev`
3. `cd frontend && pnpm dev`
4. Mở http://localhost:3001 → tự chuyển tới `/login`.

## Quy ước & lưu ý khi code

- **Ngôn ngữ hiển thị**: mọi text cho người dùng (frontend lẫn message API) phải bằng **tiếng Việt**
  (message lỗi/thành công, validation, label...). Tên biến/hàm/comment kỹ thuật vẫn tiếng Anh.
- **Bcrypt**: luôn hash password trước khi lưu; không bao giờ trả `password`/`refreshTokenHash`.
- **Token**: đặt trong cookie HttpOnly (không dùng localStorage). Access 15', refresh 7 ngày + rotation.
- **JWT secret**: đọc qua `getJwtSecret`/`getRefreshSecret` (fail-fast, không có giá trị mặc định).
- **Validation**: dùng DTO + `class-validator`; `ValidationPipe` global đã bật `whitelist`.
- **Prisma**: chỉ tầng **repository** được phép gọi `prisma.*` trực tiếp; service KHÔNG đụng
  Prisma. Đổi schema phải chạy `prisma migrate`/`generate` rồi Restart TS Server trong VSCode.
- **Repository pattern**: mỗi nhóm dữ liệu tách 3 file — `*.repository.ts` (interface + token DI
  Symbol), `prisma-*.repository.ts` (impl Prisma), `*.service.ts` (logic, inject repo qua token).
  Module bind `{ provide: TOKEN, useClass: PrismaXxxRepository }`. Interface dùng làm kiểu tham số
  constructor phải `import type` (do `isolatedModules` + `emitDecoratorMetadata`).
- **Style**: single quotes, trailing comma `all`. Chạy `pnpm format` + `pnpm lint` trước khi commit.
- Mỗi thư mục (`backend`, `frontend`) có `package.json`/`node_modules` riêng — cài đặt độc lập.
- **Deploy thật**: đặt `NODE_ENV=production` (bật cookie `secure`), đổi DB sang `sslmode=require`.
