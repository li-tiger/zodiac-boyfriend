import { NextResponse } from "next/server";
import { createClient } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { zodiac_sign } = await request.json();

    if (!zodiac_sign) {
      return NextResponse.json({ error: "缺少星座参数" }, { status: 400 });
    }

    const supabase = await createClient();
    const userId = await supabase.getUserId();

    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const cardTitles = [
      "初次相遇的悸动",
      "心动的瞬间",
      "甜蜜的回忆",
      "难忘的对话",
      "温暖的陪伴",
    ];

    const { data: card, error } = await supabase
      .from("memory_cards")
      .insert({
        user_id: parseInt(userId),
        zodiac_sign,
        card_title: cardTitles[Math.floor(Math.random() * cardTitles.length)],
        card_content: "这是一段美好的回忆...",
        stage: "heartbeat",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "生成回忆卡失败" }, { status: 500 });
    }

    return NextResponse.json({ card });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
