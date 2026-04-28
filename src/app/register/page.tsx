"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { StarField, AuroraBackground } from "@/components/BackgroundEffects";

export default function RegisterPage() {
  const { user, register, loading: authLoading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/home");
    }
  }, [user, authLoading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次密码输入不一致");
      return;
    }

    if (password.length < 6) {
      setError("密码长度至少6位");
      return;
    }

    setLoading(true);

    try {
      await register(username, password);
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
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
              创建账号
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
              开始你的心动之旅
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
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
                placeholder="请输入密码（至少6位）"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>
                确认密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
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
              {loading ? "注册中..." : "注册"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              已有账号？{" "}
              <button
                onClick={() => router.push("/login")}
                className="underline"
                style={{ color: "var(--accent-pink)" }}
              >
                立即登录
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
