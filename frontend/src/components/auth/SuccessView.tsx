import { Spinner } from '@/components/ui/Spinner';
import type { AuthUser, Mode } from '@/types/auth';

/** Màn hình chào mừng hiển thị một nhịp ngắn sau khi đăng nhập/đăng ký thành công. */
export function SuccessView({ user, mode }: { user: AuthUser; mode: Mode }) {
  return (
    <div className="flex flex-col items-center py-6 text-center animate-card-in">
      <div className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-[0_0_50px_-6px_rgba(16,185,129,0.9)]">
        <svg
          className="h-10 w-10 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white">
        {mode === 'login' ? 'Đăng nhập thành công!' : 'Tạo tài khoản thành công!'}
      </h2>
      <p className="mt-2 text-white/60">
        Xin chào{' '}
        <span className="font-semibold text-violet-300">{user.name}</span>, rất
        vui được gặp lại bạn.
      </p>
      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/50">
        {user.email}
      </div>
      <div className="mt-5 flex items-center gap-2 text-sm text-white/50">
        <Spinner />
        Đang chuyển tới trang chủ...
      </div>
    </div>
  );
}
