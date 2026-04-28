"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GAME_IMAGES, getCharacterImage, getZodiacEmoji } from "@/constants/images-game";
import { StarField, AuroraBackground } from "@/components/BackgroundEffects";
import { BOYFRIENDS, ZODIAC_NAMES, RELATION_STAGE_CONFIG, type ZodiacSign, type RelationStage } from "@/constants";
import type { Progress } from "@/types";

interface CurrentProgress extends Progress {
  id?: number;
  user_id?: number;
}

function LogoSection() {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3 mb-6 animate-float">
      <div
        className="relative w-16 h-16 rounded-full overflow-hidden glow-border animate-glow-pulse"
        style={{ background: "var(--bg-card)" }}
      >
        {!imgLoaded && (
          <div className="absolute inset-0 animate-shimmer" />
        )}
        <img
          src={GAME_IMAGES.logo}
          alt="Logo"
          className="w-full h-full object-cover"
          onLoad={() => setImgLoaded(true)}
          style={{ opacity: imgLoaded ? 1 : 0 }}
        />
      </div>
      <div className="text-center">
        <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          12星座男友手账
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--accent-pink)" }}>
          心动宇宙 · 遇见你的他
        </p>
      </div>
    </div>
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
    <div className="relative w-full rounded-2xl overflow-hidden mb-6 glow-border" style={{ background: "var(--bg-card)" }}>
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-pink)]/10 to-transparent" />

      <div className="relative z-10 p-5">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="relative w-20 h-20 rounded-full overflow-hidden glow-border flex-shrink-0"
            style={{ background: "var(--bg-primary)" }}
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
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{getZodiacEmoji(progress.zodiac_sign as ZodiacSign)}</span>
              <span className="text-sm font-medium" style={{ color: "var(--accent-pink)" }}>
                {ZODIAC_NAMES[progress.zodiac_sign as ZodiacSign]}
              </span>
            </div>
            <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              {boyfriend.name}
            </h2>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {stageConfig.label}
            </p>
          </div>

          <button
            onClick={onChange}
            className="px-3 py-1.5 rounded-full text-xs transition-all hover:scale-105"
            style={{ border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
          >
            切换
          </button>
        </div>

        <p className="text-sm mb-4 italic" style={{ color: "var(--text-secondary)" }}>
          "{statusText}"
        </p>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              心动进度
            </span>
            <span className="text-xs" style={{ color: "var(--accent-pink)" }}>
              {stageConfig.label}
            </span>
          </div>

          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-primary)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(stageProgress, 100)}%`,
                background: "var(--gradient-pink)",
                boxShadow: "0 0 10px var(--glow-pink)"
              }}
            />
          </div>

          <div className="flex justify-between mt-1.5">
            {sortedThresholds.map((threshold, index) => (
              <div
                key={threshold.stage}
                className={`text-[10px] ${progressPercentage >= threshold.threshold ? "opacity-100" : "opacity-40"}`}
                style={{ color: progressPercentage >= threshold.threshold ? "var(--accent-pink)" : "var(--text-muted)" }}
              >
                {RELATION_STAGE_CONFIG[threshold.stage as RelationStage].label}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onChat}
          className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "var(--gradient-pink)", boxShadow: "0 4px 20px var(--glow-pink)" }}
        >
          💬 进入聊天
        </button>
      </div>
    </div>
  );
}

function NoBoyfriendCard({ onSelect }: { onSelect: () => void }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden mb-6 glow-border" style={{ background: "var(--bg-card)" }}>
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-gold)]/10 to-transparent" />

      <div className="relative z-10 p-5 text-center">
        <div
          className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-4 glow-border"
          style={{ background: "var(--bg-primary)" }}
        >
          {!imgLoaded && (
            <div className="w-full h-full animate-shimmer" />
          )}
          <img
            src={GAME_IMAGES.heroScene}
            alt="选择一个男友"
            className="w-full h-full object-cover"
            onLoad={() => setImgLoaded(true)}
            style={{ opacity: imgLoaded ? 0.7 : 0 }}
          />
        </div>

        <h2 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          选择你的心动男友
        </h2>
        <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
          12位星座男友等待着与你相遇
        </p>

        <button
          onClick={onSelect}
          className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "var(--gradient-pink)", boxShadow: "0 4px 20px var(--glow-pink)" }}
        >
          ✨ 开始选择
        </button>
      </div>
    </div>
  );
}

function QuickActions({ onGallery }: { onGallery: () => void }) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <button
        onClick={onGallery}
        className="glass-card p-3 text-center transition-all hover:scale-[1.02]"
      >
        <div className="text-2xl mb-1">📖</div>
        <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>恋爱手账</div>
      </button>
      <button
        onClick={onGallery}
        className="glass-card p-3 text-center transition-all hover:scale-[1.02]"
      >
        <div className="text-2xl mb-1">⭐</div>
        <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>星座图鉴</div>
      </button>
      <button
        onClick={onGallery}
        className="glass-card p-3 text-center transition-all hover:scale-[1.02]"
      >
        <div className="text-2xl mb-1">💕</div>
        <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>恋人日常</div>
      </button>
    </div>
  );
}

function FeatureCards() {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="glass-card p-3 text-center">
        <div className="text-xl mb-1">💬</div>
        <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>心动聊天</div>
      </div>
      <div className="glass-card p-3 text-center">
        <div className="text-xl mb-1">✨</div>
        <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>回忆收集</div>
      </div>
      <div className="glass-card p-3 text-center">
        <div className="text-xl mb-1">📖</div>
        <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>故事进展</div>
      </div>
    </div>
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
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-5 py-3 flex justify-around"
      style={{ background: "rgba(5,10,18,0.95)", borderTop: "1px solid var(--border-light)", backdropFilter: "blur(16px)" }}
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => router.push(item.path)}
          className="flex flex-col items-center gap-0.5 transition-all"
          style={{ color: current === item.id ? "var(--accent-pink)" : "var(--text-muted)" }}
        >
          <span className="text-lg">{item.icon}</span>
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </div>
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

          const currentSign = progressList[0]?.zodiac_sign;
          if (currentSign) {
            setCurrentProgress(progressList[0]);
          }
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent-pink)" }} />
            <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent-pink)", animationDelay: "0.2s" }} />
            <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent-pink)", animationDelay: "0.4s" }} />
          </div>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: "var(--bg-primary)" }}>
      <StarField />
      <AuroraBackground />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-12 pb-24">
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

        {allProgress.length > 0 && allProgress.length > 1 && (
          <div className="glass-card p-4 mb-6">
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              已攻略恋人 ({allProgress.filter(p => p.stage === "lover").length}/12)
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {allProgress.filter(p => p.stage === "lover").map((p) => {
                const bf = BOYFRIENDS[p.zodiac_sign as ZodiacSign];
                return (
                  <button
                    key={p.zodiac_sign}
                    onClick={() => router.push(`/chat?sign=${p.zodiac_sign}`)}
                    className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden glow-border"
                    style={{ background: "var(--bg-primary)" }}
                  >
                    <img
                      src={getCharacterImage(p.zodiac_sign as ZodiacSign)}
                      alt={bf.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="glass-card p-4 mb-6">
          <h3 className="text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            💡 收集进度
          </h3>
          <div className="flex gap-1.5">
            {Array.from({ length: 12 }).map((_, i) => {
              const sign = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"][i] as ZodiacSign;
              const isCollected = allProgress.some(p => p.zodiac_sign === sign && p.stage === "lover");
              return (
                <div
                  key={i}
                  className="flex-1 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{
                    background: isCollected ? "var(--gradient-pink)" : "var(--bg-primary)",
                    color: isCollected ? "white" : "var(--text-muted)",
                    opacity: isCollected ? 1 : 0.5,
                  }}
                >
                  {getZodiacEmoji(sign)}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-center mt-2" style={{ color: "var(--text-secondary)" }}>
            已收集 {allProgress.filter(p => p.stage === "lover").length}/12 位恋人
          </p>
        </div>

        <div className="text-center py-4">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            心动宇宙 · 与你相遇
          </p>
        </div>
      </div>

      <BottomNav current="home" />
    </div>
  );
}
