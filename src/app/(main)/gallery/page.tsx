"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { BOYFRIENDS, ZODIAC_NAMES, type ZodiacSign } from "@/constants/boyfriends";
import { RELATION_STAGE_LABELS } from "@/constants";
import type { RelationStage } from "@/types";
import StarryBackground from "@/components/StarryBackground";

interface ProgressItem {
  zodiac_sign: string;
  stage: RelationStage;
  progress_value: number;
}

interface MemoryCardItem {
  id: string;
  zodiac_sign: string;
  card_title: string;
  card_content: string;
  stage: string;
  unlocked_at: string;
}

const STAGE_EMOJI: Record<string, string> = {
  stranger: "🤝",
  flirt: "💕",
  heartbeat: "💗",
  lover: "❤️",
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 }
  }
};

const memoryCardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 250, damping: 20 }
  }
};

export default function GalleryPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);
  const [memoryCards, setMemoryCards] = useState<MemoryCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSign, setExpandedSign] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [progressRes, cardsRes] = await Promise.all([
        fetch("/api/progress"),
        fetch("/api/memory-cards"),
      ]);

      if (progressRes.ok) {
        const data = await progressRes.json();
        setProgressList(data.progress || []);
      }

      if (cardsRes.ok) {
        const data = await cardsRes.json();
        setMemoryCards(data.cards || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (authLoading) return;
    if (!user) return;
    fetchData();
  }, [user, router, fetchData, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative" style={{ background: "var(--gradient-cosmic)" }}>
        <StarryBackground starCount={60} particleCount={15} />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center gap-4"
        >
          <motion.div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "var(--gradient-pink)" }}
            animate={{ scale: [1, 1.2, 1], rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-2xl">📖</span>
          </motion.div>
          <motion.p
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            正在加载心动回忆...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const groupedCards: Record<string, MemoryCardItem[]> = {};
  memoryCards.forEach((card) => {
    if (!groupedCards[card.zodiac_sign]) {
      groupedCards[card.zodiac_sign] = [];
    }
    groupedCards[card.zodiac_sign].push(card);
  });

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen relative" style={{ background: "var(--gradient-cosmic)" }}>
      <StarryBackground starCount={100} particleCount={25} />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <motion.h1
              className="text-xl font-bold"
              style={{
                color: "var(--text-primary)",
                textShadow: "0 0 20px var(--glow-rose)"
              }}
              animate={{ textShadow: ["0 0 15px var(--glow-rose)", "0 0 30px var(--glow-rose)", "0 0 15px var(--glow-rose)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              恋爱手账 ✦
            </motion.h1>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              记录每一份心动回忆
            </p>
          </div>
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-xs px-4 py-2 rounded-full"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-muted)",
              border: "1px solid var(--border-cosmic)"
            }}
          >
            退出登录
          </motion.button>
        </motion.div>

        {progressList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center pt-24"
          >
            <motion.div
              className="text-6xl mb-6"
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              📖
            </motion.div>
            <p className="text-base text-center mb-2" style={{ color: "var(--text-primary)" }}>
              你还没有开始任何故事
            </p>
            <p className="text-xs text-center mb-6" style={{ color: "var(--text-secondary)" }}>
              去选择一位心仪的星座男友，开启你的心动之旅吧
            </p>
            <motion.button
              onClick={() => router.push("/select")}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-full text-sm font-medium text-white"
              style={{
                background: "var(--gradient-cosmic)",
                border: "1px solid var(--accent-rose)",
                boxShadow: "0 4px 20px var(--glow-rose)"
              }}
            >
              选择你的男友 ✦
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.2 }
              }
            }}
          >
            {progressList.map((p) => {
              const bf = BOYFRIENDS[p.zodiac_sign as ZodiacSign];
              if (!bf) return null;

              const cards = groupedCards[p.zodiac_sign] || [];
              const isExpanded = expandedSign === p.zodiac_sign;
              const isLover = p.stage === "lover";

              return (
                <motion.div
                  key={p.zodiac_sign}
                  variants={cardVariants}
                  className="rounded-2xl p-4"
                  style={{
                    background: "var(--bg-card)",
                    border: isExpanded ? "1px solid var(--accent-rose)" : "1px solid var(--border-cosmic)",
                    boxShadow: isExpanded ? "0 0 25px var(--glow-rose)" : "0 4px 20px rgba(0, 0, 0, 0.2)"
                  }}
                >
                  <motion.div
                    className="flex items-center gap-3"
                    layout
                  >
                    <motion.div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{
                        background: "var(--bg-primary)",
                        boxShadow: isLover ? "0 0 15px var(--glow-pink)" : "0 0 10px var(--glow-silver)"
                      }}
                      animate={{
                        boxShadow: isLover
                          ? ["0 0 10px var(--glow-pink)", "0 0 20px var(--glow-pink)", "0 0 10px var(--glow-pink)"]
                          : "0 0 10px var(--glow-silver)"
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-2xl">{bf.emoji}</span>
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                          {bf.name}
                        </p>
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {ZODIAC_NAMES[p.zodiac_sign as ZodiacSign]}
                        </span>
                        {isLover && (
                          <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            💕
                          </motion.span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs" style={{ color: "var(--accent-rose)" }}>
                          {STAGE_EMOJI[p.stage]} {RELATION_STAGE_LABELS[p.stage]}
                        </span>
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-primary)", maxWidth: "80px" }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              background: isLover ? "var(--gradient-pink)" : "var(--gradient-gold)"
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${p.progress_value}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {p.progress_value}%
                        </span>
                      </div>
                    </div>

                    <motion.button
                      onClick={() => setExpandedSign(isExpanded ? null : p.zodiac_sign)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full"
                      style={{
                        background: "var(--bg-primary)",
                        color: "var(--text-secondary)"
                      }}
                    >
                      <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        ▼
                      </motion.span>
                    </motion.button>

                    <motion.button
                      onClick={() => router.push(`/chat?sign=${p.zodiac_sign}`)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-full text-xs font-medium"
                      style={{
                        background: isLover ? "var(--gradient-pink)" : "var(--bg-primary)",
                        color: isLover ? "white" : "var(--accent-rose)",
                        boxShadow: isLover ? "0 4px 15px var(--glow-pink)" : "none"
                      }}
                    >
                      {isLover ? "私聊 💕" : "继续 ✦"}
                    </motion.button>
                  </motion.div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border-cosmic)" }}>
                          {cards.length > 0 ? (
                            <motion.div
                              className="space-y-3"
                              initial="hidden"
                              animate="visible"
                              variants={{
                                hidden: { opacity: 0 },
                                visible: { transition: { staggerChildren: 0.08 } }
                              }}
                            >
                              {cards.map((card, idx) => (
                                <motion.div
                                  key={card.id}
                                  variants={memoryCardVariants}
                                  className="rounded-xl p-4"
                                  style={{
                                    background: "var(--bg-primary)",
                                    border: "1px solid var(--border-cosmic)",
                                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)"
                                  }}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <span
                                      className="text-[10px] px-2 py-0.5 rounded-full"
                                      style={{
                                        background: "var(--gradient-gold)",
                                        color: "var(--bg-primary)"
                                      }}
                                    >
                                      {card.stage}
                                    </span>
                                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                                      {new Date(card.unlocked_at).toLocaleDateString("zh-CN", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                      })}
                                    </span>
                                  </div>
                                  <p
                                    className="text-sm font-medium mb-1.5"
                                    style={{ color: "var(--accent-rose)" }}
                                  >
                                    {card.card_title}
                                  </p>
                                  <p
                                    className="text-xs leading-relaxed"
                                    style={{ color: "var(--text-secondary)" }}
                                  >
                                    {card.card_content}
                                  </p>
                                </motion.div>
                              ))}
                            </motion.div>
                          ) : (
                            <div className="text-center py-6">
                              <motion.span
                                className="text-3xl block mb-2"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                💫
                              </motion.span>
                              <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>
                                还没有解锁回忆卡，继续和他聊天吧~
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-xl"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-cosmic)"
          }}
        >
          <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: "var(--accent-moon)" }}>
            <span>💡</span>
            <span>手账提示</span>
          </h3>
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            在恋爱过程中，你会解锁各种回忆卡片，记录你们之间的心动瞬间。点击男友卡片查看详情，继续聊天解锁更多回忆吧。
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="fixed bottom-0 left-0 right-0 z-50 px-5 py-3"
        style={{
          background: "rgba(10, 10, 26, 0.85)",
          borderTop: "1px solid var(--border-cosmic)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 -4px 30px rgba(0, 0, 0, 0.3)"
        }}
      >
        <div className="max-w-lg mx-auto flex justify-around">
          <motion.button
            onClick={() => router.push("/home")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-0.5 py-1 px-4"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="text-lg">🏠</span>
            <span className="text-[10px]">首页</span>
          </motion.button>
          <motion.button
            onClick={() => router.push("/select")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-0.5 py-1 px-4"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="text-lg">✨</span>
            <span className="text-[10px]">选择</span>
          </motion.button>
          <motion.button
            onClick={() => router.push("/gallery")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-0.5 py-1 px-4 relative"
            style={{ color: "var(--accent-rose)" }}
          >
            <span className="text-lg">📖</span>
            <span className="text-[10px] font-medium">手账</span>
            <motion.div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
              style={{ background: "var(--gradient-pink)" }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}