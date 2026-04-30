"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
}

interface ParticleEffectProps {
  trigger: boolean;
  color?: string;
  particleCount?: number;
  onComplete?: () => void;
}

export default function ParticleEffect({
  trigger,
  color = "#f4b4c4",
  particleCount = 20,
  onComplete,
}: ParticleEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger) {
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        color: color,
        size: Math.random() * 6 + 2,
        duration: Math.random() * 1 + 0.5,
        delay: Math.random() * 0.3,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [trigger, color, particleCount, onComplete]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              opacity: 1,
              scale: 0,
              x: "50%",
              y: "50%",
            }}
            animate={{
              opacity: 0,
              scale: 1,
              x: `calc(50% + ${particle.x}px)`,
              y: `calc(50% + ${particle.y}px)`,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: "easeOut",
            }}
            className="absolute"
            style={{
              width: particle.size,
              height: particle.size,
              background: particle.color,
              borderRadius: "50%",
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
