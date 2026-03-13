import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { GetHomeData200ConsistencyByDay } from "@/app/_lib/api/fetch-generated";

interface WeekDay {
  label: string;
  date: string;
}

interface ConsistencyTrackerProps {
  weekDays: WeekDay[];
  consistencyByDay?: GetHomeData200ConsistencyByDay;
  todayDate: string;
  workoutStreak: number;
}

export function ConsistencyTracker({
  weekDays,
  consistencyByDay,
  todayDate,
  workoutStreak,
}: ConsistencyTrackerProps) {
  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">Consistência</h2>
        <Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium">
          Ver histórico
        </Button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-1.5">
          {weekDays.map((day) => {
            const consistency = consistencyByDay?.[day.date];
            const isCompleted = consistency?.workoutDayCompleted === true;
            const isStarted = consistency?.workoutDayStarted === true;
            const isToday = day.date === todayDate;

            return (
              <div key={day.date} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "relative h-9 w-9 rounded-lg",
                    isCompleted
                      ? "bg-primary"
                      : isStarted
                        ? "bg-primary/40"
                        : "bg-muted",
                    isToday && !isCompleted && !isStarted && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                  )}
                >
                  {isStarted && !isCompleted && (
                    <div className="absolute inset-x-0 bottom-0 h-1/2 rounded-b-lg bg-primary" />
                  )}
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex h-14 min-w-16 items-center justify-center gap-1.5 rounded-xl bg-orange-50 px-3 dark:bg-orange-950/30">
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="text-base font-bold text-foreground">
            {workoutStreak}
          </span>
        </div>
      </div>
    </div>
  );
}
