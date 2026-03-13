import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Clock, Dumbbell, Flame, Info } from "lucide-react";
import { authClient } from "@/app/_lib/auth-client";
import { getWorkoutDay } from "@/app/_lib/api/fetch-generated";
import { TopBar } from "./_components/top-bar";
import { WorkoutActions } from "./_components/workout-actions";
import { Button } from "@/components/ui/button";

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
  return `${minutes} min`;
}

interface PageProps {
  params: Promise<{
    planId: string;
    dayId: string;
  }>;
}

export default async function WorkoutDayPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { planId, dayId } = resolvedParams;

  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) redirect("/auth");

  const workoutDayResponse = await getWorkoutDay(planId, dayId, {
    headers: await headers(),
  });

  if (workoutDayResponse.status !== 200) {
    return (
      <div className="flex h-svh items-center justify-center bg-background">
        <p className="text-muted-foreground">Treino não encontrado.</p>
      </div>
    );
  }

  const workoutDay = workoutDayResponse.data;

  // Find active or completed session
  const activeSession = workoutDay.sessions.find((s) => !s.completedAt);
  const completedSession = workoutDay.sessions.find((s) => s.completedAt);
  const isCompleted = !!completedSession;

  return (
    <div className="min-h-svh bg-background pb-24">
      <div className="relative h-72 w-full overflow-hidden">
        {workoutDay.coverImageUrl ? (
          <Image
            src={workoutDay.coverImageUrl}
            alt={workoutDay.name}
            fill
            className="object-cover object-top"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80" />

        <div className="absolute inset-x-0 top-0 z-50 pt-safe">
          <TopBar title="Treino de Hoje" className="text-white [&_button]:text-white [&_button]:hover:bg-white/20" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-8">
          <div className="mb-2">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <Flame className="mr-1.5 h-3.5 w-3.5 text-orange-500" />
              {WEEKDAY_LABELS[workoutDay.weekDay] ?? workoutDay.weekDay}
            </span>
          </div>

          <h1 className="text-3xl font-black text-white">{workoutDay.name}</h1>

          <div className="mt-3 flex items-center gap-4 text-sm font-medium text-white/80">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatDuration(workoutDay.estimatedDurationInSeconds)}
            </span>
            <span className="flex items-center gap-1.5">
              <Dumbbell className="h-4 w-4" />
              {workoutDay.exercises.length} exercícios
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Exercícios</h2>
          <span className="text-sm font-medium text-muted-foreground">
            {workoutDay.exercises.length} no total
          </span>
        </div>

        <div className="space-y-4">
          {workoutDay.exercises.map((exercise, index) => (
            <div
              key={exercise.id}
              className="group relative flex items-center gap-4 rounded-2xl bg-muted/50 p-4 transition-colors hover:bg-muted"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background shadow-xs">
                <span className="text-lg font-black text-primary">
                  {index + 1}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="truncate font-semibold text-foreground">
                  {exercise.name}
                </h3>
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{exercise.sets} séries</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>{exercise.reps} reps</span>
                  {exercise.restTimeInSeconds > 0 && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span>{exercise.restTimeInSeconds}s descanso</span>
                    </>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground"
              >
                <Info className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/40 bg-background/95 p-4 backdrop-blur-md pb-safe">
        <div className="mx-auto max-w-lg">
          <WorkoutActions
            workoutPlanId={planId}
            workoutDayId={dayId}
            activeSessionId={activeSession?.id}
            isCompleted={isCompleted}
          />
        </div>
      </div>
    </div>
  );
}
