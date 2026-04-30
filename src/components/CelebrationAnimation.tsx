"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CelebrationAnimationProps {
  show: boolean;
  title?: string;
  subtitle?: string;
  onComplete?: () => void;
}

export default function CelebrationAnimation({
  show,
  title = "关系升级！",
  subtitle = "你们的关系更进一步了",
  onComplete,
}: CelebrationAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: "rgba(10, 10, 26, 0.9)", backdropFilter: "blur(10px)" }}
        >
          {/* 背景粒子 */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
                  y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
                  scale: 0,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [null, Math.random() * -200 - 100],
                  scale: [0, 1, 0.5],
                }}
                transition={{
                  duration: Math.random() * 2 + 1,
                  delay: Math.random() * 0.5,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2,
                }}
                className="absolute"
                style={{
                  width: Math.random() * 8 + 4,
                  height: Math.random() * 8 + 4,
                  background: ["#f4b4c4", "#d4a574", "#a8c5d6", "#e8b4b4"][Math.floor(Math.random() * 4)],
                  borderRadius: "50%",
                }}
              />
            ))}
          </div>

          {/* 主要内容 */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative z-10 text-center px-8"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              ✨
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold mb-2 font-display title-gradient"
            >
              {title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg font-serif-sc"
              style={{ color: "var(--text-secondary)" }}
            >
              {subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 flex justify-center gap-2"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1,
                    delay: i * 0.1,
                    repeat: Infinity,
                  }}
                  className="text-2xl"
                >
                  {["✦", "⭐", "✦", "⭐", "✦"][i]}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
