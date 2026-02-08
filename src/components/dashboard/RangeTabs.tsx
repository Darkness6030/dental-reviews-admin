import React from "react";
import type { DateRangeKey } from "../../utils/dateRange";

type RangeTabsProps = {
  value: DateRangeKey;
  handleSelect: (value: DateRangeKey) => void;
};

const tabs: Array<{ key: DateRangeKey; label: string }> = [
  { key: "today", label: "Сегодня" },
  { key: "yesterday", label: "Вчера" },
  { key: "week", label: "Неделя" },
  { key: "month", label: "Месяц" },
  { key: "all_time", label: "Всё время" },
];

export const RangeTabs: React.FC<RangeTabsProps> = ({ value, handleSelect }) => {
  return (
    <div className="inline-flex items-center gap-1 rounded-2xl bg-gray-100 p-1">
      {tabs.map((tab) => {
        const isActive = value === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => handleSelect(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs transition-colors ${isActive
              ? "bg-white shadow-sm text-gray-900"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
