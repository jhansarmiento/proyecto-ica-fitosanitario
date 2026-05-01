import type { InputHTMLAttributes } from 'react';

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

function TextInput({ label, ...props }: TextInputProps) {
  return (
    <label className="flex flex-col gap-2.5">
      <span className="text-[1rem] font-medium text-emerald-50/90">{label}</span>
      <input
        className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none placeholder:text-emerald-50/50 transition-all duration-300 focus:border-emerald-300/70 focus:bg-white/15 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.18)]"
        {...props}
      />
    </label>
  );
}

export default TextInput;
