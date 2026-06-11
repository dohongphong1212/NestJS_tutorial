# first_nestjs — Auth Monorepo

Dự án học tập gồm **backend (NestJS)** và **frontend (Next.js)** với luồng đăng nhập / đăng ký bằng JWT.
Giao diện đăng nhập theo phong cách **Glassmorphism + Aurora**.

```
backend/    NestJS 11 + Prisma + PostgreSQL  → http://localhost:3000
frontend/   Next.js 15 + React 19 + Tailwind → http://localhost:3001
```

## Khởi chạy nhanh (dev)

```bash
# 1) Backend
cd backend
pnpm install
docker compose up -d            # PostgreSQL
pnpm prisma migrate dev
pnpm start:dev                  # API ở cổng 3000

# 2) Frontend (cửa sổ terminal khác)
cd frontend
pnpm install
pnpm dev                        # web ở cổng 3001
```

Mở http://localhost:3001 — sẽ tự chuyển tới trang `/login`.

## API

| Method | Route | Mô tả |
|--------|-------|-------|
| POST | `/auth/register` | Đăng ký (name, email, password) |
| POST | `/auth/login` | Đăng nhập (email, password) |
| GET | `/auth/me` | Thông tin user (cần Bearer token) |

Xem chi tiết kiến trúc & quy ước trong [CLAUDE.md](CLAUDE.md).
# NestJS_tutorial
