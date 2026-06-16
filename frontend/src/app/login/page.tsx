'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, me, register } from '@/lib/api';
import type { AuthUser, Mode } from '@/types/auth';
import { Background } from '@/components/Background';
import { Spinner } from '@/components/ui/Spinner';
import { Field } from '@/components/ui/Field';
import { TabButton } from '@/components/ui/TabButton';
import { SuccessView } from '@/components/auth/SuccessView';
import {
  IconAlert,
  IconAt,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconUser,
} from '@/components/icons';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Đã có phiên hợp lệ (mở lại khi token còn hạn) -> vào thẳng trang chủ,
  // không bắt đăng nhập lại.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await me();
        if (active) router.replace('/home');
      } catch {
        // Chưa đăng nhập -> ở lại trang này.
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Token được backend đặt vào cookie HttpOnly; client không tự lưu.
      const res =
        mode === 'login'
          ? await login(username, password)
          : await register(name, username, email, password);
      setUser(res);
      // Hiện màn hình chào mừng một nhịp ngắn rồi vào trang chủ.
      setTimeout(() => router.replace('/home'), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <Background />

      {/* ===== Thẻ kính ===== */}
      <div className="relative w-full max-w-md animate-card-in">
        {/* Viền gradient phát sáng (tĩnh) */}
        <div className="absolute -inset-[1px] rounded-[26px] bg-gradient-to-br from-violet-400/60 via-transparent to-cyan-300/60 opacity-80" />

        <div className="relative overflow-hidden rounded-[25px] border border-white/15 bg-white/[0.06] p-8 shadow-[0_8px_60px_-12px_rgba(124,58,237,0.5)] backdrop-blur-xl sm:p-10">
          {/* Ánh sáng quét trên cùng */}
          <div className="pointer-events-none absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

          {user ? (
            <SuccessView user={user} mode={mode} />
          ) : (
            <>
              {/* Logo orb */}
              <div className="mb-6 flex flex-col items-center">
                <div className="relative mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[0_0_40px_-4px_rgba(139,92,246,0.8)]">
                  <div className="absolute inset-0 rounded-2xl bg-white/20 blur-md" />
                  <svg
                    className="relative h-8 w-8 text-white"
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
                <h1 className="shimmer-text text-2xl font-bold tracking-tight">
                  {mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
                </h1>
                <p className="mt-1 text-sm text-white/50">
                  {mode === 'login'
                    ? 'Đăng nhập để tiếp tục hành trình của bạn'
                    : 'Chỉ vài bước để bắt đầu'}
                </p>
              </div>

              {/* Tab chuyển chế độ */}
              <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1 text-sm">
                <TabButton
                  active={mode === 'login'}
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                >
                  Đăng nhập
                </TabButton>
                <TabButton
                  active={mode === 'register'}
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                >
                  Đăng ký
                </TabButton>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <Field
                    label="Họ và tên"
                    icon={<IconUser />}
                    value={name}
                    onChange={setName}
                    type="text"
                    placeholder="Nguyễn Văn A"
                    autoComplete="name"
                  />
                )}

                <Field
                  label="Tài khoản"
                  icon={<IconAt />}
                  value={username}
                  onChange={setUsername}
                  type="text"
                  placeholder="vidu: nguyenvana"
                  autoComplete="username"
                />

                {mode === 'register' && (
                  <Field
                    label="Email"
                    icon={<IconMail />}
                    value={email}
                    onChange={setEmail}
                    type="email"
                    placeholder="ban@email.com"
                    autoComplete="email"
                  />
                )}

                <Field
                  label="Mật khẩu"
                  icon={<IconLock />}
                  value={password}
                  onChange={setPassword}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="text-white/40 transition hover:text-white/80"
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <IconEyeOff /> : <IconEye />}
                    </button>
                  }
                />

                {mode === 'login' && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex cursor-pointer items-center gap-2 text-white/60">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 bg-white/10 accent-violet-500"
                      />
                      Ghi nhớ đăng nhập
                    </label>
                    <button
                      type="button"
                      className="text-violet-300 transition hover:text-violet-200"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    <IconAlert />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-4 py-3.5 font-semibold text-white shadow-[0_8px_30px_-8px_rgba(139,92,246,0.9)] transition-all duration-300 hover:shadow-[0_8px_40px_-6px_rgba(139,92,246,1)] hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading && <Spinner />}
                    {loading
                      ? 'Đang xử lý...'
                      : mode === 'login'
                        ? 'Đăng nhập'
                        : 'Tạo tài khoản'}
                  </span>
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-white/50">
                {mode === 'login' ? (
                  <>
                    Chưa có tài khoản?{' '}
                    <button
                      onClick={() => {
                        setMode('register');
                        setError(null);
                      }}
                      className="font-medium text-violet-300 transition hover:text-violet-200"
                    >
                      Đăng ký ngay
                    </button>
                  </>
                ) : (
                  <>
                    Đã có tài khoản?{' '}
                    <button
                      onClick={() => {
                        setMode('login');
                        setError(null);
                      }}
                      className="font-medium text-violet-300 transition hover:text-violet-200"
                    >
                      Đăng nhập
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
