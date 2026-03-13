import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Image from "next/image";
import dayjs from "dayjs";
import { authClient } from "@/app/_lib/auth-client";
import { getHomeData } from "@/app/_lib/api/fetch-generated";
import { Button } from "@/components/ui/button";
import { WorkoutDayCard } from "@/components/workout-day-card";
import { BottomNav } from "@/components/bottom-nav";
import { ConsistencyTracker } from "@/components/consistency-tracker";

function getWeekDays(today: dayjs.Dayjs) {
  const startOfWeek = today.startOf("week");
  return [
    { label: "S", date: startOfWeek.add(1, "day").format("YYYY-MM-DD") },
    { label: "T", date: startOfWeek.add(2, "day").format("YYYY-MM-DD") },
    { label: "Q", date: startOfWeek.add(3, "day").format("YYYY-MM-DD") },
    { label: "Q", date: startOfWeek.add(4, "day").format("YYYY-MM-DD") },
    { label: "S", date: startOfWeek.add(5, "day").format("YYYY-MM-DD") },
    { label: "S", date: startOfWeek.add(6, "day").format("YYYY-MM-DD") },
    { label: "D", date: startOfWeek.format("YYYY-MM-DD") },
  ];
}

export default async function Home() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) redirect("/auth");

  const today = dayjs();
  const homeResponse = await getHomeData(today.format("YYYY-MM-DD"));
  const homeData = homeResponse.status === 200 ? homeResponse.data : null;

  const userName = session.data.user.name?.split(" ")[0] ?? "Atleta";
  const weekDays = getWeekDays(today);

  return (
    <div className="min-h-svh bg-background pb-20">
      <div className="relative h-72 w-full overflow-hidden">
        <Image
          src="/fitness-hero.png"
          alt="Fitness background"
          fill
          className="object-cover object-top"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />

        <div className="relative z-10 flex h-full flex-col justify-between px-5 pb-6 pt-12">
          <h1 className="font-heading text-lg font-black tracking-tight text-white">
            FIT.AI
          </h1>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-white">
                Olá, {userName}
              </p>
              <p className="text-sm text-white/70">Bora treinar hoje?</p>
            </div>

            <Button className="rounded-full px-6 py-2 text-sm font-semibold shadow-lg shadow-primary/30 transition-transform active:scale-95">
              Bora!
            </Button>
          </div>
        </div>
      </div>

      <ConsistencyTracker
        weekDays={weekDays}
        consistencyByDay={homeData?.consistencyByDay}
        todayDate={today.format("YYYY-MM-DD")}
        workoutStreak={homeData?.workoutStreak ?? 0}
      />

      <div className="px-5 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">
            Treino de Hoje
          </h2>
          <Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium">
            Ver treinos
          </Button>
        </div>

        <div className="mt-3">
          {homeData?.todayWorkoutDay ? (
            <WorkoutDayCard workoutDay={homeData.todayWorkoutDay} />
          ) : (
            <div className="flex items-center justify-center rounded-2xl bg-muted p-8">
              <p className="text-sm text-muted-foreground">
                Nenhum treino programado para hoje 💪
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}