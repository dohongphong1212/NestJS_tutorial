import type { ReactNode } from 'react';

/** Ô nhập liệu có icon dẫn đầu và phần tử phụ tuỳ chọn (vd nút hiện mật khẩu). */
export function Field({
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
  icon: ReactNode;
  value: string;
  onChange: (v: string) => void;
  type: string;
  placeholder?: string;
  autoComplete?: string;
  trailing?: ReactNode;
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
