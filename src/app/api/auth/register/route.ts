import { NextResponse } from "next/server";
import { createClient } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "请提供用户名和密码" }, { status: 400 });
    }

    const supabase = await createClient();

    // 检查用户是否已存在
    const { data: existing, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (checkError) {
      console.error("Check existing user error:", checkError);
      return NextResponse.json({ error: "数据库查询失败: " + checkError.message }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ error: "用户名已存在" }, { status: 400 });
    }

    // 插入新用户
    const { data, error } = await supabase
      .from("users")
      .insert({ username, password })
      .select()
      .single();

    if (error) {
      console.error("Insert user error:", error);
      return NextResponse.json({ error: "注册失败: " + error.message }, { status: 500 });
    }

    const response = NextResponse.json({ user: { id: data.id, username: data.username } });
    response.cookies.set("user_id", data.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "服务器错误: " + (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
}
