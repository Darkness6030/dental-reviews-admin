type MetricBarProps = {
  label: string;
  value: number;
  percent: number;
};

const clampNumber = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
};

export default function MetricBar({ label, value, percent }: MetricBarProps) {
  return (
    <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-2 py-1.5 lg:w-auto">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-center text-sm font-semibold text-gray-900">
          {value.toFixed(2)}
        </div>

        <div className="hidden h-2 w-24 overflow-hidden rounded-full bg-gray-200 sm:block">
          <div className="h-full bg-gray-900" style={{ width: `${clampNumber(percent, 0, 100)}%` }} />
        </div>
      </div>
    </div>
  );
}
