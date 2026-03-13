import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { getWorkoutPlan } from "@/app/_lib/api/fetch-generated";
import { TopBar } from "./days/[dayId]/_components/top-bar";
import { WorkoutDayCard } from "@/components/workout-day-card";
import { BottomNav } from "@/components/bottom-nav";

interface PageProps {
  params: Promise<{
    planId: string;
  }>;
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

  const planResponse = await getWorkoutPlan(planId, {
    headers: await headers(),
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

  // Sorting days to standard Monday -> Sunday if needed, or by original order.
  // Assuming the API returns them in a sensible order or we just map them as is.

  return (
    <div className="min-h-svh bg-background pb-24">
      <div className="pt-safe">
        <TopBar title="Detalhes do Plano" />
      </div>

      <div className="px-5 pt-4 pb-6">
        <div className="mb-6">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {workoutPlan.name}
          </span>
        </div>

        <h1 className="mb-4 text-2xl font-bold text-foreground">
          Dias de Treino
        </h1>

        <div className="space-y-4">
          {workoutPlan.workoutDays.map((day) => {
            if (day.isRest) {
              return (
                <div
                  key={day.id}
                  className="flex items-center justify-between rounded-2xl bg-muted/50 p-5"
                >
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      {day.weekDay}
                    </span>
                    <h3 className="mt-1 text-lg font-bold text-foreground">
                      Descanso
                    </h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <span className="text-lg">😴</span>
                  </div>
                </div>
              );
            }

            return (
              <WorkoutDayCard
                key={day.id}
                workoutDay={{
                  ...day,
                  workoutPlanId: workoutPlan.id,
                }}
                href={`/workout-plans/${workoutPlan.id}/days/${day.id}`}
              />
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
