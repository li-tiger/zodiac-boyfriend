"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { StarField, AuroraBackground } from "@/components/BackgroundEffects";

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent-pink)" }} />
          <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent-pink)" }} />
          <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent-pink)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: "var(--bg-primary)" }}>
      <StarField />
      <AuroraBackground />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              12星座男友手账
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--accent-pink)" }}>
              心动宇宙 · 遇见你的他
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                className="w-full"
              />
            </div>

            {error && (
              <p className="text-xs text-center" style={{ color: "#e88a9a" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "var(--gradient-pink)", boxShadow: "0 4px 20px var(--glow-pink)" }}
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              还没有账号？{" "}
              <button
                onClick={() => router.push("/register")}
                className="underline"
                style={{ color: "var(--accent-pink)" }}
              >
                立即注册
              </button>
            </p>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push("/home")}
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              先看看首页 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
