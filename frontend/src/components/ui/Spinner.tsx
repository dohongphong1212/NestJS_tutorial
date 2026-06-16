/** Vòng xoay loading dùng chung. */
export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <span
      className={`${className} animate-spin-slow rounded-full border-2 border-white/30 border-t-white`}
    />
  );
}
