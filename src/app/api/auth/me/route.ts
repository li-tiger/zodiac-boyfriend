import { NextResponse } from "next/server";
import { createClient } from "@/lib/db";

export async function GET() {
  try {
    const supabase = await createClient();
    const userId = await supabase.getUserId();

    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, username, created_at")
      .eq("id", parseInt(userId))
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    return NextResponse.json({ user: data });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
