import { useMemo, useState } from "react";
import type { CountItem } from "../../utils/chartData";

import PlaceIcon from "../../icons/place.svg?react";
import StarIcon from "../../icons/star.svg?react";

type RatingTabProps = {
  title: string;
  items: CountItem[];
  visibleCount?: number;
};

export function RatingTab({ title, items, visibleCount = 3 }: RatingTabProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleItems = useMemo(() => {
    if (showAll) return items;
    return items.slice(0, visibleCount);
  }, [items, showAll, visibleCount]);

  return (
    <div className="w-full rounded-2xl bg-white px-5 py-4 shadow-sm">
      <div className="inline-flex items-center gap-3 rounded-xl bg-[#F2F2F2] p-3">
        <span className="flex items-center justify-center">
          <StarIcon className="h-4 w-4 text-[#FF7A00]" />
        </span>
        <span className="font-semibold text-black leading-none">{title}</span>
      </div>

      <div className="mt-3 border-b border-gray-300 divide-y divide-gray-300">
        {visibleItems.map((item, index) => {
          const placeColor =
            index === 0
              ? "text-[#F6C65B]"
              : index === 1
                ? "text-[#BDBDBD]"
                : index === 2
                  ? "text-[#B26A59]"
                  : index === 3
                    ? "text-[#E6E6E6]"
                    : "text-[#F2F2F2]";

          const placeTextColor = index <= 2 ? "text-white" : "text-[#BDBDBD]";

          return (
            <div key={item.name} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative h-7 w-7 flex-none">
                  <PlaceIcon className={`absolute inset-0 h-7 w-7 ${placeColor}`} />
                  <span
                    className={`absolute inset-0 flex items-center justify-center text-xs font-semibold ${placeTextColor}`}
                  >
                    {index + 1}
                  </span>
                </div>

                <div className="min-w-0 flex-1 truncate text-base text-gray-900">
                  {item.name}
                </div>
              </div>

              <div className="ml-4 flex-none text-base text-gray-900">{item.count}</div>
            </div>
          );
        })}
      </div>

      {items.length > visibleCount && (
        <button
          onClick={() => setShowAll((value) => !value)}
          className="mt-2 text-xs text-gray-300 hover:text-gray-400"
        >
          {showAll ? "скрыть" : "показать всех"}
        </button>
      )}
    </div>
  );
}
