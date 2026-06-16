import type { ReactNode } from 'react';

/** Nút tab chuyển chế độ (đăng nhập / đăng ký). */
export function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
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
