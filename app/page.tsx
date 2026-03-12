"use client";

import { authClient } from "@/app/_lib/auth-client";
import { redirect } from "next/navigation";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (!session) {
    redirect("/auth");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background font-sans">
      <main className="flex w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Bem-vindo ao FIT.AI
        </h1>
        <p className="text-lg text-muted-foreground">
          Olá, {session.user.name ?? "Usuário"}! Seu treino começa aqui.
        </p>
      </main>
    </div>
  );
}
