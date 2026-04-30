"use client";

import React from "react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon = "✨",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="empty-state"
    >
      <motion.div
        className="empty-state-icon"
        animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {icon}
      </motion.div>
      <h3 className="text-lg font-bold mb-2 font-display" style={{ color: "var(--text-primary)" }}>
        {title}
      </h3>
      {description && (
        <p className="text-sm mb-4 font-serif-sc" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
      )}
      {action && (
        <motion.button
          onClick={action.onClick}
          className="btn-primary text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
