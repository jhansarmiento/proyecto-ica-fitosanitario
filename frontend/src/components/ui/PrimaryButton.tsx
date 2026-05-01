import type { ButtonHTMLAttributes } from 'react';

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

function PrimaryButton({ children, ...props }: PrimaryButtonProps) {
  return (
    <button
          className="rounded-xl bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 px-5 py-3.5 text-[1.02rem] font-extrabold text-white shadow-[0_10px_25px_rgba(16,185,129,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(16,185,129,0.45)] active:translate-y-0 active:shadow-[0_8px_20px_rgba(16,185,129,0.3)]"
      {...props}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
