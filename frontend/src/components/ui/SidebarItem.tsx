import type { ReactNode } from "react";

type SidebarItemProps = {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  hasChevron?: boolean;
};

function SidebarItem({
  label,
  icon,
  active = false,
  hasChevron = false,
}: SidebarItemProps) {
  return (
    <div
      className={[
        "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-300",
        active
          ? "bg-white text-emerald-900 shadow-[0_10px_25px_rgba(16,185,129,0.18)]"
          : "text-emerald-50/90 hover:bg-white/10 hover:text-white",
      ].join(" ")}
    >
      {/* Barra lateral izquierda */}
      <span
        className={[
          "absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full transition-all duration-300",
          active
            ? "bg-emerald-400 opacity-100"
            : "bg-emerald-300/0 opacity-0 group-hover:opacity-70",
        ].join(" ")}
      />

      {/* Ícono */}
      <span
        className={[
          "flex items-center justify-center transition-all duration-300",
          active
            ? "text-emerald-700"
            : "text-emerald-200 group-hover:text-white",
        ].join(" ")}
      >
        {icon}
      </span>

      {/* Texto */}
      <span className="flex-1 text-[1.02rem] font-semibold tracking-tight">
        {label}
      </span>

      {/* Chevron */}
      {hasChevron && (
        <span className="text-xs opacity-80 transition-transform duration-300 group-hover:-rotate-180">
          ⌄
        </span>
      )}
    </div>
  );
}
export default SidebarItem;