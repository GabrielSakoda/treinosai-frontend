"use client";

import Link from "next/link";
import { House, CalendarDays, Sparkles, BarChart3, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { icon: House, href: "/", label: "Home" },
  { icon: CalendarDays, href: "#", label: "Agenda" },
  { icon: null, href: "#", label: "AI" },
  { icon: BarChart3, href: "#", label: "Estatísticas" },
  { icon: User, href: "#", label: "Perfil" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4">
        {NAV_ITEMS.map((item) => {
          if (item.icon === null) {
            return (
              <Button
                key={item.label}
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg shadow-primary/30 transition-transform active:scale-95"
              >
                <Sparkles className="h-5 w-5" />
              </Button>
            );
          }

          const isActive = pathname === item.href && item.href !== "#";
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 text-muted-foreground transition-colors",
                isActive && "text-primary"
              )}
            >
              <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 1.5} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
