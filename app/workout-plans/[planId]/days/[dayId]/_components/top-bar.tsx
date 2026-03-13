"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  title: string;
  className?: string;
}

export function TopBar({ title, className }: TopBarProps) {
  const router = useRouter();

  return (
    <div className={cn("flex h-14 items-center justify-between px-4", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-accent"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <span className="text-sm font-semibold">{title}</span>

      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-accent"
      >
        <MoreHorizontal className="h-6 w-6" />
      </Button>
    </div>
  );
}
