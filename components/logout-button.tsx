"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/app/_lib/auth-client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (!error) {
      router.push("/auth");
    }
  };

  return (
    <Button
      variant="ghost"
      className="mx-auto flex gap-2 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
      onClick={handleSignOut}
    >
      Sair da conta
      <LogOut className="size-4" />
    </Button>
  );
}
