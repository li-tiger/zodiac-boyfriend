"use client";

import { useEffect, useMemo } from "react";

interface StarryBackgroundProps {
  starCount?: number;
  particleCount?: number;
  className?: string;
}

export default function StarryBackground({
  starCount = 80,
  particleCount = 20,
  className = "",
}: StarryBackgroundProps) {
  const stars = useMemo(() => {
    const starElements = [];
    for (let i = 0; i < starCount; i++) {
      const size = Math.random() * 3 + 1;
      const isLarge = size > 2.5;
      const isRose = Math.random() > 0.85;
      const isGold = Math.random() > 0.9;

      let className = "";
      if (isLarge) className = "star large";
      else if (isRose) className = "star rose";
      else if (isGold) className = "star gold";
      else className = "star";

      starElements.push({
        id: i,
        size,
        className,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${size}px`,
          height: `${size}px`,
          "--duration": `${Math.random() * 3 + 2}s`,
          "--delay": `${Math.random() * 3}s`,
          "--min-opacity": 0.15 + Math.random() * 0.2,
          "--max-opacity": 0.6 + Math.random() * 0.4,
          "--min-scale": 0.6 + Math.random() * 0.3,
          "--max-scale": 0.9 + Math.random() * 0.4,
        } as React.CSSProperties,
      });
    }
    return starElements;
  }, [starCount]);

  const particles = useMemo(() => {
    const particleElements = [];
    for (let i = 0; i < particleCount; i++) {
      const isRose = Math.random() > 0.7;
      const isGold = Math.random() > 0.85;

      let className = "floating-particle";
      if (isRose) className = "floating-particle rose";
      else if (isGold) className = "floating-particle gold";

      particleElements.push({
        id: i,
        className,
        style: {
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 20 + 15}s`,
          animationDelay: `${Math.random() * 15}s`,
        } as React.CSSProperties,
      });
    }
    return particleElements;
  }, [particleCount]);

  return (
    <div className={`starry-bg ${className}`}>
      {stars.map((star) => (
        <div key={star.id} className={star.className} style={star.style} />
      ))}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={particle.className}
          style={particle.style}
        />
      ))}
    </div>
  );
}
