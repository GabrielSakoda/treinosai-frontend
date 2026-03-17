import { headers } from "next/headers";
import { redirect } from "next/navigation";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Zap, Clock, Dumbbell, CalendarDays } from "lucide-react";
import { authClient } from "@/app/_lib/auth-client";
import { getWorkoutPlan, getHomeData, getUserTrainData } from "@/app/_lib/api/fetch-generated";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{
    planId: string;
  }>;
}

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

export default async function WorkoutPlanPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { planId } = resolvedParams;

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

  const planResponse = await getWorkoutPlan(planId, {
    headers: reqHeaders,
  });

  if (planResponse.status !== 200) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <p className="text-muted-foreground">Plano de treino não encontrado.</p>
        <BottomNav />
      </div>
    );
  }

  const workoutPlan = planResponse.data;

  return (
    <div className="min-h-svh bg-background pb-24">
      {/* Hero Header */}
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src="/fitness-hero.png"
          alt="Workout plan background"
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/30 to-foreground/70" />

        <div className="relative z-10 flex h-full flex-col justify-between px-5 pb-6 pt-12">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full bg-primary-foreground/15 backdrop-blur-sm text-primary-foreground hover:bg-primary-foreground/25 hover:text-primary-foreground"
            >
              <Link href="/">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <span className="font-black text-lg tracking-tight text-primary-foreground">
              FIT.AI
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-6 pb-6">
        {/* Badge with plan name */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground">
            <Zap className="h-3.5 w-3.5 fill-primary-foreground" />
            {workoutPlan.name}
          </span>
        </div>

        {/* Page title */}
        <h1 className="mb-6 text-2xl font-bold text-foreground">
          Plano de Treino
        </h1>

        {/* Day list */}
        <div className="space-y-4">
          {workoutPlan.workoutDays.map((day) => {
            if (day.isRest) {
              return (
                <div
                  key={day.id}
                  className="flex items-center justify-between rounded-2xl bg-muted px-5 py-4"
                >
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {WEEKDAY_LABELS[day.weekDay] ?? day.weekDay}
                    </span>
                    <h3 className="mt-0.5 text-base font-bold text-foreground">
                      Descanso
                    </h3>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    RELAX
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={day.id}
                href={`/workout-plans/${workoutPlan.id}/days/${day.id}`}
                className="relative block aspect-[16/10] overflow-hidden rounded-2xl transition-opacity active:opacity-90"
              >
                {day.coverImageUrl ? (
                  <Image
                    src={day.coverImageUrl}
                    alt={day.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-foreground/80 to-foreground" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-foreground/10" />

                <div className="relative z-10 flex h-full flex-col justify-between p-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-sm">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {WEEKDAY_LABELS[day.weekDay] ?? day.weekDay}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-primary-foreground">
                      {day.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-primary-foreground/80">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDuration(day.estimatedDurationInSeconds)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Dumbbell className="h-3.5 w-3.5" />
                        {day.exercisesCount} exercícios
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
