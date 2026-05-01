type StatItemProps = {
  value: string;
  label: string;
};

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="min-w-[96px]">
      <h3 className="text-[2.2rem] font-extrabold leading-none tracking-tight text-white">{value}</h3>
      <p className="mt-1 text-[1.02rem] font-semibold text-emerald-300/95">{label}</p>
    </div>
  );
}

export default StatItem;
