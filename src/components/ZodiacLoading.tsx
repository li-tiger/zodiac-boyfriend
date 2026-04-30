"use client";

import React from "react";
import { motion } from "framer-motion";

interface ZodiacLoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { container: "w-8 h-8", icon: "text-lg", text: "text-xs" },
  md: { container: "w-12 h-12", icon: "text-2xl", text: "text-sm" },
  lg: { container: "w-16 h-16", icon: "text-3xl", text: "text-base" },
};

export default function ZodiacLoading({
  text = "正在连接心动信号...",
  size = "md",
}: ZodiacLoadingProps) {
  const sizes = sizeMap[size];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${sizes.container}`}>
        {/* 外圈旋转 */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: "var(--accent-rose)",
            borderRightColor: "var(--accent-moon)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        {/* 内圈反向旋转 */}
        <motion.div
          className="absolute inset-1 rounded-full border-2 border-transparent"
          style={{
            borderBottomColor: "var(--accent-gold)",
            borderLeftColor: "var(--accent-rose-gold)",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        {/* 中心星座符号 */}
        <motion.div
          className={`absolute inset-0 flex items-center justify-center ${sizes.icon}`}
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✦
        </motion.div>
      </div>
      {text && (
        <motion.p
          className={`${sizes.text} font-serif-sc`}
          style={{ color: "var(--text-secondary)" }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}
