"use server";

import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  getHomeData,
  startWorkoutSession,
  updateWorkoutSession,
} from "@/app/_lib/api/fetch-generated";
import { authClient } from "@/app/_lib/auth-client";

export async function getTodayWorkoutPath() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) return null;

  const today = dayjs().format("YYYY-MM-DD");
  const homeResponse = await getHomeData(today);
  const homeData = homeResponse.status === 200 ? homeResponse.data : null;

  if (homeData?.todayWorkoutDay) {
    return `/workout-plans/${homeData.todayWorkoutDay.workoutPlanId}/days/${homeData.todayWorkoutDay.id}`;
  }

  return "#";
}

export async function startWorkout(workoutPlanId: string, workoutDayId: string) {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) {
    redirect("/auth");
  }

  await startWorkoutSession(workoutPlanId, workoutDayId);
  revalidatePath(`/workout-plans/${workoutPlanId}/days/${workoutDayId}`);
}

export async function completeWorkout(
  workoutPlanId: string,
  workoutDayId: string,
  sessionId: string,
) {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) {
    redirect("/auth");
  }

  const completedAt = new Date().toISOString();
  await updateWorkoutSession(workoutPlanId, workoutDayId, sessionId, {
    completedAt,
  });
  
  revalidatePath(`/workout-plans/${workoutPlanId}/days/${workoutDayId}`);
}
