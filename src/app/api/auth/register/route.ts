import { NextResponse } from "next/server";
import { createClient } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";

async function verifyTurnstile(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY is not configured");
    return false;
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification error:", err);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { username, email, password, turnstileToken } = await request.json();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!username || !email || !password) {
      return NextResponse.json({ error: "请提供用户名、邮箱和密码" }, { status: 400 });
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
    }

    if (!turnstileToken) {
      return NextResponse.json({ error: "人机验证失败" }, { status: 400 });
    }

    const isValidToken = await verifyTurnstile(turnstileToken);
    if (!isValidToken) {
      return NextResponse.json({ error: "人机验证失败，请重试" }, { status: 400 });
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

    const { data: existingEmail, error: emailCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (emailCheckError) {
      console.error("Check existing email error:", emailCheckError);
      return NextResponse.json({ error: "数据库查询失败: " + emailCheckError.message }, { status: 500 });
    }

    if (existingEmail) {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 400 });
    }

    // 插入新用户
    const { data, error } = await supabase
      .from("users")
      .insert({ username, email, password })
      .select()
      .single();

    if (error) {
      console.error("Insert user error:", error);
      return NextResponse.json({ error: "注册失败: " + error.message }, { status: 500 });
    }

    const response = NextResponse.json({ user: { id: data.id, username: data.username, email: data.email } });
    response.cookies.set("user_id", data.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    try {
      await sendWelcomeEmail(data.email, data.username);
    } catch (emailErr) {
      console.error("发送欢迎邮件失败:", emailErr);
    }

    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "服务器错误: " + (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
}
