interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  gradient: string;
}

export const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  color,
  gradient,
}: StatCardProps) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 ${gradient} border border-white/10`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black text-white">{value}</p>
          {sub && <p className="mt-1 text-xs opacity-60 text-white">{sub}</p>}
        </div>
        <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur-sm">
          <Icon className="size-5 text-white" />
        </div>
      </div>
      <div
        className="absolute -right-6 -bottom-6 size-24 rounded-full opacity-20"
        style={{ background: color }}
      />
    </div>
  );
};
