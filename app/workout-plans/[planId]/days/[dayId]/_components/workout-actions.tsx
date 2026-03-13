"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { startWorkout, completeWorkout } from "@/app/_actions/workout";

interface WorkoutActionsProps {
  workoutPlanId: string;
  workoutDayId: string;
  activeSessionId?: string;
  isCompleted?: boolean;
}

export function WorkoutActions({
  workoutPlanId,
  workoutDayId,
  activeSessionId,
  isCompleted,
}: WorkoutActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleStart = () => {
    startTransition(async () => {
      await startWorkout(workoutPlanId, workoutDayId);
    });
  };

  const handleComplete = () => {
    if (!activeSessionId) return;
    
    startTransition(async () => {
      await completeWorkout(workoutPlanId, workoutDayId, activeSessionId);
    });
  };

  if (isCompleted) {
    return (
      <Button
        disabled
        variant="ghost"
        className="w-full h-14 rounded-full text-base font-bold text-muted-foreground bg-muted/50"
      >
        Concluído!
      </Button>
    );
  }

  if (activeSessionId) {
    return (
      <Button
        onClick={handleComplete}
        disabled={isPending}
        className="w-full h-14 rounded-full text-base font-bold shadow-lg shadow-primary/30"
      >
        {isPending ? "Marcando..." : "Marcar como concluído"}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleStart}
      disabled={isPending}
      className="w-full h-14 rounded-full text-base font-bold shadow-lg shadow-primary/30"
    >
      {isPending ? "Iniciando..." : "Iniciar treino"}
    </Button>
  );
}
