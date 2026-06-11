'use client';

import { useState } from 'react';
import { login, register, type AuthUser } from '@/lib/api';

type Mode = 'login' | 'register';

export default function LoginPage() {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {/* ===== Nền tĩnh (vẽ một lần, không animation -> không lag) ===== */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Quầng sáng tĩnh bằng radial-gradient (rẻ hơn nhiều so với blur lớn) */}
        <div className="absolute inset-0 bg-[radial-gradient(40rem_30rem_at_15%_15%,rgba(217,70,239,0.18),transparent),radial-gradient(40rem_30rem_at_85%_85%,rgba(34,211,238,0.16),transparent),radial-gradient(45rem_35rem_at_60%_30%,rgba(99,102,241,0.16),transparent)]" />
        {/* Lưới mờ tĩnh */}
        <div className="absolute inset-0 opacity-[0.10] [background-image:linear-gradient(to_right,rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#05030f_95%)]" />
      </div>

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
                    {loading && (
                      <span className="h-4 w-4 animate-spin-slow rounded-full border-2 border-white/40 border-t-white" />
                    )}
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

/* ===================== Thành phần phụ ===================== */

function SuccessView({ user, mode }: { user: AuthUser; mode: Mode }) {
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
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg py-2 font-medium transition-all ${
        active
          ? 'bg-gradient-to-r from-violet-500/80 to-fuchsia-500/80 text-white shadow-lg'
          : 'text-white/50 hover:text-white/80'
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  icon,
  value,
  onChange,
  type,
  placeholder,
  autoComplete,
  trailing,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  type: string;
  placeholder?: string;
  autoComplete?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-white/70">
        {label}
      </span>
      <div className="group relative flex items-center rounded-xl border border-white/10 bg-white/5 transition-all focus-within:border-violet-400/60 focus-within:bg-white/[0.08] focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.15)]">
        <span className="pl-3.5 text-white/40 transition group-focus-within:text-violet-300">
          {icon}
        </span>
        <input
          required
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent px-3 py-3 text-white placeholder:text-white/30 focus:outline-none"
        />
        {trailing && <span className="pr-3.5">{trailing}</span>}
      </div>
    </label>
  );
}

/* ===================== Icon ===================== */

const iconProps = {
  className: 'h-5 w-5',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function IconUser() {
  return (
    <svg {...iconProps}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg {...iconProps}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
function IconAt() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg {...iconProps}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconEye() {
  return (
    <svg {...iconProps}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconEyeOff() {
  return (
    <svg {...iconProps}>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}
function IconAlert() {
  return (
    <svg {...iconProps} className="h-5 w-5 shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}
