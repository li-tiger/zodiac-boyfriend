"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { BOYFRIENDS, RELATION_STAGE_LABELS, type ZodiacSign, type RelationStage } from "@/constants";
import StarryBackground from "@/components/StarryBackground";
import { getCharacterImage } from "@/constants/images-game";

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

const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 }
  }
};

const notificationVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 }
  },
  exit: { opacity: 0, y: -20, scale: 0.8, transition: { duration: 0.2 } }
};

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

  const greetingSuggestions = ["你好呀", "嗨", "在吗", "最近怎么样"];

  return (
    <div className="flex flex-col h-screen relative">
      <AnimatePresence>
        {showTopicTip && (
          <motion.div
            variants={notificationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full text-xs font-medium"
            style={{
              background: "var(--gradient-gold)",
              color: "var(--bg-primary)",
              boxShadow: "0 4px 20px rgba(212, 165, 116, 0.4)"
            }}
          >
            💬 {topicTip}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOccupationUnlock && (
          <motion.div
            variants={notificationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs text-center"
            style={{
              background: "var(--bg-card)",
              border: "2px solid var(--accent-gold)",
              boxShadow: "0 8px 32px rgba(212, 165, 116, 0.3)"
            }}
          >
            <motion.div
              className="text-base mb-1"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🎉 职业解锁
            </motion.div>
            <div className="font-medium" style={{ color: "var(--accent-rose)" }}>
              {boyfriend.name}的职业是{unlockedOccupation}！
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="px-4 py-3 flex items-center gap-3 border-b"
        style={{
          background: "rgba(10, 10, 26, 0.85)",
          borderColor: "var(--border-cosmic)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)"
        }}
      >
        <motion.button
          onClick={() => router.push("/select")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full transition-colors"
          style={{ background: "var(--bg-card)" }}
        >
          <span style={{ color: "var(--text-primary)" }}>←</span>
        </motion.button>

        <motion.div
          className="w-10 h-10 rounded-full overflow-hidden"
          style={{
            boxShadow: "0 0 15px var(--glow-rose)"
          }}
          animate={{
            boxShadow: ["0 0 10px var(--glow-rose)", "0 0 20px var(--glow-rose)", "0 0 10px var(--glow-rose)"]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <img
            src={getCharacterImage(sign!)}
            alt={boyfriend.name}
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="flex-1">
          <motion.h1
            className="text-sm font-bold"
            style={{ color: "var(--text-primary)" }}
            key={currentCallName}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {currentCallName || boyfriend.name}
          </motion.h1>
          <p className="text-[10px]" style={{ color: "var(--accent-rose)" }}>
            {RELATION_STAGE_LABELS[stage]}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-20 h-1.5 rounded-full overflow-hidden"
            style={{ background: "var(--bg-primary)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: stage === "lover" ? "var(--gradient-pink)" : "var(--gradient-gold)",
                boxShadow: stage === "lover" ? "0 0 10px var(--glow-pink)" : "0 0 8px var(--glow-gold)"
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progressValue}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>
            {progressValue}%
          </span>
        </div>
      </motion.header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-10"
          >
            <motion.div
              className="w-20 h-20 rounded-full overflow-hidden mb-4 mx-auto"
              style={{ boxShadow: "0 0 20px var(--glow-rose)" }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <img
                src={getCharacterImage(sign!)}
                alt={boyfriend.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <p className="text-base mb-2" style={{ color: "var(--text-primary)" }}>
              和{boyfriend.name}打个招呼吧
            </p>
            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
              {boyfriend.personality}
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              {greetingSuggestions.map((greeting, idx) => (
                <motion.button
                  key={greeting}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setInput(greeting)}
                  className="px-4 py-1.5 rounded-full text-xs transition-all"
                  style={{
                    background: "var(--bg-card)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-cosmic)",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)"
                  }}
                >
                  {greeting}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            {msg.role === "assistant" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-8 h-8 rounded-full overflow-hidden mr-2 mb-1.5 shrink-0"
                style={{
                  boxShadow: "0 0 10px var(--glow-silver)"
                }}
              >
                <img
                  src={getCharacterImage(sign!)}
                  alt={boyfriend.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}

            {msg.imageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-[65%] mb-2 rounded-xl overflow-hidden"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-cosmic)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
                }}
              >
                <img
                  src={msg.imageUrl}
                  alt="场景图片"
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: "200px" }}
                />
              </motion.div>
            )}

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "rounded-br-md"
                  : "rounded-bl-md"
              }`}
              style={
                msg.role === "user"
                  ? {
                      background: "var(--gradient-cosmic)",
                      border: "1px solid var(--accent-rose)",
                      boxShadow: "0 4px 20px var(--glow-rose)"
                    }
                  : {
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-cosmic)",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)"
                    }
              }
            >
              {msg.role === "assistant" && currentCallName && (
                <motion.span
                  className="mr-1.5 font-medium"
                  style={{ color: "var(--accent-rose)" }}
                  key={currentCallName}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {currentCallName}：
                </motion.span>
              )}
              <span style={msg.role === "user" ? { color: "var(--text-primary)" } : { color: "var(--text-secondary)" }}>
                {msg.content}
              </span>
            </motion.div>

            <span className="text-[9px] mt-1 px-1" style={{ color: "var(--text-muted)" }}>
              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </motion.div>
        ))}

        {isSending && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div
              className="w-8 h-8 rounded-full overflow-hidden mr-2"
              style={{ boxShadow: "0 0 10px var(--glow-silver)" }}
            >
              <img
                src={getCharacterImage(sign!)}
                alt={boyfriend.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="flex gap-1.5 px-4 py-3 rounded-2xl rounded-bl-md"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-cosmic)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)"
              }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ background: "var(--accent-rose)" }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="px-4 py-3 border-t"
        style={{
          background: "rgba(10, 10, 26, 0.85)",
          borderColor: "var(--border-cosmic)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 -4px 30px rgba(0, 0, 0, 0.3)"
        }}
      >
        <div className="flex gap-3">
          <motion.input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`给${boyfriend.name}发消息...`}
            className="flex-1 px-4 py-2.5 rounded-full text-sm"
            disabled={isSending}
            whileFocus={{ scale: 1.01 }}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-cosmic)",
              color: "var(--text-primary)",
              outline: "none"
            }}
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 rounded-full text-sm font-medium text-white disabled:opacity-50"
            style={{
              background: "var(--gradient-cosmic)",
              border: "1px solid var(--accent-rose)",
              boxShadow: "0 4px 20px var(--glow-rose)"
            }}
          >
            ✦
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function ChatLoading() {
  return (
    <div className="flex-1 flex items-center justify-center relative" style={{ background: "var(--gradient-cosmic)" }}>
      <StarryBackground starCount={60} particleCount={15} />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center gap-4"
      >
        <motion.div
          className="w-12 h-12 rounded-full"
          style={{ background: "var(--gradient-pink)" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.p
          className="text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          正在连接心动信号...
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: "var(--gradient-cosmic)" }}>
      <StarryBackground starCount={80} particleCount={20} />
      <div className="relative z-10 flex flex-col h-screen">
        <Suspense fallback={<ChatLoading />}>
          <ChatContent />
        </Suspense>
      </div>
    </div>
  );
}