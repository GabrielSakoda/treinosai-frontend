import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { cn } from "@/lib/utils";
import type { GetStats200ConsistencyByDay } from "@/app/_lib/api/fetch-generated";

dayjs.extend(isoWeek);

interface StatsHeatmapProps {
  consistencyByDay: GetStats200ConsistencyByDay;
}

interface MonthData {
  label: string;
  weeks: (string | null)[][];
}

function buildHeatmapData(today: dayjs.Dayjs): MonthData[] {
  const months: MonthData[] = [];

  for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
    const month = today.subtract(monthOffset, "month");
    const monthStart = month.startOf("month");
    const monthEnd = month.endOf("month");

    const weeks: (string | null)[][] = [];
    let current = monthStart.startOf("isoWeek");

    while (current.isBefore(monthEnd) || current.isSame(monthEnd, "day")) {
      const week: (string | null)[] = [];
      for (let dow = 0; dow < 7; dow++) {
        const day = current.add(dow, "day");
        if (
          day.month() === month.month() &&
          day.year() === month.year()
        ) {
          week.push(day.format("YYYY-MM-DD"));
        } else {
          week.push(null);
        }
      }
      if (week.some((d) => d !== null)) {
        weeks.push(week);
      }
      current = current.add(1, "week");
    }

    months.push({
      label: month.format("MMM"),
      weeks,
    });
  }

  return months;
}

export function StatsHeatmap({ consistencyByDay }: StatsHeatmapProps) {
  const today = dayjs();
  const months = buildHeatmapData(today);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4">
        {months.map((month) => (
          <div key={month.label} className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground">
              {month.label}
            </span>
            <div className="flex gap-1">
              {month.weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((date, di) => {
                    if (!date) {
                      return <div key={di} className="h-7 w-7" />;
                    }

                    const entry = consistencyByDay?.[date];
                    const isCompleted = entry?.workoutDayCompleted === true;
                    const isStarted = entry?.workoutDayStarted === true;

                    return (
                      <div
                        key={date}
                        className={cn(
                          "h-7 w-7 rounded-md",
                          isCompleted
                            ? "bg-primary"
                            : isStarted
                              ? "bg-primary/40"
                              : "border border-border",
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
