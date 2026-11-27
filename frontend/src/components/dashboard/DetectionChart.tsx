import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DetectionChartProps {
  breakdown?: Record<string, number>;
}

const CLASS_CONFIG: Record<string, { label: string; color: string }> = {
  'Normal Activity': { label: 'Normal Activity', color: '#10b981' },
  Fight: { label: 'Fight / Violence', color: '#ef4444' },
  Fall: { label: 'Fall Hazard', color: '#f59e0b' },
  Intrusion: { label: 'Intrusion / Breach', color: '#8b5cf6' },
};

export default function DetectionChart({ breakdown = {} }: DetectionChartProps) {
  const data = Object.entries(CLASS_CONFIG).map(([key, config]) => ({
    name: config.label,
    rawKey: key,
    value: breakdown[key] || 0,
    color: config.color,
  }));

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  // If no data exists yet, provide an attractive placeholder state
  const chartData =
    total > 0
      ? data
      : [
          { name: 'Normal Activity', value: 70, color: '#10b981' },
          { name: 'Fight / Violence', value: 12, color: '#ef4444' },
          { name: 'Fall Hazard', value: 8, color: '#f59e0b' },
          { name: 'Intrusion / Breach', value: 10, color: '#8b5cf6' },
        ];

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Donut Chart with center metric */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={58}
              outerRadius={78}
              paddingAngle={4}
              dataKey="value"
              stroke="transparent"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.15)] transition-all hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0];
                  return (
                    <div className="px-3 py-1.5 rounded-lg bg-zinc-950/90 border border-white/10 text-xs font-mono shadow-xl backdrop-blur-md">
                      <span className="font-semibold text-white">
                        {item.name}:{' '}
                      </span>
                      <span className="text-cyan-400 font-bold">
                        {item.value} {total === 0 ? '(Demo)' : ''}
                      </span>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Summary */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none font-mono">
          <span className="text-2xl font-extrabold text-white tracking-tight">
            {total > 0 ? total : '0'}
          </span>
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest">
            Events
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2.5 w-full">
        {data.map((item) => {
          const count = breakdown[item.rawKey] || 0;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div
              key={item.name}
              className="p-2.5 rounded-xl bg-zinc-900/40 border border-white/[0.04] flex items-center justify-between hover:bg-zinc-900/70 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                  style={{ backgroundColor: item.color, color: item.color }}
                />
                <span className="text-xs font-medium text-zinc-300">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-zinc-400">{count} events</span>
                <span className="text-zinc-200 font-semibold w-9 text-right">
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
