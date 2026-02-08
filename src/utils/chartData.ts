import type { ChartData } from "chart.js";

export type CountItem = { name: string; count: number };

export function countByName(items: Array<{ name?: string | null }>): Map<string, number> {
  const map = new Map<string, number>();

  for (const item of items) {
    const key = (item?.name ?? "").trim() || "Другие";
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return map;
}

export function toSortedCountArray(map: Map<string, number>): CountItem[] {
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function makeBarChartData(items: CountItem[]): ChartData<"bar", number[], string> {
  return {
    labels: items.map((item) => item.name),
    datasets: [
      {
        label: "",
        data: items.map((item) => item.count),
        borderRadius: 10
      },
    ],
  };
}
