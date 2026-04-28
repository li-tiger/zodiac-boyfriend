import { NextResponse } from "next/server";
import { createClient } from "@/lib/db";

export async function GET() {
  try {
    const supabase = await createClient();
    const userId = await supabase.getUserId();

    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { data: progress } = await supabase
      .from("progress")
      .select("*")
      .eq("user_id", parseInt(userId));

    return NextResponse.json({ progress: progress || [] });
  } catch (error) {
    console.error("Progress API 错误:", error);
    return NextResponse.json({ error: "服务器错误", details: String(error) }, { status: 500 });
  }
}

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

    const { data: existing } = await supabase
      .from("progress")
      .select("*")
      .eq("user_id", parseInt(userId))
      .eq("zodiac_sign", zodiac_sign)
      .single();

    if (existing) {
      return NextResponse.json({ progress: existing });
    }

    const { data: progress, error } = await supabase
      .from("progress")
      .insert({
        user_id: parseInt(userId),
        zodiac_sign,
        stage: "stranger",
        progress_value: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("创建进度失败:", error);
      return NextResponse.json({ error: "创建进度失败", details: error.message }, { status: 500 });
    }

    return NextResponse.json({ progress });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
