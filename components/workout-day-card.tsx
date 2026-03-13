import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Clock, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GetHomeData200TodayWorkoutDay } from "@/app/_lib/api/fetch-generated";

const WEEKDAY_LABELS: Record<string, string> = {
  MONDAY: "SEGUNDA",
  TUESDAY: "TERÇA",
  WEDNESDAY: "QUARTA",
  THURSDAY: "QUINTA",
  FRIDAY: "SEXTA",
  SATURDAY: "SÁBADO",
  SUNDAY: "DOMINGO",
};

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  return `${minutes}min`;
}

interface WorkoutDayCardProps {
  workoutDay: GetHomeData200TodayWorkoutDay;
  href?: string;
  className?: string;
}

export function WorkoutDayCard({
  workoutDay,
  href = "#",
  className,
}: WorkoutDayCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "relative block overflow-hidden rounded-2xl aspect-[16/10]",
        className
      )}
    >
      {workoutDay.coverImageUrl ? (
        <Image
          src={workoutDay.coverImageUrl}
          alt={workoutDay.name}
          fill
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      <div className="relative z-10 flex h-full flex-col justify-between p-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <CalendarDays className="h-3.5 w-3.5" />
            {WEEKDAY_LABELS[workoutDay.weekDay] ?? workoutDay.weekDay}
          </span>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white">{workoutDay.name}</h3>
          <div className="mt-1 flex items-center gap-3 text-xs text-white/80">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(workoutDay.estimatedDurationInSeconds)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Dumbbell className="h-3.5 w-3.5" />
              {workoutDay.exercisesCount} exercícios
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
