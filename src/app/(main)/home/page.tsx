"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getCharacterImage, getZodiacEmoji } from "@/constants/images-game";
import { BOYFRIENDS, ZODIAC_NAMES, RELATION_STAGE_CONFIG, type ZodiacSign, type RelationStage } from "@/constants";
import type { Progress } from "@/types";
import { motion } from "framer-motion";
import StarryBackground from "@/components/StarryBackground";

interface CurrentProgress extends Progress {
  id?: number;
  user_id?: number;
}

function LogoSection() {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center gap-4 mb-8"
    >
      <div
        className="relative w-20 h-20 rounded-full overflow-hidden glow-border animate-glow-pulse"
        style={{ background: "var(--bg-card)" }}
      >
        {!imgLoaded && (
          <div className="absolute inset-0 animate-shimmer" />
        )}
        <img
          src="https://picsum.photos/seed/zodiac-logo/400/400"
          alt="Logo"
          className="w-full h-full object-cover"
          onLoad={() => setImgLoaded(true)}
          style={{ opacity: imgLoaded ? 1 : 0 }}
        />
      </div>
      <div className="text-center">
        <h1 className="text-xl font-bold cosmic-title tracking-wide">
          12星座男友手账
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--accent-moon)" }}>
          心动宇宙 · 遇见你的他
        </p>
      </div>
    </motion.div>
  );
}

function CurrentBoyfriendCard({
  progress,
  onChat,
  onChange,
}: {
  progress: CurrentProgress;
  onChat: () => void;
  onChange: () => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [statusText, setStatusText] = useState("");

  const boyfriend = BOYFRIENDS[progress.zodiac_sign as ZodiacSign];
  const stageConfig = RELATION_STAGE_CONFIG[progress.stage as RelationStage];

  useEffect(() => {
    const texts = stageConfig.statusTexts;
    const randomIndex = Math.floor(Math.random() * texts.length);
    setStatusText(texts[randomIndex]);
  }, [stageConfig]);

  const progressPercentage = progress.progress_value;
  const stageThresholds = Object.entries(RELATION_STAGE_CONFIG).map(([key, config]) => ({
    stage: key,
    threshold: config.progressThreshold,
  }));
  const sortedThresholds = stageThresholds.sort((a, b) => a.threshold - b.threshold);

  const getCurrentStageIndex = () => {
    for (let i = sortedThresholds.length - 1; i >= 0; i--) {
      if (progressPercentage >= sortedThresholds[i].threshold) {
        return i;
      }
    }
    return 0;
  };

  const currentStageIndex = getCurrentStageIndex();
  const nextThreshold = sortedThresholds[currentStageIndex + 1]?.threshold || 100;
  const currentThreshold = sortedThresholds[currentStageIndex].threshold;
  const stageProgress = nextThreshold === 100
    ? ((progressPercentage - currentThreshold) / (100 - currentThreshold)) * 100
    : ((progressPercentage - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full rounded-2xl overflow-hidden mb-6 glass-card"
    >
      <div className="absolute inset-0 bg-gradient-br from-[var(--accent-rose)]/10 to-transparent" />

      <div className="relative z-10 p-6">
        <div className="flex items-center gap-5 mb-5">
          <motion.div
            className="relative w-24 h-24 rounded-full overflow-hidden glow-border flex-shrink-0 card-inner-glow"
            style={{ background: "var(--bg-primary)" }}
            whileHover={{ scale: 1.05 }}
          >
            {!imgLoaded && (
              <div className="absolute inset-0 animate-shimmer" />
            )}
            <img
              src={getCharacterImage(progress.zodiac_sign as ZodiacSign)}
              alt={boyfriend.name}
              className="w-full h-full object-cover"
              onLoad={() => setImgLoaded(true)}
              style={{ opacity: imgLoaded ? 1 : 0 }}
            />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl zodiac-icon">{getZodiacEmoji(progress.zodiac_sign as ZodiacSign)}</span>
              <span className="text-sm font-medium px-2 py-0.5 rounded-full glass-card"
                style={{ color: "var(--accent-moon)", borderColor: "var(--accent-moon)" }}>
                {ZODIAC_NAMES[progress.zodiac_sign as ZodiacSign]}
              </span>
            </div>
            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              {boyfriend.name}
            </h2>
            <p className="text-sm" style={{ color: "var(--accent-rose)" }}>
              {stageConfig.label}
            </p>
          </div>

          <motion.button
            onClick={onChange}
            className="px-4 py-2 rounded-full text-sm glass-card-hover"
            style={{ border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            切换
          </motion.button>
        </div>

        <p className="text-sm mb-5 italic" style={{ color: "var(--text-secondary)" }}>
          "{statusText}"
        </p>

        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              心动进度
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full glass-card" style={{ color: "var(--accent-rose)" }}>
              {stageConfig.label} · {progressPercentage}%
            </span>
          </div>

          <div className="h-3 rounded-full overflow-hidden glass-card" style={{ background: "var(--bg-primary)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "var(--gradient-rose)",
                boxShadow: "0 0 15px var(--glow-rose)"
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(stageProgress, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>

          <div className="flex justify-between mt-2">
            {sortedThresholds.map((threshold, index) => (
              <div
                key={threshold.stage}
                className={`text-[10px] ${progressPercentage >= threshold.threshold ? "opacity-100" : "opacity-40"}`}
                style={{ color: progressPercentage >= threshold.threshold ? "var(--accent-rose)" : "var(--text-muted)" }}
              >
                {RELATION_STAGE_CONFIG[threshold.stage as RelationStage].label}
              </div>
            ))}
          </div>
        </div>

        <motion.button
          onClick={onChat}
          className="w-full py-4 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2"
          style={{ background: "var(--gradient-rose)", boxShadow: "0 4px 25px var(--glow-rose)" }}
          whileHover={{ scale: 1.02, boxShadow: "0 8px 35px var(--glow-rose)" }}
          whileTap={{ scale: 0.98 }}
        >
          <span>💬</span>
          <span>进入聊天</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

function NoBoyfriendCard({ onSelect }: { onSelect: () => void }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full rounded-2xl overflow-hidden mb-6 glass-card"
    >
      <div className="absolute inset-0 bg-gradient-br from-[var(--accent-moon)]/10 to-transparent" />

      <div className="relative z-10 p-8 text-center">
        <motion.div
          className="w-28 h-28 mx-auto rounded-full overflow-hidden mb-6 glow-border-moon"
          style={{ background: "var(--bg-primary)" }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {!imgLoaded && (
            <div className="w-full h-full animate-shimmer" />
          )}
          <img
            src="https://picsum.photos/seed/zodiac-hero/400/500"
            alt="选择一个男友"
            className="w-full h-full object-cover"
            onLoad={() => setImgLoaded(true)}
            style={{ opacity: imgLoaded ? 0.7 : 0 }}
          />
        </motion.div>

        <h2 className="text-lg font-bold mb-2 cosmic-title">
          选择你的心动男友
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          12位星座男友等待着与你相遇
        </p>

        <motion.button
          onClick={onSelect}
          className="w-full py-4 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2"
          style={{ background: "var(--gradient-moon)", boxShadow: "0 4px 25px var(--glow-moon)" }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>✨</span>
          <span>开始选择</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

function QuickActions({ onGallery }: { onGallery: () => void }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="grid grid-cols-3 gap-4 mb-6"
    >
      {[
        { icon: "📖", label: "恋爱手账", path: "/gallery" },
        { icon: "⭐", label: "星座图鉴", path: "/select" },
        { icon: "💕", label: "恋人日常", path: "/gallery" },
      ].map((item, idx) => (
        <motion.button
          key={item.label}
          onClick={() => router.push(item.path)}
          className="glass-card glass-card-hover p-4 text-center"
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="text-2xl mb-2">{item.icon}</div>
          <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</div>
        </motion.button>
      ))}
    </motion.div>
  );
}

function BottomNav({ current }: { current: string }) {
  const router = useRouter();

  const navItems = [
    { id: "home", icon: "🏠", label: "首页", path: "/home" },
    { id: "select", icon: "✨", label: "选择", path: "/select" },
    { id: "gallery", icon: "📖", label: "手账", path: "/gallery" },
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-0 left-0 right-0 z-50 px-6 py-4"
      style={{ background: "rgba(10, 10, 26, 0.9)", backdropFilter: "blur(20px)", borderTop: "1px solid var(--border-light)" }}
    >
      <div className="max-w-lg mx-auto flex justify-around">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => router.push(item.path)}
            className="flex flex-col items-center gap-1 transition-all"
            style={{ color: current === item.id ? "var(--accent-rose)" : "var(--text-muted)" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
            {current === item.id && (
              <motion.div
                className="w-1 h-1 rounded-full"
                style={{ background: "var(--accent-rose)" }}
                layoutId="navIndicator"
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentProgress, setCurrentProgress] = useState<CurrentProgress | null>(null);
  const [allProgress, setAllProgress] = useState<CurrentProgress[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchProgress() {
      if (!user) return;

      try {
        const res = await fetch("/api/progress");
        const data = await res.json();

        if (data.progress && data.progress.length > 0) {
          const progressList = data.progress as CurrentProgress[];
          setAllProgress(progressList);
          setCurrentProgress(progressList[0]);
        } else {
          setCurrentProgress(null);
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error);
      } finally {
        setDataLoading(false);
      }
    }

    if (user) {
      fetchProgress();
    }
  }, [user]);

  const handleStartChat = () => {
    if (currentProgress) {
      router.push(`/chat?sign=${currentProgress.zodiac_sign}`);
    }
  };

  const handleSelectBoyfriend = () => {
    router.push("/select");
  };

  const handleChangeBoyfriend = () => {
    router.push("/select");
  };

  const handleGoToGallery = () => {
    router.push("/gallery");
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <StarryBackground starCount={50} particleCount={10} />
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-3">
            <div className="w-3 h-3 rounded-full typing-dot" style={{ background: "var(--accent-rose)" }} />
            <div className="w-3 h-3 rounded-full typing-dot" style={{ background: "var(--accent-rose)", animationDelay: "0.2s" }} />
            <div className="w-3 h-3 rounded-full typing-dot" style={{ background: "var(--accent-rose)", animationDelay: "0.4s" }} />
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>正在连接心动...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: "var(--gradient-cosmic)" }}>
      <StarryBackground starCount={80} particleCount={20} />

      <div className="relative z-10 max-w-lg mx-auto px-5 pt-14 pb-28">
        <LogoSection />

        {currentProgress ? (
          <CurrentBoyfriendCard
            progress={currentProgress}
            onChat={handleStartChat}
            onChange={handleChangeBoyfriend}
          />
        ) : (
          <NoBoyfriendCard onSelect={handleSelectBoyfriend} />
        )}

        <QuickActions onGallery={handleGoToGallery} />

        {allProgress.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-4 mb-6"
          >
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              已攻略恋人 ({allProgress.filter(p => p.stage === "lover").length}/12)
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allProgress.filter(p => p.stage === "lover").map((p) => {
                const bf = BOYFRIENDS[p.zodiac_sign as ZodiacSign];
                return (
                  <motion.button
                    key={p.zodiac_sign}
                    onClick={() => router.push(`/chat?sign=${p.zodiac_sign}`)}
                    className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden glow-border"
                    style={{ background: "var(--bg-primary)" }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <img
                      src={getCharacterImage(p.zodiac_sign as ZodiacSign)}
                      alt={bf.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card p-5 mb-6"
        >
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <span>💡</span>
            <span>收集进度</span>
          </h3>
          <div className="flex gap-2">
            {Array.from({ length: 12 }).map((_, i) => {
              const sign = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"][i] as ZodiacSign;
              const isCollected = allProgress.some(p => p.zodiac_sign === sign && p.stage === "lover");
              return (
                <motion.div
                  key={i}
                  className="flex-1 h-8 rounded-lg flex items-center justify-center text-sm zodiac-icon"
                  style={{
                    background: isCollected ? "var(--gradient-rose)" : "var(--bg-primary)",
                    color: isCollected ? "var(--bg-primary)" : "var(--text-muted)",
                    opacity: isCollected ? 1 : 0.4,
                  }}
                  whileHover={{ scale: 1.2, y: -2 }}
                >
                  {getZodiacEmoji(sign)}
                </motion.div>
              );
            })}
          </div>
          <p className="text-xs text-center mt-3" style={{ color: "var(--text-secondary)" }}>
            已收集 {allProgress.filter(p => p.stage === "lover").length}/12 位恋人
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center py-6"
        >
          <p className="text-xs tracking-widest" style={{ color: "var(--text-muted)" }}>
            ✦ 心动宇宙 · 与你相遇 ✦
          </p>
        </motion.div>
      </div>

      <BottomNav current="home" />
    </div>
  );
}
