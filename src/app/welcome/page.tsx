"use client";

import { useState, useEffect } from "react";
import { getCharacterImage } from "@/constants/images-game";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import { useAuth } from "@/contexts/AuthContext";
import StarryBackground from "@/components/StarryBackground";

const ZODIAC_BOYFRIENDS = [
  { name: "烈炎", sign: "aries", emoji: "♈", color: "#FF6B6B" },
  { name: "安屿", sign: "taurus", emoji: "♉", color: "#4ECDC4" },
  { name: "星野", sign: "gemini", emoji: "♊", color: "#FFE66D" },
  { name: "顾深", sign: "cancer", emoji: "♋", color: "#95E1D3" },
  { name: "凌曜", sign: "leo", emoji: "♌", color: "#F38181" },
  { name: "温言", sign: "virgo", emoji: "♍", color: "#AA96DA" },
  { name: "楚风", sign: "libra", emoji: "♎", color: "#FCBAD3" },
  { name: "夜辰", sign: "scorpio", emoji: "♏", color: "#2C3E50" },
  { name: "远征", sign: "sagittarius", emoji: "♐", color: "#E74C3C" },
  { name: "凌寒", sign: "capricorn", emoji: "♑", color: "#34495E" },
  { name: "沐辰", sign: "aquarius", emoji: "♒", color: "#3498DB" },
  { name: "涵予", sign: "pisces", emoji: "♓", color: "#9B59B6" },
];

export default function WelcomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % ZODIAC_BOYFRIENDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    router.push("/select");
  };

  const currentBoyfriend = ZODIAC_BOYFRIENDS[selectedIndex];

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <StarryBackground starCount={50} particleCount={10} />
        <div className="flex gap-3">
          <div className="w-2.5 h-2.5 rounded-full typing-dot" style={{ background: "var(--accent-rose)" }} />
          <div className="w-2.5 h-2.5 rounded-full typing-dot" style={{ background: "var(--accent-rose)", animationDelay: "0.2s" }} />
          <div className="w-2.5 h-2.5 rounded-full typing-dot" style={{ background: "var(--accent-rose)", animationDelay: "0.4s" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarryBackground starCount={100} particleCount={25} />

      <ScrollExpandMedia
        mediaType="image"
        mediaSrc={getCharacterImage(currentBoyfriend.sign as any)}
        bgImageSrc="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1920&auto=format&fit=crop"
        title="心动宇宙"
        date={`${currentBoyfriend.emoji} ${currentBoyfriend.name}`}
        scrollToExpand="向下滚动开始探索 ✦"
        textBlend
        onExpandComplete={() => setShowContent(true)}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="cosmic-title text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-wide">
              十二星座男友手账
            </h2>
            <p className="text-lg md:text-xl text-silver/80 max-w-2xl mx-auto leading-relaxed">
              在这里，遇见属于你的星座男友。每一次对话都是心动，每一段故事都由你书写。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16"
          >
            {ZODIAC_BOYFRIENDS.slice(0, 4).map((bf, idx) => (
              <motion.div
                key={bf.sign}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.5 + idx * 0.1 }}
                className="glass-card glass-card-hover p-5 md:p-6 text-center group cursor-pointer"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="text-4xl mb-3 animate-float" style={{ animationDelay: `${idx * 0.2}s` }}>
                  {bf.emoji}
                </div>
                <div className="text-base font-medium text-silver mb-1">{bf.name}</div>
                <div className="text-xs text-muted uppercase tracking-widest">{bf.sign}</div>
                <div
                  className="mt-3 h-0.5 w-0 mx-auto transition-all duration-500 group-hover:w-full"
                  style={{ background: "var(--gradient-rose)" }}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-center"
          >
            <motion.button
              onClick={handleStart}
              className="btn-primary text-lg px-12 py-4 inline-flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>开始心动之旅</span>
              <span className="text-xl">✨</span>
            </motion.button>
            <p className="text-sm text-muted mt-6 tracking-wide">
              已有 {ZODIAC_BOYFRIENDS.length} 位星座男友等待与你相遇
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showContent ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="mt-20 grid grid-cols-6 md:grid-cols-12 gap-2 md:gap-3"
          >
            {ZODIAC_BOYFRIENDS.map((bf, idx) => (
              <motion.div
                key={bf.sign}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.8 }}
                transition={{ duration: 0.5, delay: 1 + idx * 0.05 }}
                className="aspect-square rounded-xl flex items-center justify-center glass-card-hover zodiac-icon"
                whileHover={{ scale: 1.2, y: -3 }}
              >
                {bf.emoji}
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showContent ? 1 : 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="mt-16 text-center"
          >
            <p className="text-muted text-sm tracking-widest uppercase">
              心动宇宙 · 与你相遇
            </p>
          </motion.div>
        </div>
      </ScrollExpandMedia>
    </div>
  );
}
