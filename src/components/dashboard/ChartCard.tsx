import type { ChartData, ChartOptions } from "chart.js";
import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";

type ChartCardProps = {
  title: string;
  data: ChartData<"bar", number[], string>;
};

const chartOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 } },
      border: { display: false },
    },
    y: {
      beginAtZero: true,
      grid: { color: "rgba(0,0,0,0.04)" },
      ticks: {
        font: { size: 11 },
        stepSize: 1.0,
      },
      border: { display: false },
    },
  },
};

const COLORS = [
  "#BFC6CE",
  "#9BE7E8",
  "#3CB6E8",
  "#8CEB8E",
  "#F3E46F",
  "#F7B57A",
  "#F4CE6A",
  "#F7A7DF",
  "#B7BFF4",
  "#9E8CF1",
];

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
  return Math.abs(hash);
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, data }) => {
  const coloredData = useMemo(() => {
    const labels = (data.labels ?? []).map(String);
    return {
      ...data,
      datasets: (data.datasets ?? []).map((dataset) => {
        const backgroundColor = labels.map((label, index) => {
          const key = `${title}-${label}-${index}`;
          return COLORS[hashString(key) % COLORS.length];
        });

        return {
          ...dataset,
          backgroundColor,
          hoverBackgroundColor: backgroundColor,
        };
      }),
    };
  }, [data, title]);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 w-full">
      <div className="text-sm font-semibold text-gray-900 mb-4">{title}</div>

      <div className="h-56 w-full">
        <Bar options={chartOptions} data={coloredData} />
      </div>
    </div>
  );
};
