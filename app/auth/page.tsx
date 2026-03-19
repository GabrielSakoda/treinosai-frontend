"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/app/_lib/auth-client";
import { GoogleIcon } from "@/components/icons/google-icon";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace("/");
    }
  }, [isPending, session, router]);

  if (isPending || session?.user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      {/* Hero Section - Top */}
      <div className="relative flex-1">
        {/* Hero Image */}
        <Image
          src="/fitness-hero.png"
          alt="Atleta treinando"
          fill
          className="object-cover object-center"
          priority
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-transparent" />

        {/* Logo */}
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-12">
          <h1 className="text-4xl font-black tracking-tight text-primary-foreground">
            FIT.AI
          </h1>
        </div>
      </div>

      {/* Bottom Section - Blue CTA */}
      <div className="relative z-10 -mt-8 rounded-t-[2rem] bg-primary px-6 pb-8 pt-10">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-8">
          {/* Tagline */}
          <h2 className="text-center text-2xl font-bold leading-tight text-primary-foreground">
            O app que vai transformar a forma como você treina.
          </h2>

          {/* Google Sign In Button */}
          <Button
            id="google-sign-in-button"
            onClick={handleGoogleSignIn}
            variant="outline"
            className="flex w-full items-center justify-center gap-3 rounded-full bg-background px-6 py-4 text-base font-semibold text-foreground shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-background hover:shadow-xl active:scale-[0.98]"
          >
            <GoogleIcon className="h-5 w-5 shrink-0" />
            Fazer login com Google
          </Button>

          {/* Copyright */}
          <p className="text-center text-xs text-primary-foreground/70">
            ©2026 Copyright FIT.AI. Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}