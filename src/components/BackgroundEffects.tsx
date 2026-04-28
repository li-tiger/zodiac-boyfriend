"use client";

import React, { useState, useEffect } from "react";

interface Star {
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
  width: string;
  height: string;
  opacity: number;
}

export function StarField() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generatedStars = Array.from({ length: 80 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 4}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
      width: `${1 + Math.random() * 2}px`,
      height: `${1 + Math.random() * 2}px`,
      opacity: 0.15 + Math.random() * 0.5,
    }));
    setStars(generatedStars);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star, i) => (
        <div key={i} className="star-particle" style={star} />
      ))}
    </div>
  );
}

export function AuroraBackground() {
  return <div className="fixed inset-0 pointer-events-none z-0 aurora-bg" />;
}
