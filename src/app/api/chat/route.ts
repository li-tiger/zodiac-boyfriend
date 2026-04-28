import { NextResponse } from "next/server";
import { createClient } from "@/lib/db";
import { BOYFRIENDS, type ZodiacSign, type RelationStage } from "@/constants";
import { createDeepSeekClient, buildBoyfriendSystemPrompt } from "@/lib/deepseek";
import { matchDailyTopic, matchImageMessage, getRandomFallbackImage, type DailyTopic } from "@/constants/daily-topics";

interface ChatResponse {
  message: unknown;
  stage: RelationStage;
  progress_value: number;
  dailyTopic?: DailyTopic | null;
  imageTrigger?: { id: number; imageUrl: string } | null;
  occupationUnlocked?: boolean;
  callName?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sign = searchParams.get("sign");

    if (!sign) {
      return NextResponse.json({ error: "缺少星座参数" }, { status: 400 });
    }

    const supabase = await createClient();
    const userId = await supabase.getUserId();

    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { data: messages } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", parseInt(userId))
      .eq("zodiac_sign", sign)
      .order("created_at", { ascending: true })
      .limit(50);

    return NextResponse.json({ messages: messages || [] });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

function getCallNameForStage(callNames: Record<string, string[]>, stage: RelationStage): string {
  const names = callNames[stage] || callNames.stranger || [];
  return names.length > 0 ? names[0] : "你";
}

function shouldTriggerDailyTopic(lastDate: string | null): boolean {
  if (!lastDate) return true;
  const last = new Date(lastDate);
  const today = new Date();
  return last.toDateString() !== today.toDateString();
}

function checkOccupationUnlock(message: string, occupation: string): boolean {
  const lowerMessage = message.toLowerCase();
  const occupationKeywords: Record<string, string[]> = {
    "消防员": ["消防", "灭火", "救火", "危险", "勇敢"],
    "演员": ["演戏", "拍戏", "电影", "电视", "明星", "片场"],
    "医生": ["医院", "医生", "治病", "手术", "病人"],
    "律师": ["法律", "诉讼", "法庭", "案件", "辩护"],
    "咖啡师": ["咖啡", "拉花", "调制", "意式", "拿铁"],
    "甜点师": ["甜点", "蛋糕", "烘焙", "甜品", "裱花"],
    "作家": ["写作", "小说", "文字", "创作", "出版"],
    "摄影师": ["拍照", "摄影", "相机", "镜头", "构图"],
    "建筑师": ["设计", "建筑", "图纸", "工程", "空间"],
    "音乐人": ["音乐", "歌曲", "创作", "演唱", "乐器"],
    "插画师": ["插画", "绘画", "画画", "手绘", "板绘"],
    "健身教练": ["健身", "锻炼", "肌肉", "体能", "训练"],
  };

  const keywords = occupationKeywords[occupation] || [];
  return keywords.some(keyword => lowerMessage.includes(keyword));
}

export async function POST(request: Request) {
  try {
    const { zodiac_sign, message } = await request.json();

    if (!zodiac_sign || !message) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    const supabase = await createClient();
    const userId = await supabase.getUserId();

    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const bf = BOYFRIENDS[zodiac_sign as ZodiacSign];
    if (!bf) {
      return NextResponse.json({ error: "未知的星座" }, { status: 400 });
    }

    const { data: progress } = await supabase
      .from("progress")
      .select("*")
      .eq("user_id", parseInt(userId))
      .eq("zodiac_sign", zodiac_sign)
      .single();

    const currentStage = (progress?.stage as RelationStage) || "stranger";
    const occupationUnlocked = progress?.occupation_unlocked || false;
    const lastDailyTopicDate = progress?.last_daily_topic_date || null;

    const systemPrompt = buildBoyfriendSystemPrompt(
      zodiac_sign,
      bf.name,
      {
        occupation: bf.occupation,
        personality: bf.personality,
        chatStyle: bf.chatStyle,
        moodType: bf.moodType,
        appearance: bf.appearance,
        introduction: bf.introduction,
        story: bf.story,
        weakness: bf.weakness,
        callNames: bf.callNames,
        chatExamples: bf.chatExamples,
      },
      currentStage,
      occupationUnlocked
    );

    const { data: recentMessages } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("user_id", parseInt(userId))
      .eq("zodiac_sign", zodiac_sign)
      .order("created_at", { ascending: true })
      .limit(10);

    const conversationHistory = recentMessages?.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })) || [];

    const deepseek = await createDeepSeekClient();

    let aiResponse: string;
    let dailyTopicTriggered: DailyTopic | null = null;
    let newOccupationUnlocked = occupationUnlocked;

    const matchedTopic = matchDailyTopic(message);
    if (matchedTopic && shouldTriggerDailyTopic(lastDailyTopicDate)) {
      dailyTopicTriggered = matchedTopic;
    }

    try {
      let enhancedPrompt = systemPrompt;
      if (dailyTopicTriggered) {
        enhancedPrompt += `\n\n## 每日话题触发\n今天想和你聊聊：${dailyTopicTriggered.topic}\n${dailyTopicTriggered.followUp ? `你可以这样开场：${dailyTopicTriggered.followUp}` : ""}`;
      }

      if (!occupationUnlocked && checkOccupationUnlock(message, bf.occupation)) {
        newOccupationUnlocked = true;
        enhancedPrompt += `\n\n## 特殊事件\n用户似乎对你的职业很好奇。这是解锁你职业信息的好时机！你可以自然地透露你的职业是${bf.occupation}，并分享一些相关的小故事或感受。`;
      }

      const response = await deepseek.chat([
        { role: "system", content: enhancedPrompt },
        ...conversationHistory,
        { role: "user", content: message },
      ]);
      aiResponse = response;
    } catch (error) {
      console.error("DeepSeek API error, using fallback:", error);
      const fallbacks = bf.chatExamples[currentStage] || bf.chatExamples.stranger;
      aiResponse = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    const { data: userMsg } = await supabase
      .from("chat_messages")
      .insert({
        user_id: parseInt(userId),
        zodiac_sign,
        role: "user",
        content: message,
      })
      .select()
      .single();

    const { data: assistantMsg } = await supabase
      .from("chat_messages")
      .insert({
        user_id: parseInt(userId),
        zodiac_sign,
        role: "assistant",
        content: aiResponse,
      })
      .select()
      .single();

    let newStage: RelationStage | null = null;
    let newProgress: number | null = null;

    const currentProgress = progress?.progress_value || 0;
    const increment = Math.floor(Math.random() * 8) + 5;
    newProgress = Math.min(100, currentProgress + increment);

    const stageThresholds: Record<RelationStage, number> = {
      stranger: 0,
      ambiguous: 30,
      crush: 60,
      lover: 85,
    };

    if (newProgress! >= stageThresholds.ambiguous && currentStage === "stranger") {
      newStage = "ambiguous";
    }
    if (newProgress! >= stageThresholds.crush && currentStage === "ambiguous") {
      newStage = "crush";
    }
    if (newProgress! >= stageThresholds.lover && currentStage === "crush") {
      newStage = "lover";
    }

    const updateData: Record<string, unknown> = {
      progress_value: newProgress,
      updated_at: new Date().toISOString(),
      occupation_unlocked: newOccupationUnlocked,
    };

    if (newStage) {
      updateData.stage = newStage;
    }

    if (dailyTopicTriggered) {
      updateData.last_daily_topic_date = new Date().toISOString();
    }

    await supabase
      .from("progress")
      .upsert({
        user_id: parseInt(userId),
        zodiac_sign,
        ...updateData,
      });

    if (bf && newProgress && newProgress % 25 < increment && newProgress > 10) {
      const memoryTitles = [
        `与${bf.name}的初次相遇`,
        `${bf.name}的温暖笑容`,
        `${bf.name}的轻声问候`,
        `${bf.name}的特殊关心`,
        `与${bf.name}的甜蜜对话`,
        `${bf.name}的浪漫时刻`,
        newOccupationUnlocked ? `${bf.name}职业揭晓` : null,
        `心跳加速的瞬间`,
      ].filter(Boolean) as string[];

      const memoryContent = aiResponse.length > 100 ? aiResponse.substring(0, 100) + "..." : aiResponse;

      await supabase.from("memory_cards").insert({
        user_id: parseInt(userId),
        zodiac_sign,
        card_title: memoryTitles[Math.floor(Math.random() * memoryTitles.length)],
        card_content: memoryContent,
        stage: newStage || currentStage,
      });
    }

    const matchedImage = matchImageMessage(message);

    const response: ChatResponse = {
      message: assistantMsg,
      stage: newStage || currentStage,
      progress_value: newProgress,
      dailyTopic: dailyTopicTriggered,
      imageTrigger: matchedImage ? { id: matchedImage.id, imageUrl: matchedImage.imageUrl } : null,
      occupationUnlocked: newOccupationUnlocked && !occupationUnlocked,
      callName: getCallNameForStage(bf.callNames, newStage || currentStage),
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
