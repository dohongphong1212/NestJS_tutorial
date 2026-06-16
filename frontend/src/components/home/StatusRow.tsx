import type { ConnState } from '@/types/auth';

/** Một dòng trạng thái kết nối (API / phiên / DB) với chấm màu + nhãn. */
export function StatusRow({
  label,
  hint,
  state,
}: {
  label: string;
  hint: string;
  state: ConnState;
}) {
  const meta = {
    checking: {
      text: 'Đang kiểm tra',
      dot: 'bg-amber-400',
      pill: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
    },
    ok: {
      text: 'Hoạt động',
      dot: 'bg-emerald-400',
      pill: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
    },
    down: {
      text: 'Mất kết nối',
      dot: 'bg-rose-400',
      pill: 'border-rose-400/30 bg-rose-500/10 text-rose-200',
    },
  }[state];

  return (
    <li className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div>
        <p className="font-medium text-white/90">{label}</p>
        <p className="text-xs text-white/45">{hint}</p>
      </div>
      <span
        className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${meta.pill}`}
      >
        <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
        {meta.text}
      </span>
    </li>
  );
}
