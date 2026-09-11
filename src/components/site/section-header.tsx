export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={`mx-auto mb-10 max-w-2xl md:mb-14 ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B08968]">
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl leading-tight tracking-tight text-stone-900 md:text-[2.75rem]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-[15px] leading-relaxed text-stone-500">{subtitle}</p>
      ) : null}
    </div>
  );
}
