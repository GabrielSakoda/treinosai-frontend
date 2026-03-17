import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import dayjs from "dayjs";
import { Clock, Dumbbell, CalendarDays } from "lucide-react";
import { authClient } from "@/app/_lib/auth-client";
import { getWorkoutDay, getHomeData, getUserTrainData } from "@/app/_lib/api/fetch-generated";
import { TopBar } from "./_components/top-bar";
import { WorkoutActions } from "./_components/workout-actions";
import { ExerciseCard } from "./_components/exercise-card";
import { BottomNav } from "@/components/bottom-nav";

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

  const today = dayjs();
  const reqHeaders = await headers();

  const [homeRes, trainRes] = await Promise.all([
    getHomeData(today.format("YYYY-MM-DD"), { headers: reqHeaders }),
    getUserTrainData({ headers: reqHeaders }),
  ]);

  const hasActivePlan = homeRes.status === 200;
  const hasTrainData = trainRes.status === 200 && trainRes.data !== null;
  if (!hasActivePlan || !hasTrainData) redirect("/onboarding");

  const workoutDayResponse = await getWorkoutDay(planId, dayId, {
    headers: reqHeaders,
  });

  if (workoutDayResponse.status !== 200) {
    return (
      <div className="flex h-svh items-center justify-center bg-background">
        <p className="text-muted-foreground">Treino não encontrado.</p>
      </div>
    );
  }

  const workoutDay = workoutDayResponse.data;

  const activeSession = workoutDay.sessions.find(
    (s) => s.startedAt && !s.completedAt,
  );
  const completedSession = workoutDay.sessions.find((s) => !!s.completedAt);
  const isCompleted = !!completedSession;

  return (
    <div className="min-h-svh bg-background pb-40">
      {/* Hero */}
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
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/80 to-foreground" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/30 to-foreground/80" />

        <div className="absolute inset-x-0 top-0 z-50 pt-safe">
          <TopBar
            title="Treino de Hoje"
            className="text-primary-foreground [&_button]:text-primary-foreground [&_button]:hover:bg-primary-foreground/20"
          />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-8">
          <div className="mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-sm">
              <CalendarDays className="h-3.5 w-3.5" />
              {WEEKDAY_LABELS[workoutDay.weekDay] ?? workoutDay.weekDay}
            </span>
          </div>

          <h1 className="text-3xl font-black text-primary-foreground">
            {workoutDay.name}
          </h1>

          <div className="mt-3 flex items-center gap-4 text-sm font-medium text-primary-foreground/80">
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

      {/* Exercise list */}
      <div className="px-5 pt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Exercícios</h2>
          <span className="text-sm font-medium text-muted-foreground">
            {workoutDay.exercises.length} no total
          </span>
        </div>

        <div className="space-y-3">
          {workoutDay.exercises.map((exercise, index) => (
            <ExerciseCard key={exercise.id} exercise={exercise} index={index} />
          ))}
        </div>
      </div>

      {/* Action bar (above BottomNav) */}
      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border/40 bg-background/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto max-w-lg">
          <WorkoutActions
            workoutPlanId={planId}
            workoutDayId={dayId}
            activeSessionId={activeSession?.id}
            isCompleted={isCompleted}
          />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
