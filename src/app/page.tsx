"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/welcome");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full" style={{ background: "var(--accent-pink)" }} />
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent-pink)" }} />
          <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent-pink)" }} />
          <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--accent-pink)" }} />
        </div>
      </div>
    </div>
  );
}
