export type DateRangeKey = "today" | "yesterday" | "week" | "month" | "all_time";

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function padNumber(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatDateYMD(date: Date): string {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

export function getDateRange(rangeKey: DateRangeKey): { fromDate: Date | undefined; toDate: Date | undefined } {
  const now = new Date();
  switch (rangeKey) {
    case "today":
      return { fromDate: startOfDay(now), toDate: endOfDay(now) };

    case "yesterday":
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return { fromDate: startOfDay(yesterday), toDate: endOfDay(yesterday) };

    case "week":
      const startOfWeek = new Date(now);
      startOfWeek.setDate(startOfWeek.getDate() - 6);
      return { fromDate: startOfDay(startOfWeek), toDate: endOfDay(now) };

    case "month":
      const startOfMonth = new Date(now);
      startOfMonth.setMonth(startOfMonth.getMonth() - 1);
      return { fromDate: startOfDay(startOfMonth), toDate: endOfDay(now) };

    default:
      return { fromDate: undefined, toDate: undefined };
  }
}
