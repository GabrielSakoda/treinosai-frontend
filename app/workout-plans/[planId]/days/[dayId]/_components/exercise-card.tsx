"use client";

import { Info } from "lucide-react";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { GetWorkoutDay200ExercisesItem } from "@/app/_lib/api/fetch-generated";

interface ExerciseCardProps {
  exercise: GetWorkoutDay200ExercisesItem;
  index: number;
}

export function ExerciseCard({ exercise, index }: ExerciseCardProps) {
  const [, setChatOpen] = useQueryState(
    "chat_open",
    parseAsBoolean.withDefault(false),
  );
  const [, setInitialMessage] = useQueryState(
    "chat_initial_message",
    parseAsString,
  );

  const handleInfoClick = async () => {
    await setInitialMessage(`Como executar ${exercise.name} corretamente?`);
    setChatOpen(true);
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary">
        <span className="text-sm font-black text-primary-foreground">
          {index + 1}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-foreground">
          {exercise.name}
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {exercise.sets} séries · {exercise.reps} reps
          {exercise.restTimeInSeconds > 0 &&
            ` · ${exercise.restTimeInSeconds}s descanso`}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 text-muted-foreground"
        onClick={handleInfoClick}
      >
        <Info className="h-5 w-5" />
      </Button>
    </div>
  );
}
