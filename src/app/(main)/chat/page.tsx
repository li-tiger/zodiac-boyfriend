"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { BOYFRIENDS, RELATION_STAGE_LABELS, type ZodiacSign, type RelationStage } from "@/constants";
import { StarField, AuroraBackground } from "@/components/BackgroundEffects";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  imageUrl?: string;
}

interface DailyTopicInfo {
  id: string;
  topic: string;
}

interface ChatResponse {
  message: Message;
  stage: RelationStage;
  progress_value: number;
  dailyTopic?: DailyTopicInfo | null;
  imageTrigger?: { id: number; imageUrl: string } | null;
  occupationUnlocked?: boolean;
  callName?: string;
}

function ChatContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sign = searchParams.get("sign") as ZodiacSign | null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [stage, setStage] = useState<RelationStage>("stranger");
  const [progressValue, setProgressValue] = useState(0);
  const [currentCallName, setCurrentCallName] = useState("");
  const [showTopicTip, setShowTopicTip] = useState(false);
  const [topicTip, setTopicTip] = useState("");
  const [showOccupationUnlock, setShowOccupationUnlock] = useState(false);
  const [unlockedOccupation, setUnlockedOccupation] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const boyfriend = sign ? BOYFRIENDS[sign] : null;

  const fetchProgress = useCallback(async () => {
    if (!user || !sign) return;
    try {
      const res = await fetch("/api/progress");
      if (res.ok) {
        const data = await res.json();
        const myProgress = data.progress?.find(
          (p: { zodiac_sign: string }) => p.zodiac_sign === sign
        );
        if (myProgress) {
          setStage(myProgress.stage);
          setProgressValue(myProgress.progress_value);
        }
      }
    } catch {
      // ignore
    }
  }, [user, sign]);

  const fetchHistory = useCallback(async () => {
    if (!user || !sign) return;
    try {
      const res = await fetch(`/api/chat?sign=${sign}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // ignore
    }
  }, [user, sign]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (authLoading) return;
    if (!user) return;
    if (!sign || !boyfriend) {
      router.push("/select");
      return;
    }
    fetchProgress();
    fetchHistory();
  }, [user, sign, boyfriend, router, fetchProgress, fetchHistory, authLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (boyfriend) {
      const callNames = boyfriend.callNames[stage] || boyfriend.callNames.stranger || [];
      if (callNames.length > 0) {
        setCurrentCallName(callNames[0]);
      }
    }
  }, [boyfriend, stage]);

  useEffect(() => {
    if (showTopicTip) {
      const timer = setTimeout(() => setShowTopicTip(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showTopicTip]);

  useEffect(() => {
    if (showOccupationUnlock) {
      const timer = setTimeout(() => setShowOccupationUnlock(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showOccupationUnlock]);

  const handleSend = async () => {
    if (!input.trim() || isSending || !user || !sign) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zodiac_sign: sign,
          message: userMessage.content,
        }),
      });

      if (res.ok) {
        const data: ChatResponse = await res.json();

        if (data.message) {
          const assistantMessage: Message = {
            ...data.message,
            imageUrl: data.imageTrigger?.imageUrl,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }

        if (data.stage) {
          setStage(data.stage);
        }
        if (data.progress_value !== undefined) {
          setProgressValue(data.progress_value);
        }
        if (data.callName) {
          setCurrentCallName(data.callName);
        }
        if (data.dailyTopic) {
          setTopicTip(data.dailyTopic.topic);
          setShowTopicTip(true);
        }
        if (data.occupationUnlocked && boyfriend) {
          setUnlockedOccupation(boyfriend.occupation);
          setShowOccupationUnlock(true);
        }

        fetchProgress();
      }
    } catch {
      // ignore
    } finally {
      setIsSending(false);
    }
  };

  if (!user || !boyfriend) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      {showTopicTip && (
        <div
          className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-medium animate-pulse"
          style={{ background: "var(--gradient-gold)", color: "var(--bg-primary)" }}
        >
          💬 {topicTip}
        </div>
      )}

      {showOccupationUnlock && (
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl text-xs text-center animate-bounce"
          style={{ background: "var(--bg-card)", border: "2px solid var(--accent-gold)", color: "var(--text-primary)" }}
        >
          <div className="text-sm mb-1">🎉 职业解锁</div>
          <div className="font-medium" style={{ color: "var(--accent-pink)" }}>
            {boyfriend.name}的职业是{unlockedOccupation}！
          </div>
        </div>
      )}

      <header
        className="px-4 py-3 flex items-center gap-3 border-b"
        style={{ background: "rgba(5,10,18,0.9)", borderColor: "var(--border-light)" }}
      >
        <button
          onClick={() => router.push("/select")}
          className="p-2 rounded-full transition-colors"
          style={{ background: "var(--bg-card)" }}
        >
          <span style={{ color: "var(--text-primary)" }}>←</span>
        </button>

        <div className="w-10 h-10 rounded-full glow-border flex items-center justify-center" style={{ background: "var(--bg-card)" }}>
          <span className="text-lg">{boyfriend.emoji}</span>
        </div>

        <div className="flex-1">
          <h1 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            {boyfriend.name}
          </h1>
          <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
            {RELATION_STAGE_LABELS[stage]}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-20 h-1.5 rounded-full overflow-hidden"
            style={{ background: "var(--bg-card)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressValue}%`, background: "var(--gradient-pink)", boxShadow: "0 0 8px var(--glow-pink)" }}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">{boyfriend.emoji}</div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              和{boyfriend.name}打个招呼吧
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {boyfriend.personality}
            </p>
            <div className="mt-4 flex justify-center gap-2 flex-wrap">
              {["你好呀", "嗨", "在吗", "最近怎么样"].map((greeting) => (
                <button
                  key={greeting}
                  onClick={() => setInput(greeting)}
                  className="px-3 py-1 rounded-full text-xs transition-all hover:scale-105"
                  style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-light)" }}
                >
                  {greeting}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div
                className="w-8 h-8 rounded-full glow-border flex items-center justify-center mr-2 mb-1 shrink-0"
                style={{ background: "var(--bg-card)" }}
              >
                <span style={{ color: "var(--accent-pink)" }} className="text-xs font-bold">
                  {boyfriend.name.charAt(0)}
                </span>
              </div>
            )}

            {msg.imageUrl && (
              <div
                className="max-w-[60%] mb-2 rounded-xl overflow-hidden"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
              >
                <img
                  src={msg.imageUrl}
                  alt="场景图片"
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: "200px" }}
                />
              </div>
            )}

            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "rounded-br-md text-white"
                  : "rounded-bl-md"
              }`}
              style={
                msg.role === "user"
                  ? { background: "var(--gradient-pink)" }
                  : { background: "var(--bg-card)", border: "1px solid var(--border-light)" }
              }
            >
              {msg.role === "assistant" && currentCallName && (
                <span className="mr-1" style={{ color: "var(--accent-pink)" }}>
                  {currentCallName}：
                </span>
              )}
              {msg.content}
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex justify-start">
            <div
              className="w-8 h-8 rounded-full glow-border flex items-center justify-center mr-2"
              style={{ background: "var(--bg-card)" }}
            >
              <span style={{ color: "var(--accent-pink)" }} className="text-xs font-bold">
                {boyfriend.name.charAt(0)}
              </span>
            </div>
            <div className="flex gap-1.5 px-4 py-3 rounded-2xl rounded-bl-md" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
              <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent-pink)" }} />
              <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent-pink)" }} />
              <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent-pink)" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div
        className="px-4 py-3 border-t"
        style={{ background: "rgba(5,10,18,0.9)", borderColor: "var(--border-light)" }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`给${boyfriend.name}发消息...`}
            className="flex-1"
            disabled={isSending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="px-4 py-2 rounded-full text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "var(--gradient-pink)" }}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatLoading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex gap-2">
        <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent-pink)" }} />
        <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent-pink)" }} />
        <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent-pink)" }} />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: "var(--bg-primary)" }}>
      <StarField />
      <AuroraBackground />
      <div className="relative z-10 flex flex-col h-screen">
        <Suspense fallback={<ChatLoading />}>
          <ChatContent />
        </Suspense>
      </div>
    </div>
  );
}
