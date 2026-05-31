type CheckboxFieldProps = {
  label: string;
  id: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
};

function CheckboxField({ label, id, checked = false, onChange }: CheckboxFieldProps) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2.5 text-emerald-50/95">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-4.5 w-4.5 rounded border-white/30 bg-transparent accent-emerald-300 transition"
      />
      <span className="text-[0.98rem] font-medium">{label}</span>
    </label>
  );
}

export default CheckboxField;
