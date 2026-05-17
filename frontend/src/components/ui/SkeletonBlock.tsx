type SkeletonBlockProps = {
  className?: string;
};

function SkeletonBlock({ className = '' }: SkeletonBlockProps) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

export default SkeletonBlock;
