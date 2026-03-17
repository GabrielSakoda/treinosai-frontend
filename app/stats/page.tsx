import { headers } from "next/headers";
import { redirect } from "next/navigation";
import dayjs from "dayjs";
import { Clock, CheckCircle, TrendingUp, Flame } from "lucide-react";
import { authClient } from "@/app/_lib/auth-client";
import { getStats, getHomeData, getUserTrainData } from "@/app/_lib/api/fetch-generated";
import { BottomNav } from "@/components/bottom-nav";
import { StatsHeatmap } from "@/components/stats-heatmap";

function formatTotalTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${String(minutes).padStart(2, "0")}m`;
}

export default async function StatsPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) redirect("/auth");

  const today = dayjs();
  const from = today.subtract(2, "month").startOf("month").format("YYYY-MM-DD");
  const to = today.endOf("month").format("YYYY-MM-DD");

  const reqHeaders = await headers();

  const [homeRes, trainRes, statsResponse] = await Promise.all([
    getHomeData(today.format("YYYY-MM-DD"), { headers: reqHeaders }),
    getUserTrainData({ headers: reqHeaders }),
    getStats({ from, to }, { headers: reqHeaders }),
  ]);

  const hasActivePlan = homeRes.status === 200;
  const hasTrainData = trainRes.status === 200 && trainRes.data !== null;
  if (!hasActivePlan || !hasTrainData) redirect("/onboarding");

  const stats = statsResponse.status === 200 ? statsResponse.data : null;

  const workoutStreak = stats?.workoutStreak ?? 0;
  const hasStreak = workoutStreak > 0;

  return (
    <div className="min-h-svh bg-background pb-28">
      <div className="px-5 pb-2 pt-12">
        <p className="font-heading text-lg font-black tracking-tight text-foreground">
          FIT.AI
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Evolução</h1>
      </div>

      <div className="space-y-5 px-5 pt-4">
        <div
          className={
            hasStreak
              ? "relative overflow-hidden rounded-2xl bg-gradient-to-br from-streak-start to-streak-end p-5"
              : "relative overflow-hidden rounded-2xl bg-gradient-to-br from-streak-zero-start to-streak-zero-end p-5"
          }
        >
          <div className="flex flex-col items-center gap-1 py-2 text-center">
            <Flame className="h-10 w-10 text-primary-foreground" />
            <span className="text-4xl font-black text-primary-foreground">
              {workoutStreak} dias
            </span>
            <span className="text-sm font-medium text-primary-foreground/80">
              Sequência Atual
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 text-base font-bold text-card-foreground">
            Consistência
          </h2>
          <StatsHeatmap consistencyByDay={stats?.consistencyByDay ?? {}} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-black text-card-foreground">
              {stats?.completedWorkoutsCount ?? 0}
            </p>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              Treinos Feitos
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-black text-card-foreground">
              {Math.round((stats?.conclusionRate ?? 0) * 100)}%
            </p>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              Taxa de conclusão
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-black text-card-foreground">
            {formatTotalTime(stats?.totalTimeInSeconds ?? 0)}
          </p>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
            Tempo Total
          </p>
        </div>
      </div>

      <BottomNav activePage="stats" />
    </div>
  );
}
