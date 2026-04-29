"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import StarryBackground from "@/components/StarryBackground";

export default function LoginPage() {
  const { user, login, loading: authLoading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/home");
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative" style={{ background: "var(--gradient-cosmic)" }}>
        <StarryBackground starCount={60} particleCount={15} />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center gap-4"
        >
          <motion.div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "var(--gradient-pink)" }}
            animate={{ scale: [1, 1.2, 1], rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-2xl">✦</span>
          </motion.div>
          <motion.p
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            正在连接心动宇宙...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: "var(--gradient-cosmic)" }}>
      <StarryBackground starCount={100} particleCount={30} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-10">
            <motion.div
              className="text-5xl mb-4"
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              ✧
            </motion.div>
            <motion.h1
              className="text-2xl font-bold mb-2"
              style={{
                color: "var(--text-primary)",
                textShadow: "0 0 30px var(--glow-rose)"
              }}
              animate={{ textShadow: ["0 0 20px var(--glow-rose)", "0 0 40px var(--glow-rose)", "0 0 20px var(--glow-rose)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              12星座男友手账
            </motion.h1>
            <p className="text-sm" style={{ color: "var(--accent-rose)" }}>
              心动宇宙 · 遇见你的他
            </p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleLogin}
            className="space-y-5"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
                用户名
              </label>
              <motion.input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                required
                className="w-full px-4 py-3 rounded-xl text-sm"
                whileFocus={{ scale: 1.01 }}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-cosmic)",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
                密码
              </label>
              <motion.input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                className="w-full px-4 py-3 rounded-xl text-sm"
                whileFocus={{ scale: 1.01 }}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-cosmic)",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              />
            </motion.div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-center"
                style={{ color: "#e88a9a" }}
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-full text-sm font-medium text-white disabled:opacity-50 relative overflow-hidden"
              style={{
                background: "var(--gradient-cosmic)",
                border: "1px solid var(--accent-rose)",
                boxShadow: "0 4px 25px var(--glow-rose)"
              }}
            >
              <motion.span
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(135deg, var(--accent-rose) 0%, var(--accent-gold) 100%)",
                  opacity: 0
                }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10">
                {loading ? "正在连接心动信号..." : "登录 ✦"}
              </span>
            </motion.button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              还没有账号？{" "}
              <motion.button
                onClick={() => router.push("/register")}
                whileHover={{ scale: 1.05 }}
                className="underline"
                style={{ color: "var(--accent-rose)" }}
              >
                立即注册
              </motion.button>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <motion.button
              onClick={() => router.push("/home")}
              whileHover={{ scale: 1.05, y: -2 }}
              className="text-xs px-4 py-2 rounded-full"
              style={{
                color: "var(--text-muted)",
                background: "var(--bg-card)",
                border: "1px solid var(--border-cosmic)"
              }}
            >
              先看看首页 ✦
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}