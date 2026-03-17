"use client";

import { parseAsBoolean, useQueryState } from "nuqs";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatOpenButton() {
  const [, setOpen] = useQueryState(
    "chat_open",
    parseAsBoolean.withDefault(false),
  );

  return (
    <Button
      size="icon"
      className="h-14 w-14 rounded-full shadow-lg shadow-primary/30"
      onClick={() => setOpen(true)}
    >
      <Sparkles className="size-6" />
    </Button>
  );
}
