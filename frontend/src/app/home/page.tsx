'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout, me } from '@/lib/api';
import type { AuthUser, ConnState } from '@/types/auth';
import { initials, formatDate } from '@/lib/format';
import { Background } from '@/components/Background';
import { Spinner } from '@/components/ui/Spinner';
import { InfoRow } from '@/components/home/InfoRow';
import { StatusRow } from '@/components/home/StatusRow';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  // Trạng thái các kết nối hiển thị trên trang chủ.
  const [apiState, setApiState] = useState<ConnState>('checking');
  const [sessionState, setSessionState] = useState<ConnState>('checking');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const u = await me();
        if (!active) return;
        setUser(u);
        setApiState('ok');
        setSessionState('ok');
      } catch {
        if (!active) return;
        // me() lỗi: hoặc máy chủ không phản hồi, hoặc chưa đăng nhập.
        setApiState('down');
        setSessionState('down');
        // Không có phiên hợp lệ -> quay lại trang đăng nhập.
        router.replace('/login');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // Bỏ qua lỗi: dù sao cũng đưa người dùng về trang đăng nhập.
    } finally {
      router.replace('/login');
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="flex items-center gap-3 text-white/60">
          <Spinner className="h-5 w-5" />
          Đang tải thông tin...
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10">
      <Background />

      <div className="mx-auto w-full max-w-4xl animate-card-in">
        {/* ===== Thanh đầu trang ===== */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[0_0_30px_-6px_rgba(139,92,246,0.8)]">
              <svg
                className="h-6 w-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2 2 7l10 5 10-5-10-5Z" />
                <path d="m2 17 10 5 10-5" />
                <path d="m2 12 10 5 10-5" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-white/50">Trang chủ</p>
              <h1 className="shimmer-text text-xl font-bold">Bảng điều khiển</h1>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut ? (
              <Spinner />
            ) : (
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            )}
            Đăng xuất
          </button>
        </header>

        {/* ===== Lời chào ===== */}
        <section className="mb-6 overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] p-6 shadow-[0_8px_60px_-12px_rgba(124,58,237,0.4)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl font-bold text-white shadow-[0_0_40px_-6px_rgba(139,92,246,0.8)]">
              {initials(user.name)}
            </div>
            <div>
              <p className="text-sm text-white/50">Xin chào,</p>
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <p className="mt-1 text-white/60">
                Bạn đã đăng nhập thành công vào hệ thống.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          {/* ===== Thông tin người dùng ===== */}
          <section className="rounded-3xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-xl sm:p-7">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <svg
                className="h-5 w-5 text-violet-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Thông tin người dùng
            </h3>
            <dl className="space-y-3 text-sm">
              <InfoRow label="Mã người dùng" value={`#${user.id}`} />
              <InfoRow label="Họ và tên" value={user.name} />
              <InfoRow label="Tài khoản" value={user.username} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Ngày tạo" value={formatDate(user.createdAt)} />
              <InfoRow
                label="Cập nhật gần nhất"
                value={formatDate(user.updatedAt)}
              />
            </dl>
          </section>

          {/* ===== Trạng thái các kết nối ===== */}
          <section className="rounded-3xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-xl sm:p-7">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <svg
                className="h-5 w-5 text-cyan-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h.01" />
                <path d="M8.5 16.43a5 5 0 0 1 7 0" />
                <path d="M5 12.85a10 10 0 0 1 14 0" />
                <path d="M1.5 9.28a15 15 0 0 1 21 0" />
              </svg>
              Trạng thái kết nối
            </h3>
            <ul className="space-y-3">
              <StatusRow
                label="Máy chủ API"
                hint="Backend NestJS (cổng 3000)"
                state={apiState}
              />
              <StatusRow
                label="Phiên đăng nhập"
                hint="Access token (cookie HttpOnly)"
                state={sessionState}
              />
              <StatusRow
                label="Cơ sở dữ liệu"
                hint="PostgreSQL qua Prisma"
                // /auth/me truy vấn DB thành công => DB đang hoạt động.
                state={sessionState}
              />
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
