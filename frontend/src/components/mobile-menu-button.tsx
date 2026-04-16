"use client";

type MobileMenuButtonProps = {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
};

export const MobileMenuButton = ({ isOpen, onClick, className }: MobileMenuButtonProps) => {
  return (
    <button
      aria-expanded={isOpen}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 shadow-sm transition hover:border-brand-blue/30 hover:bg-brand-blue/5 ${className ?? ""}`}
      onClick={onClick}
      type="button"
    >
      <span className="relative h-4 w-5">
        <span
          className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-brand-ink transition ${isOpen ? "translate-y-[7px] rotate-45" : ""}`}
        />
        <span
          className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-brand-ink transition ${isOpen ? "opacity-0" : ""}`}
        />
        <span
          className={`absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-brand-ink transition ${isOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
        />
      </span>
    </button>
  );
};
