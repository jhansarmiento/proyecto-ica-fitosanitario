type FeatureItemProps = {
  text: string;
  icon: React.ReactNode;
};

function FeatureItem({ text, icon }: FeatureItemProps) {
  return (
    <div className="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition-all duration-300 hover:bg-white/5">
      
      <div className="grid h-8 w-8 place-items-center rounded-lg border border-emerald-300/35 bg-emerald-300/15 text-emerald-200 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] transition-all duration-300 group-hover:scale-105 group-hover:bg-emerald-300/25">
        {icon}
      </div>

      <span className="text-[1.03rem] font-medium text-emerald-50/95">
        {text}
      </span>
    </div>
  );
}

export default FeatureItem;