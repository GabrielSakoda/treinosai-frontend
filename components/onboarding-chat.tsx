"use client";

import "streamdown/styles.css";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart } from "ai";
import { Streamdown } from "streamdown";
import { useEffect, useRef } from "react";
import { Send, Sparkles, Bot } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const chatFormSchema = z.object({
  message: z.string().trim().min(1),
});

type ChatFormValues = z.infer<typeof chatFormSchema>;

export function OnboardingChat() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_URL}/ai`,
      credentials: "include",
    }),
  });

  const form = useForm<ChatFormValues>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: {
      message: "",
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = (values: ChatFormValues) => {
    if (status === "streaming" || status === "submitted") return;
    sendMessage({ text: values.message });
    form.reset();
  };

  const isStreaming = status === "streaming" || status === "submitted";
  const userMessages = messages.filter((m) => m.role === "user");

  return (
    <div className="flex h-svh flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-5 pb-4 pt-14">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-md shadow-primary/30">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-black text-foreground">Coach AI</h1>
            <p className="text-xs text-muted-foreground">
              Personal Trainer Virtual
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full text-xs font-semibold">
          <Link href="/">Acessar FIT.AI</Link>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">
                Bem-vindo ao FIT.AI 👋
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Vou montar seu plano de treino personalizado, acompanhar sua evolução com estatísticas detalhadas e contar com uma IA disponível 24h para te guiar.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => sendMessage({ text: "Vamos configurar meu perfil!" })}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Começar! 🚀
              </button>
              <button
                onClick={() => sendMessage({ text: "Monte meu plano de treino" })}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Monte meu plano de treino
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isLastAssistant =
                message.role === "assistant" && index === messages.length - 1;
              const textContent = message.parts
                .filter(isTextUIPart)
                .map((p) => p.text)
                .join("");

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                      <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-4 py-3 text-sm",
                      message.role === "user"
                        ? "rounded-tr-sm bg-primary text-primary-foreground"
                        : "rounded-tl-sm border border-border bg-card text-foreground",
                    )}
                  >
                    {message.role === "assistant" ? (
                      <Streamdown
                        mode={
                          isLastAssistant && isStreaming
                            ? "streaming"
                            : "static"
                        }
                      >
                        {textContent}
                      </Streamdown>
                    ) : (
                      <p>{textContent}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {isStreaming && userMessages.length > 0 && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-start gap-2">
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 pb-8 pt-3">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-center gap-2"
          >
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Digite sua mensagem..."
                      disabled={isStreaming}
                      className="flex-1 rounded-full"
                      autoComplete="off"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0 rounded-full"
              disabled={isStreaming}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
