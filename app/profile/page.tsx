import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Pencil, WeightTilde, Ruler, BicepsFlexed, User } from "lucide-react";
import dayjs from "dayjs";
import { authClient } from "@/app/_lib/auth-client";
import { getHomeData, getUserTrainData } from "@/app/_lib/api/fetch-generated";
import { BottomNav } from "@/components/bottom-nav";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const reqHeaders = await headers();

  const session = await authClient.getSession({
    fetchOptions: { headers: reqHeaders },
  });

  if (!session.data?.user) redirect("/auth");

  const today = dayjs();

  const [homeRes, trainDataResponse] = await Promise.all([
    getHomeData(today.format("YYYY-MM-DD"), { headers: reqHeaders }),
    getUserTrainData({ headers: reqHeaders }),
  ]);

  const hasActivePlan = homeRes.status === 200;
  const hasTrainData = trainDataResponse.status === 200 && trainDataResponse.data !== null;
  if (!hasActivePlan || !hasTrainData) redirect("/onboarding");

  const trainData =
    trainDataResponse.status === 200 ? trainDataResponse.data : null;

  const user = session.data.user;
  const userName = user.name || trainData?.userName || "";

  const weightKg = trainData
    ? (trainData.weightInGrams / 1000).toFixed(1)
    : "—";
  const heightCm = trainData?.heightInCentimeters ?? "—";
  const bodyFat = trainData ? `${trainData.bodyFatPercentage}%` : "—";
  const age = trainData?.age ?? "—";

  return (
    <div className="min-h-svh bg-background pb-28">
      <div className="px-5 pb-2 pt-12">
        <p className="font-heading text-lg font-black tracking-tight text-foreground">
          FIT.AI
        </p>
      </div>

      <div className="space-y-5 px-5 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative size-[52px] overflow-hidden rounded-full bg-primary/10">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={userName}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-primary">
                  {userName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-[18px] font-semibold leading-tight text-foreground">
                {userName}
              </p>
              <p className="text-sm text-muted-foreground">Plano Básico</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Pencil className="size-5 text-foreground" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-primary/8 p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary/8">
              <WeightTilde className="size-4 text-primary" />
            </div>
            <p className="text-2xl font-semibold text-foreground">{weightKg}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Kg</p>
          </div>

          <div className="rounded-xl bg-primary/8 p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary/8">
              <Ruler className="size-4 text-primary" />
            </div>
            <p className="text-2xl font-semibold text-foreground">{heightCm}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Cm</p>
          </div>

          <div className="rounded-xl bg-primary/8 p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary/8">
              <BicepsFlexed className="size-4 text-primary" />
            </div>
            <p className="text-2xl font-semibold text-foreground">{bodyFat}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Gc</p>
          </div>

          <div className="rounded-xl bg-primary/8 p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary/8">
              <User className="size-4 text-primary" />
            </div>
            <p className="text-2xl font-semibold text-foreground">{age}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Anos</p>
          </div>
        </div>

        <LogoutButton />
      </div>

      <BottomNav activePage="profile" />
    </div>
  );
}
