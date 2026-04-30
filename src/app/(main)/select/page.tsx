"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { BOYFRIENDS, ZODIAC_NAMES, ZODIAC_SIGNS, ZODIAC_SYMBOLS, ZODIAC_COLORS, RELATION_STAGE_LABELS, type ZodiacSign, type RelationStage } from "@/constants";
import StarryBackground from "@/components/StarryBackground";
import { getCharacterImage, getZodiacEmoji } from "@/constants/images-game";

interface ProgressItem {
  zodiac_sign: string;
  stage: RelationStage;
  progress_value: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 25,
      delay: 0.3
    }
  },
  hover: {
    scale: 1.03,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
};

export default function SelectPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);
  const [hoveredSign, setHoveredSign] = useState<ZodiacSign | null>(null);

  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch("/api/progress");
      if (res.ok) {
        const data = await res.json();
        setProgressList(data.progress || []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchProgress();
    }
  }, [user, authLoading, router, fetchProgress]);

  const handleStart = async () => {
    if (!selectedSign || !user) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zodiac_sign: selectedSign }),
      });

      if (res.ok) {
        router.push(`/chat?sign=${selectedSign}`);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressForSign = (sign: ZodiacSign) => {
    return progressList.find((p) => p.zodiac_sign === sign);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative" style={{ background: "var(--gradient-cosmic)" }}>
        <StarryBackground starCount={60} particleCount={15} />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center gap-4"
        >
          <div className="relative w-16 h-16">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: "var(--gradient-pink)" }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="absolute inset-2 rounded-full flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
              <motion.span
                className="text-2xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                ✦
              </motion.span>
            </div>
          </div>
          <motion.p
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            正在连接心动宇宙...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const selectedProgress = selectedSign ? getProgressForSign(selectedSign) : null;
  const hoveredProgress = hoveredSign ? getProgressForSign(hoveredSign) : null;
  const displaySign = selectedSign || hoveredSign;
  const displayProgress = selectedSign ? selectedProgress : hoveredProgress;

  return (
    <div className="min-h-screen relative" style={{ background: "var(--gradient-cosmic)" }}>
      <StarryBackground starCount={100} particleCount={25} />

      <div className="relative z-10 px-4 lg:px-12 pt-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <motion.h1
            className="text-2xl lg:text-3xl font-bold mb-2 font-display title-gradient"
            style={{
              textShadow: "0 0 30px var(--glow-rose)"
            }}
            animate={{ textShadow: ["0 0 20px var(--glow-rose)", "0 0 40px var(--glow-rose)", "0 0 20px var(--glow-rose)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            探索心动宇宙
          </motion.h1>
          <p className="text-sm font-serif-sc" style={{ color: "var(--text-secondary)" }}>
            十二星座，十二种心动可能
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3"
        >
          {ZODIAC_SIGNS.map((sign) => {
            const bf = BOYFRIENDS[sign];
            const isSelected = selectedSign === sign;
            const isHovered = hoveredSign === sign;
            const progress = getProgressForSign(sign);
            const hasProgress = !!progress;
            const isLover = progress?.stage === "lover";

            return (
              <motion.button
                key={sign}
                variants={itemVariants}
                whileHover="hover"
                onHoverStart={() => setHoveredSign(sign)}
                onHoverEnd={() => setHoveredSign(null)}
                onClick={() => setSelectedSign(sign)}
                className="relative p-3 rounded-2xl border glass-card-enhanced"
                style={{
                  borderColor: isSelected
                    ? ZODIAC_COLORS[sign]
                    : hasProgress
                    ? "var(--accent-gold)"
                    : "var(--border-cosmic)",
                  background: isSelected || isHovered
                    ? "var(--bg-card-hover)"
                    : "var(--bg-card)",
                  boxShadow: isSelected
                    ? `0 0 20px ${ZODIAC_COLORS[sign]}66`
                    : isHovered
                    ? `0 0 15px ${ZODIAC_COLORS[sign]}44`
                    : "none"
                }}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                    style={{
                      background: "var(--gradient-pink)",
                      color: "white",
                      boxShadow: "0 0 10px var(--glow-pink)"
                    }}
                  >
                    ✦
                  </motion.div>
                )}

                {/* 图片区域 - 填满整个上部 */}
                <div className="relative w-full aspect-[3/4] mb-2 overflow-hidden rounded-xl">
                  <img
                    src={getCharacterImage(sign)}
                    alt={bf.name}
                    className="w-full h-full object-cover"
                    style={{
                      opacity: isSelected || isHovered ? 1 : 0.85,
                    }}
                  />
                  {/* 选中标记 */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                      style={{
                        background: "var(--gradient-pink)",
                        color: "white",
                        boxShadow: "0 0 10px var(--glow-pink)"
                      }}
                    >
                      ✦
                    </motion.div>
                  )}
                  {/* 关系阶段标签 */}
                  {hasProgress && !isLover && (
                    <div
                      className="absolute bottom-2 left-2 text-[9px] px-2 py-1 rounded-full whitespace-nowrap"
                      style={{
                        background: "rgba(0,0,0,0.6)",
                        color: "var(--accent-gold)",
                        backdropFilter: "blur(4px)"
                      }}
                    >
                      {RELATION_STAGE_LABELS[progress.stage]}
                    </div>
                  )}
                  {/* 恋人标记 */}
                  {isLover && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute bottom-2 left-2 text-[9px] px-2 py-1 rounded-full whitespace-nowrap"
                      style={{
                        background: "rgba(236, 72, 153, 0.8)",
                        color: "white",
                        backdropFilter: "blur(4px)"
                      }}
                    >
                      💕 恋人
                    </motion.div>
                  )}
                </div>

                {/* 文字区域 */}
                <div className="text-center" style={{ minHeight: "42px" }}>
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <span className="text-base" style={{ color: ZODIAC_COLORS[sign] }}>{ZODIAC_SYMBOLS[sign]}</span>
                    <p className="text-sm font-bold font-serif-sc" style={{ color: "var(--text-primary)" }}>
                      {ZODIAC_NAMES[sign]}
                    </p>
                  </div>
                  <p className="text-sm font-bold truncate font-display" style={{ color: ZODIAC_COLORS[sign], textShadow: `0 0 8px ${ZODIAC_COLORS[sign]}66` }}>
                    {bf.name}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          {displaySign && (
            <motion.div
              key={displaySign}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              whileHover="hover"
              className="mt-6 p-5 rounded-2xl border"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border-cosmic)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  className="w-16 h-16 rounded-full overflow-hidden"
                  style={{
                    background: "var(--bg-primary)",
                    boxShadow: "0 0 20px var(--glow-rose)"
                  }}
                  animate={{ boxShadow: ["0 0 15px var(--glow-rose)", "0 0 25px var(--glow-rose)", "0 0 15px var(--glow-rose)"] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <img
                    src={getCharacterImage(displaySign)}
                    alt={BOYFRIENDS[displaySign].name}
                    className="w-full h-full object-cover"
                    style={{ filter: "drop-shadow(0 0 5px var(--accent-rose))" }}
                  />
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl" style={{ color: ZODIAC_COLORS[displaySign] }}>{ZODIAC_SYMBOLS[displaySign]}</span>
                    <h3 className="text-base font-bold font-display" style={{ color: "var(--text-primary)" }}>
                      {BOYFRIENDS[displaySign].name}
                    </h3>
                    {displayProgress?.stage === "lover" && (
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-sm"
                      >
                        💕
                      </motion.span>
                    )}
                  </div>
                  <p className="text-xs mb-1 font-serif-sc" style={{ color: ZODIAC_COLORS[displaySign] }}>
                    {BOYFRIENDS[displaySign].personality}
                  </p>
                  {displayProgress && (
                    <div className="flex items-center gap-2">
                      <div
                        className="flex-1 h-1.5 rounded-full overflow-hidden"
                        style={{ background: "var(--bg-primary)" }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: displayProgress.stage === "lover"
                              ? "var(--gradient-pink)"
                              : "var(--gradient-gold)"
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${displayProgress.progress_value}%` }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                        />
                      </div>
                      <span className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>
                        {displayProgress.progress_value}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs leading-relaxed mb-4 font-serif-sc" style={{ color: "var(--text-secondary)" }}>
                {BOYFRIENDS[displaySign].introduction}
              </p>

              {BOYFRIENDS[displaySign].occupation && (
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-xs px-3 py-1.5 rounded-full"
                    style={{
                      background: "var(--bg-primary)",
                      color: "var(--accent-moon)",
                      border: "1px solid var(--border-cosmic)"
                    }}
                  >
                    💼 {BOYFRIENDS[displaySign].occupation}
                  </span>
                </div>
              )}

              <motion.button
                onClick={handleStart}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-full text-sm font-medium text-white relative overflow-hidden"
                style={{
                  background: "var(--gradient-cosmic)",
                  boxShadow: "0 4px 20px var(--glow-rose)"
                }}
              >
                <motion.span
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-rose) 0%, var(--accent-gold) 100%)",
                    opacity: 0
                  }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10">
                  {isLoading
                    ? "正在连接心动信号..."
                    : displayProgress
                    ? `继续和${BOYFRIENDS[displaySign].name}的故事 ✦`
                    : `开始和${BOYFRIENDS[displaySign].name}的故事 ✦`}
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-4 rounded-xl"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-cosmic)"
          }}
        >
          <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: "var(--accent-moon)" }}>
            <span>💡</span>
            <span>心动提示</span>
          </h3>
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            与心仪的星座男友深入交流，解锁他的全部故事。当你与他的亲密度达到100%时，他将正式成为你的恋人，随时随地与你互动。
          </p>
        </motion.div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-50 px-5 py-3"
        style={{
          background: "rgba(10, 10, 26, 0.85)",
          borderTop: "1px solid var(--border-cosmic)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 -4px 30px rgba(0, 0, 0, 0.3)"
        }}
      >
        <div className="flex justify-around">
          <motion.button
            onClick={() => router.push("/home")}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-0.5 py-1 px-4"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="text-lg">🏠</span>
            <span className="text-[10px]">首页</span>
          </motion.button>
          <motion.button
            onClick={() => router.push("/select")}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-0.5 py-1 px-4 relative"
            style={{ color: "var(--accent-rose)" }}
          >
            <span className="text-lg">✨</span>
            <span className="text-[10px] font-medium">选择</span>
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
              style={{ background: "var(--gradient-pink)" }}
            />
          </motion.button>
          <motion.button
            onClick={() => router.push("/gallery")}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-0.5 py-1 px-4"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="text-lg">📖</span>
            <span className="text-[10px]">手账</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}