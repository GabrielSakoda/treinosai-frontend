"use client";

import "streamdown/styles.css";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart } from "ai";
import { Streamdown } from "streamdown";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { X, Send, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Chatbot() {
  const [isOpen, setIsOpen] = useQueryState(
    "chat_open",
    parseAsBoolean.withDefault(false),
  );
  const [initialMessage, setInitialMessage] = useQueryState(
    "chat_initial_message",
    parseAsString,
  );

  const { messages, setMessages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_URL}/ai`,
      credentials: "include",
    })
  });

  const sentInitialMessageRef = useRef<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      isOpen &&
      initialMessage &&
      sentInitialMessageRef.current !== initialMessage
    ) {
      sentInitialMessageRef.current = initialMessage;
      setMessages([]);
      sendMessage({ text: initialMessage });
      setInitialMessage(null);
    }
  }, [isOpen, initialMessage]);

  useEffect(() => {
    if (!isOpen) {
      sentInitialMessageRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || status === "streaming" || status === "submitted")
      return;
    sendMessage({ text: inputValue.trim() });
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isStreaming = status === "streaming" || status === "submitted";
  const userMessages = messages.filter((m) => m.role === "user");

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col bg-background transition-transform duration-300 ease-in-out",
        isOpen ? "translate-y-0" : "translate-y-full pointer-events-none",
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-5 pb-4 pt-14">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-md shadow-primary/30">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-black text-foreground">FIT.AI</h2>
            <p className="text-xs text-muted-foreground">
              Personal Trainer Virtual
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5" />
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
                Como posso te ajudar hoje?
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Escolha uma sugestão ou escreva sua mensagem
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() =>
                  sendMessage({ text: "Monte meu plano de treino" })
                }
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
        <div className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            disabled={isStreaming}
            className="flex-1 rounded-full"
          />
          <Button
            size="icon"
            className="shrink-0 rounded-full"
            onClick={handleSend}
            disabled={!inputValue.trim() || isStreaming}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
