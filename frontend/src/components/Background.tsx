/**
 * Nền tĩnh dùng chung cho các trang (gradient + lưới mờ + vignette).
 * Vẽ một lần, không animation -> nhẹ, không gây lag.
 */
export function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      {/* Quầng sáng tĩnh bằng radial-gradient (rẻ hơn nhiều so với blur lớn) */}
      <div className="absolute inset-0 bg-[radial-gradient(40rem_30rem_at_15%_15%,rgba(217,70,239,0.18),transparent),radial-gradient(40rem_30rem_at_85%_85%,rgba(34,211,238,0.16),transparent),radial-gradient(45rem_35rem_at_60%_30%,rgba(99,102,241,0.16),transparent)]" />
      {/* Lưới mờ tĩnh */}
      <div className="absolute inset-0 opacity-[0.10] [background-image:linear-gradient(to_right,rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#05030f_95%)]" />
    </div>
  );
}
