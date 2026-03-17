import { redirect } from "next/navigation";
import { headers } from "next/headers";
import dayjs from "dayjs";
import { authClient } from "@/app/_lib/auth-client";
import { getHomeData, getUserTrainData } from "@/app/_lib/api/fetch-generated";
import { OnboardingChat } from "@/components/onboarding-chat";

export default async function OnboardingPage() {
  const reqHeaders = await headers();

  const session = await authClient.getSession({
    fetchOptions: { headers: reqHeaders },
  });

  if (!session.data?.user) redirect("/auth");

  const today = dayjs();

  const [homeRes, trainRes] = await Promise.all([
    getHomeData(today.format("YYYY-MM-DD"), { headers: reqHeaders }),
    getUserTrainData({ headers: reqHeaders }),
  ]);

  const hasActivePlan = homeRes.status === 200;
  const hasTrainData = trainRes.status === 200 && trainRes.data !== null;

  if (hasActivePlan && hasTrainData) redirect("/");

  return <OnboardingChat />;
}
