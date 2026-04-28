"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { BOYFRIENDS, ZODIAC_NAMES, ZODIAC_SIGNS, RELATION_STAGE_LABELS, type ZodiacSign, type RelationStage } from "@/constants";
import { StarField, AuroraBackground } from "@/components/BackgroundEffects";
import { getCharacterImage, getZodiacEmoji } from "@/constants/images-game";

interface ProgressItem {
  zodiac_sign: string;
  stage: RelationStage;
  progress_value: number;
}

export default function SelectPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);

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

  if (!user) {
    return null;
  }

  const selectedProgress = selectedSign ? getProgressForSign(selectedSign) : null;

  return (
    <div className="min-h-screen relative" style={{ background: "var(--bg-primary)" }}>
      <StarField />
      <AuroraBackground />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-12 pb-24">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            选择你的心动男友
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            十二星座，十二种心动
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {ZODIAC_SIGNS.map((sign) => {
            const bf = BOYFRIENDS[sign];
            const isSelected = selectedSign === sign;
            const progress = getProgressForSign(sign);
            const hasProgress = !!progress;

            return (
              <button
                key={sign}
                onClick={() => setSelectedSign(sign)}
                className={`relative p-3 rounded-2xl border transition-all duration-200 ${
                  isSelected ? "scale-[1.02]" : "hover:scale-[1.02]"
                }`}
                style={
                  isSelected
                    ? { borderColor: "var(--accent-pink)", background: "rgba(13,27,46,0.9)" }
                    : { borderColor: hasProgress ? "var(--accent-gold)" : "var(--border-light)", background: "rgba(13,27,46,0.6)" }
                }
              >
                {isSelected && (
                  <div
                    className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
                    style={{ background: "var(--accent-pink)", color: "white" }}
                  >
                    ✓
                  </div>
                )}

                <div
                  className={`w-12 h-12 mx-auto rounded-full mb-2 overflow-hidden flex items-center justify-center ${
                    isSelected ? "glow-border" : ""
                  }`}
                  style={{ background: "var(--bg-primary)" }}
                >
                  <img
                    src={getCharacterImage(sign)}
                    alt={bf.name}
                    className="w-full h-full object-cover"
                    style={{ opacity: 0.8 }}
                  />
                </div>

                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-sm">{getZodiacEmoji(sign)}</span>
                  <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                    {ZODIAC_NAMES[sign]}
                  </p>
                </div>

                <p className="text-[10px] text-center truncate" style={{ color: "var(--text-secondary)" }}>
                  {bf.name}
                </p>

                {hasProgress && progress.stage === "lover" && (
                  <div
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px]"
                    style={{ background: "var(--gradient-pink)", color: "white" }}
                  >
                    💕
                  </div>
                )}

                {hasProgress && progress.stage !== "lover" && (
                  <div
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] px-1.5 py-0.5 rounded-full whitespace-nowrap"
                    style={{ background: "var(--accent-gold)", color: "var(--bg-primary)" }}
                  >
                    {RELATION_STAGE_LABELS[progress.stage]}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {selectedSign && (
          <div className="mt-6 p-4 rounded-2xl border" style={{ background: "rgba(13,27,46,0.8)", borderColor: "var(--border-light)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-14 h-14 rounded-full overflow-hidden glow-border"
                style={{ background: "var(--bg-primary)" }}
              >
                <img
                  src={getCharacterImage(selectedSign)}
                  alt={BOYFRIENDS[selectedSign].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{getZodiacEmoji(selectedSign)}</span>
                  <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {BOYFRIENDS[selectedSign].name}
                  </h3>
                </div>
                <p className="text-xs" style={{ color: "var(--accent-pink)" }}>
                  {BOYFRIENDS[selectedSign].personality}
                </p>
                {selectedProgress && (
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {RELATION_STAGE_LABELS[selectedProgress.stage]} · {selectedProgress.progress_value}%
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
              {BOYFRIENDS[selectedSign].introduction}
            </p>

            {BOYFRIENDS[selectedSign].occupation && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}>
                  职业：{BOYFRIENDS[selectedSign].occupation}
                </span>
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={isLoading}
              className="w-full py-3 rounded-full text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: "var(--gradient-pink)", boxShadow: "0 4px 16px var(--glow-pink)" }}
            >
              {isLoading
                ? "请稍候..."
                : selectedProgress
                ? `继续和${BOYFRIENDS[selectedSign].name}的故事`
                : `开始和${BOYFRIENDS[selectedSign].name}的故事`}
            </button>
          </div>
        )}

        <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(13,27,46,0.6)", border: "1px solid var(--border-light)" }}>
          <h3 className="text-xs font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            💡 收集提示
          </h3>
          <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            攻略完成后，该星座男友将进入"恋人日常区"。你可以随时回来与他们聊天，继续探索更多故事。
          </p>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-50 px-5 py-3 flex justify-around"
        style={{ background: "rgba(5,10,18,0.95)", borderTop: "1px solid var(--border-light)", backdropFilter: "blur(16px)" }}
      >
        <button
          onClick={() => router.push("/home")}
          className="flex flex-col items-center gap-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          <span className="text-lg">🏠</span>
          <span className="text-[10px]">首页</span>
        </button>
        <button
          onClick={() => router.push("/select")}
          className="flex flex-col items-center gap-0.5"
          style={{ color: "var(--accent-pink)" }}
        >
          <span className="text-lg">✨</span>
          <span className="text-[10px] font-medium">选择</span>
        </button>
        <button
          onClick={() => router.push("/gallery")}
          className="flex flex-col items-center gap-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          <span className="text-lg">📖</span>
          <span className="text-[10px]">手账</span>
        </button>
      </div>
    </div>
  );
}
