"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { BOYFRIENDS, RELATION_STAGE_LABELS, RELATION_STAGE_CONFIG, ZODIAC_SYMBOLS, ZODIAC_COLORS, type ZodiacSign, type RelationStage } from "@/constants";
import StarryBackground from "@/components/StarryBackground";
import { getCharacterImage } from "@/constants/images-game";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  imageUrl?: string;
  imageStatus?: "generating" | "completed" | "failed";
  imageTaskId?: string;
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
  imageGenerating?: boolean;
  imageTaskId?: string | null;
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

interface SidebarProps {
  sign: ZodiacSign;
  stage: RelationStage;
  progressValue: number;
  boyfriend: typeof BOYFRIENDS[ZodiacSign];
}

function Sidebar({ sign, stage, progressValue, boyfriend }: SidebarProps) {
  return (
    <div
      className="hidden lg:flex w-72 flex-col p-6 border-l"
      style={{
        background: "rgba(10, 10, 26, 0.85)",
        borderColor: "var(--border-cosmic)",
        backdropFilter: "blur(20px)"
      }}
    >
      <div className="flex flex-col items-center mb-6">
        <div
          className="w-24 h-24 rounded-full overflow-hidden mb-3"
          style={{ boxShadow: `0 0 25px ${ZODIAC_COLORS[sign]}66` }}
        >
          <img
            src={getCharacterImage(sign)}
            alt={boyfriend.name}
            className="w-full h-full object-cover"
            style={{ objectPosition: "top center" }}
          />
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg" style={{ color: ZODIAC_COLORS[sign] }}>{ZODIAC_SYMBOLS[sign]}</span>
          <h2 className="text-lg font-bold font-display" style={{ color: "var(--text-primary)" }}>
            {boyfriend.name}
          </h2>
        </div>
        <p className="text-sm font-serif-sc" style={{ color: ZODIAC_COLORS[sign] }}>
          {RELATION_STAGE_LABELS[stage]}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>心动进度</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: "var(--accent-rose)", background: "var(--bg-primary)" }}>
            {progressValue}%
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--bg-primary)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              background: stage === "lover" ? "var(--gradient-pink)" : "var(--gradient-gold)",
              boxShadow: stage === "lover" ? "0 0 10px var(--glow-pink)" : "0 0 8px var(--glow-gold)"
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressValue}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xs font-medium mb-3" style={{ color: "var(--text-secondary)" }}>关系阶段</h3>
        <div className="space-y-2">
          {(["stranger", "ambiguous", "crush", "lover"] as RelationStage[]).map((s, idx) => {
            const config = RELATION_STAGE_CONFIG[s];
            const isActive = stage === s;
            const isPast = progressValue >= config.progressThreshold;
            return (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{
                    background: isActive ? "var(--gradient-rose)" : isPast ? "var(--bg-primary)" : "transparent",
                    border: isActive ? "none" : "1px solid var(--border-cosmic)",
                    color: isActive || isPast ? "white" : "var(--text-muted)"
                  }}
                >
                  {idx + 1}
                </div>
                <span
                  className="text-xs"
                  style={{ color: isActive ? "var(--accent-rose)" : isPast ? "var(--text-secondary)" : "var(--text-muted)" }}
                >
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-xs font-medium mb-3 font-serif-sc" style={{ color: "var(--text-secondary)" }}>关于{boyfriend.name}</h3>
        <div className="space-y-2 text-xs font-serif-sc" style={{ color: "var(--text-muted)" }}>
          <p><span style={{ color: ZODIAC_COLORS[sign] }}>职业：</span>{boyfriend.occupation}</p>
          <p><span style={{ color: ZODIAC_COLORS[sign] }}>性格：</span>{boyfriend.personality}</p>
          <p><span style={{ color: ZODIAC_COLORS[sign] }}>聊天风格：</span>{boyfriend.chatStyle}</p>
        </div>
      </div>
    </div>
  );
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
  const pollingRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

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

  // 图片生成轮询
  const startImagePolling = useCallback((messageId: string, taskId: string) => {
    if (pollingRefs.current.has(taskId)) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/image/status/${taskId}`);
        if (!res.ok) throw new Error("查询失败");

        const data = await res.json();

        if (data.status === "completed") {
          // 图片生成完成，更新消息
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, imageUrl: data.imageUrl, imageStatus: "completed" }
                : msg
            )
          );
          // 停止轮询
          const timeout = pollingRefs.current.get(taskId);
          if (timeout) clearTimeout(timeout);
          pollingRefs.current.delete(taskId);
        } else if (data.status === "failed") {
          // 图片生成失败
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, imageStatus: "failed" }
                : msg
            )
          );
          // 停止轮询
          const timeout = pollingRefs.current.get(taskId);
          if (timeout) clearTimeout(timeout);
          pollingRefs.current.delete(taskId);
        } else {
          // 继续轮询，每2秒一次
          const timeout = setTimeout(poll, 2000);
          pollingRefs.current.set(taskId, timeout);
        }
      } catch {
        // 出错后继续轮询
        const timeout = setTimeout(poll, 2000);
        pollingRefs.current.set(taskId, timeout);
      }
    };

    // 开始轮询
    poll();
  }, []);

  // 清理轮询
  useEffect(() => {
    return () => {
      pollingRefs.current.forEach((timeout) => clearTimeout(timeout));
      pollingRefs.current.clear();
    };
  }, []);

  // ESC 键关闭大图
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEnlargedImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
            imageStatus: data.imageGenerating ? "generating" : undefined,
            imageTaskId: data.imageTaskId || undefined,
          };
          setMessages((prev) => [...prev, assistantMessage]);

          // 如果有图片生成任务，开始轮询
          if (data.imageTaskId && data.imageGenerating) {
            startImagePolling(data.message.id, data.imageTaskId);
          }
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
            style={{ objectPosition: "top center" }}
          />
        </motion.div>

        <div className="flex-1">
          <h1
            className="text-sm font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {currentCallName || boyfriend.name}
          </h1>
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

      {/* 消息区域和侧边栏 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧：消息区域 */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* 消息滚动区域 */}
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
                style={{ objectPosition: "top center" }}
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
                  style={{ objectPosition: "top center" }}
                />
              </motion.div>
            )}

            {/* 图片显示区域 */}
            {msg.imageStatus === "generating" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-[65%] mb-2 rounded-xl overflow-hidden px-4 py-3"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-cosmic)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
                }}
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-4 h-4 rounded-full"
                    style={{ background: "var(--accent-rose)" }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    图片正在发送中...
                  </span>
                </div>
              </motion.div>
            )}
            {msg.imageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-[65%] mb-2 rounded-xl overflow-hidden cursor-pointer group relative"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-cosmic)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                  aspectRatio: "3/4",
                  width: "180px"
                }}
                onClick={() => setEnlargedImage(msg.imageUrl!)}
              >
                <img
                  src={msg.imageUrl}
                  alt="场景图片"
                  className="w-full h-full object-cover"
                />
                {/* 悬停提示 */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(0, 0, 0, 0.5)" }}
                >
                  <span className="text-xs text-white">点击放大</span>
                </div>
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
                style={{ objectPosition: "top center" }}
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

          {/* 移动端输入框（在左侧区域内） */}
          <div className="lg:hidden px-4 py-3 border-t" style={{
            background: "rgba(10, 10, 26, 0.85)",
            borderColor: "var(--border-cosmic)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 -4px 30px rgba(0, 0, 0, 0.3)"
          }}>
            <div className="flex gap-3 max-w-3xl mx-auto">
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
          </div>
        </div>

        {/* PC端侧边栏 */}
        <Sidebar sign={sign!} stage={stage} progressValue={progressValue} boyfriend={boyfriend} />
      </div>

      {/* PC端输入框（在底部，占满全宽） */}
      <div className="hidden lg:block px-4 py-3 border-t" style={{
        background: "rgba(10, 10, 26, 0.85)",
        borderColor: "var(--border-cosmic)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 -4px 30px rgba(0, 0, 0, 0.3)"
      }}>
        <div className="flex gap-3 max-w-3xl mx-auto">
          <motion.input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`给${boyfriend.name}发消息...`}
            className="flex-1 px-4 py-2.5 rounded-full text-base"
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
      </div>

      {/* 大图模态框 */}
      <AnimatePresence>
        {enlargedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0, 0, 0, 0.85)" }}
            onClick={() => setEnlargedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 关闭按钮 */}
              <motion.button
                className="absolute -top-12 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ background: "var(--bg-card)" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setEnlargedImage(null)}
              >
                ✕
              </motion.button>
              {/* 大图 */}
              <img
                src={enlargedImage}
                alt="放大图片"
                className="max-w-[90vw] max-h-[85vh] rounded-xl object-contain"
                style={{
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
                }}
              />
              {/* 提示文字 */}
              <p className="text-center text-xs mt-3" style={{ color: "var(--text-muted)" }}>
                按 ESC 或点击背景关闭
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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