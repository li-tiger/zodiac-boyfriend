import { NextResponse } from "next/server";
import { createClient } from "@/lib/db";

export async function GET() {
  try {
    const supabase = await createClient();
    const userId = await supabase.getUserId();

    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { data: cards } = await supabase
      .from("memory_cards")
      .select("*")
      .eq("user_id", parseInt(userId))
      .order("unlocked_at", { ascending: false });

    return NextResponse.json({ cards: cards || [] });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
