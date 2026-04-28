"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { BOYFRIENDS, ZODIAC_NAMES, type ZodiacSign } from "@/constants/boyfriends";
import { RELATION_STAGE_LABELS } from "@/constants";
import type { RelationStage } from "@/types";
import { StarField, AuroraBackground } from "@/components/BackgroundEffects";

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

export default function GalleryPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);
  const [memoryCards, setMemoryCards] = useState<MemoryCardItem[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent-pink)" }} />
          <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent-pink)" }} />
          <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent-pink)" }} />
        </div>
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

  return (
    <div className="min-h-screen relative" style={{ background: "var(--bg-primary)" }}>
      <StarField />
      <AuroraBackground />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-12 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            恋爱手账
          </h1>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{ background: "var(--bg-card)", color: "var(--text-muted)" }}
          >
            退出登录
          </button>
        </div>

        {progressList.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="text-4xl mb-4">📖</div>
            <p className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>
              你还没有开始任何故事
            </p>
            <button
              onClick={() => router.push("/select")}
              className="mt-4 px-6 py-2.5 rounded-full text-sm font-medium text-white"
              style={{ background: "var(--gradient-pink)" }}
            >
              选择你的男友
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {progressList.map((p) => {
              const bf = BOYFRIENDS[p.zodiac_sign as ZodiacSign];
              if (!bf) return null;

              const cards = groupedCards[p.zodiac_sign] || [];

              return (
                <div key={p.zodiac_sign} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full glow-border flex items-center justify-center"
                      style={{ background: "var(--bg-card)" }}
                    >
                      <span className="text-lg">{bf.emoji}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {bf.name} · {ZODIAC_NAMES[p.zodiac_sign as ZodiacSign]}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                        {STAGE_EMOJI[p.stage]} {RELATION_STAGE_LABELS[p.stage]} · {p.progress_value}%
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(`/chat?sign=${p.zodiac_sign}`)}
                      className="ml-auto px-3 py-1.5 rounded-full text-xs"
                      style={{ background: "var(--bg-card)", color: "var(--accent-pink)" }}
                    >
                      继续
                    </button>
                  </div>

                  {cards.length > 0 ? (
                    <div className="space-y-2 ml-2">
                      {cards.map((card) => (
                        <div key={card.id} className="rounded-xl p-3 glass-card">
                          <p
                            className="text-xs font-medium mb-1"
                            style={{ color: "var(--accent-gold)" }}
                          >
                            {card.card_title}
                          </p>
                          <p
                            className="text-xs leading-relaxed"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {card.card_content}
                          </p>
                          <p className="text-[10px] mt-1.5" style={{ color: "var(--text-muted)" }}>
                            {new Date(card.unlocked_at).toLocaleDateString("zh-CN")}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs ml-2 italic" style={{ color: "var(--text-muted)" }}>
                      还没有解锁回忆卡，继续聊天吧~
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-50 px-5 py-3 flex justify-around"
        style={{ background: "rgba(5,10,18,0.9)", borderTop: "1px solid var(--border-light)", backdropFilter: "blur(16px)" }}
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
          style={{ color: "var(--text-muted)" }}
        >
          <span className="text-lg">✨</span>
          <span className="text-[10px]">选择</span>
        </button>
        <button
          onClick={() => router.push("/gallery")}
          className="flex flex-col items-center gap-0.5"
          style={{ color: "var(--accent-pink)" }}
        >
          <span className="text-lg">📖</span>
          <span className="text-[10px] font-medium">手账</span>
        </button>
      </div>
    </div>
  );
}
