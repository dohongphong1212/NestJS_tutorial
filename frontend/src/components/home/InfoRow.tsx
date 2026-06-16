/** Một dòng thông tin "nhãn — giá trị" trong thẻ hồ sơ người dùng. */
export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <dt className="text-white/50">{label}</dt>
      <dd className="text-right font-medium text-white/90">{value}</dd>
    </div>
  );
}
