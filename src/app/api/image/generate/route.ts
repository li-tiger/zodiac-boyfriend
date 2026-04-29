import { NextResponse } from "next/server";
import { createClient } from "@/lib/db";
import { generateSceneImage, matchSceneFromMessage, generateCharacterImage, type ScenePrompt } from "@/lib/volcano-image";
import type { ZodiacSign } from "@/types";

export async function POST(request: Request) {
  try {
    const { zodiac_sign, message, scene } = await request.json();

    const supabase = await createClient();
    const userId = await supabase.getUserId();

    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    if (!zodiac_sign) {
      return NextResponse.json({ error: "缺少星座参数" }, { status: 400 });
    }

    let scenePrompt: ScenePrompt | null = null;

    if (scene) {
      const SCENE_PROMPTS = [
        { scene: "morning", keywords: ["早安", "早上", "起床"], prompt_template: "清晨阳光透过窗帘，温柔唤醒，深情男友拥抱，近景温暖氛围，浪漫日系画风" },
        { scene: "night", keywords: ["晚安", "睡觉", "夜"], prompt_template: "繁星闪烁的夜晚，月光洒落，帅气男友温柔凝视，浪漫氛围，梦幻夜景" },
        { scene: "food", keywords: ["吃饭", "饿", "美食"], prompt_template: "精致美食桌前，帅气男友微笑，浪漫约会餐厅，暖色调温馨氛围" },
        { scene: "work", keywords: ["工作", "加班", "累"], prompt_template: "咖啡厅里认真工作的男友，温暖灯光，专注神情，知性魅力，浪漫氛围" },
        { scene: "miss", keywords: ["想念", "想你", "思念"], prompt_template: "雨中心系远方，帅气男友思念神情，浪漫雨景，情感细腻，虐心唯美" },
        { scene: "happy", keywords: ["开心", "高兴", "快乐"], prompt_template: "阳光下灿烂笑容的男友，幸福氛围，活力满满，青春浪漫" },
        { scene: "sad", keywords: ["难过", "伤心", "哭"], prompt_template: "默默陪伴的女友，温柔安慰，肩膀依靠，治愈系，温暖人心" },
        { scene: "angry", keywords: ["生气", "愤怒", "讨厌"], prompt_template: "假装生气鼓起脸颊，女友可爱撒娇，爆笑反差萌，喜剧氛围" },
        { scene: "sleepy", keywords: ["困", "睡觉", "累了"], prompt_template: "慵懒午后，帅气男友打哈欠，呆萌可爱，生活气息，治愈系" },
        { scene: "date", keywords: ["约会", "出去", "出门"], prompt_template: "浪漫街头约会，帅气男友牵手，月夜漫步，梦幻氛围，唯美韩系" },
        { scene: "drink", keywords: ["咖啡", "奶茶", "喝"], prompt_template: "咖啡厅角落，帅气男友手握拿铁，文艺气质，暖色光影，氛围感" },
        { scene: "rain", keywords: ["雨", "下雨", "雨天"], prompt_template: "雨中撑伞共行，帅气男友侧脸，雨滴涟漪，浪漫虐心，电影感" },
        { scene: "sunny", keywords: ["太阳", "晴天", "阳光"], prompt_template: "阳光下的灿烂笑容，草地野餐，青春活力，温暖明媚，韩系画风" },
        { scene: "star", keywords: ["月亮", "星空", "星星"], prompt_template: "星空下的告白，月光洒落的露台，浪漫氛围，唯美梦幻，虐心浪漫" },
        { scene: "flower", keywords: ["花", "玫瑰", "浪漫"], prompt_template: "玫瑰花海中的深情凝视，浪漫至极，梦幻花园，唯美韩系" },
        { scene: "dog", keywords: ["狗", "狗狗", "宠物"], prompt_template: "阳光下与萌犬嬉戏，帅气男友阳光笑容，温馨治愈，活力青春" },
        { scene: "cat", keywords: ["猫", "猫咪", "喵"], prompt_template: "慵懒午后撸猫，帅气男友温柔眼神，萌宠互动，治愈温暖" },
        { scene: "photo", keywords: ["照片", "自拍", "拍照"], prompt_template: "男友为女友拍照的浪漫瞬间，暖色午后，青春回忆，唯美韩系" },
        { scene: "movie", keywords: ["电影", "看剧", "追剧"], prompt_template: "依偎看电影的夜晚，浪漫氛围，温馨家居，虐心唯美" },
        { scene: "music", keywords: ["音乐", "听歌", "歌"], prompt_template: "弹吉他唱歌的帅气男友，音乐少年，青春阳光，才华魅力" },
        { scene: "exercise", keywords: ["运动", "跑步", "健身"], prompt_template: "健身房挥汗如雨，肌肉线条，健身男友，阳刚魅力，活力四射" },
        { scene: "beach", keywords: ["海边", "沙滩", "海洋"], prompt_template: "海边日落的浪漫背影，海风吹拂发丝，电影感，唯美虐心" },
        { scene: "travel", keywords: ["旅行", "旅游", "度假"], prompt_template: "旅途中的甜蜜合照，各地美景，青春回忆，活力青春" },
        { scene: "festival", keywords: ["新年", "圣诞", "节日"], prompt_template: "圣诞树下的浪漫求婚，节日灯光，梦幻氛围，浪漫惊喜" },
        { scene: "cake", keywords: ["蛋糕", "甜点", "甜食"], prompt_template: "生日蛋糕前的惊喜表情，烛光晚餐，温馨祝福，浪漫氛围" },
        { scene: "book", keywords: ["书", "阅读", "看书"], prompt_template: "图书馆的安静时光，文艺男友侧脸，阳光书香，氛围感" },
        { scene: "game", keywords: ["游戏", "打游戏", "手游"], prompt_template: "并肩打游戏的甜蜜日常，专注神情，青春活力，温馨氛围" },
        { scene: "cooking", keywords: ["做饭", "烹饪", "厨房"], prompt_template: "厨房里认真做饭的男友，温暖灯光，居家魅力，甜蜜日常" },
        { scene: "home", keywords: ["睡衣", "居家", "宅"], prompt_template: "居家日常的慵懒男友，舒适睡衣，宅家幸福，温馨治愈" },
        { scene: "silhouette", keywords: ["背影", "侧脸", "剪影"], prompt_template: "夕阳下的帅气侧脸剪影，气质氛围感，电影感十足" },
        { scene: "hand", keywords: ["手", "牵手", "手指"], prompt_template: "十指紧扣的双手，浪漫戒指，特写镜头，甜蜜虐心" },
        { scene: "hug", keywords: ["拥抱", "抱抱", "抱"], prompt_template: "温暖拥抱的浪漫瞬间，背后环绕，甜蜜幸福，虐心唯美" },
        { scene: "heartbeat", keywords: ["心跳", "心动", "脸红"], prompt_template: "心动手捂胸口，脸红心跳，害羞表情，萌态可爱，青春悸动" },
        { scene: "promise", keywords: ["承诺", "誓言", "约定"], prompt_template: "星空下的浪漫誓言，小指拉钩，虐心约定，梦幻唯美" },
        { scene: "waiting", keywords: ["等待", "期盼", "希望"], prompt_template: "街角等待的身影，凝望远方，思念情感，虐心唯美" },
        { scene: "gift", keywords: ["礼物", "惊喜", "纪念日"], prompt_template: "纪念日惊喜礼物，浪漫氛围，花瓣装饰，温馨感动" },
      ];
      scenePrompt = SCENE_PROMPTS.find(s => s.scene === scene) || null;
    } else if (message) {
      scenePrompt = matchSceneFromMessage(message);
    }

    if (!scenePrompt) {
      return NextResponse.json({ error: "未匹配到场景" }, { status: 400 });
    }

    const result = await generateSceneImage(zodiac_sign as ZodiacSign, scenePrompt);

    return NextResponse.json({
      url: result.url,
      size: result.size,
      scene: scenePrompt.scene,
      prompt: result.prompt,
      cached: result.cached
    });
  } catch (error) {
    console.error("Image generation API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "图片生成失败" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const zodiac_sign = searchParams.get("zodiac_sign");
    const scene = searchParams.get("scene");

    if (!zodiac_sign || !scene) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    const SCENE_PROMPTS = [
      { scene: "morning", keywords: ["早安", "早上", "起床"], prompt_template: "清晨阳光透过窗帘，温柔唤醒，深情男友拥抱，近景温暖氛围，浪漫日系画风" },
      { scene: "night", keywords: ["晚安", "睡觉", "夜"], prompt_template: "繁星闪烁的夜晚，月光洒落，帅气男友温柔凝视，浪漫氛围，梦幻夜景" },
      { scene: "food", keywords: ["吃饭", "饿", "美食"], prompt_template: "精致美食桌前，帅气男友微笑，浪漫约会餐厅，暖色调温馨氛围" },
      { scene: "work", keywords: ["工作", "加班", "累"], prompt_template: "咖啡厅里认真工作的男友，温暖灯光，专注神情，知性魅力，浪漫氛围" },
      { scene: "miss", keywords: ["想念", "想你", "思念"], prompt_template: "雨中心系远方，帅气男友思念神情，浪漫雨景，情感细腻，虐心唯美" },
      { scene: "happy", keywords: ["开心", "高兴", "快乐"], prompt_template: "阳光下灿烂笑容的男友，幸福氛围，活力满满，青春浪漫" },
      { scene: "sad", keywords: ["难过", "伤心", "哭"], prompt_template: "默默陪伴的女友，温柔安慰，肩膀依靠，治愈系，温暖人心" },
      { scene: "angry", keywords: ["生气", "愤怒", "讨厌"], prompt_template: "假装生气鼓起脸颊，女友可爱撒娇，爆笑反差萌，喜剧氛围" },
      { scene: "sleepy", keywords: ["困", "睡觉", "累了"], prompt_template: "慵懒午后，帅气男友打哈欠，呆萌可爱，生活气息，治愈系" },
      { scene: "date", keywords: ["约会", "出去", "出门"], prompt_template: "浪漫街头约会，帅气男友牵手，月夜漫步，梦幻氛围，唯美韩系" },
      { scene: "drink", keywords: ["咖啡", "奶茶", "喝"], prompt_template: "咖啡厅角落，帅气男友手握拿铁，文艺气质，暖色光影，氛围感" },
      { scene: "rain", keywords: ["雨", "下雨", "雨天"], prompt_template: "雨中撑伞共行，帅气男友侧脸，雨滴涟漪，浪漫虐心，电影感" },
      { scene: "sunny", keywords: ["太阳", "晴天", "阳光"], prompt_template: "阳光下的灿烂笑容，草地野餐，青春活力，温暖明媚，韩系画风" },
      { scene: "star", keywords: ["月亮", "星空", "星星"], prompt_template: "星空下的告白，月光洒落的露台，浪漫氛围，唯美梦幻，虐心浪漫" },
      { scene: "flower", keywords: ["花", "玫瑰", "浪漫"], prompt_template: "玫瑰花海中的深情凝视，浪漫至极，梦幻花园，唯美韩系" },
      { scene: "dog", keywords: ["狗", "狗狗", "宠物"], prompt_template: "阳光下与萌犬嬉戏，帅气男友阳光笑容，温馨治愈，活力青春" },
      { scene: "cat", keywords: ["猫", "猫咪", "喵"], prompt_template: "慵懒午后撸猫，帅气男友温柔眼神，萌宠互动，治愈温暖" },
      { scene: "photo", keywords: ["照片", "自拍", "拍照"], prompt_template: "男友为女友拍照的浪漫瞬间，暖色午后，青春回忆，唯美韩系" },
      { scene: "movie", keywords: ["电影", "看剧", "追剧"], prompt_template: "依偎看电影的夜晚，浪漫氛围，温馨家居，虐心唯美" },
      { scene: "music", keywords: ["音乐", "听歌", "歌"], prompt_template: "弹吉他唱歌的帅气男友，音乐少年，青春阳光，才华魅力" },
      { scene: "exercise", keywords: ["运动", "跑步", "健身"], prompt_template: "健身房挥汗如雨，肌肉线条，健身男友，阳刚魅力，活力四射" },
      { scene: "beach", keywords: ["海边", "沙滩", "海洋"], prompt_template: "海边日落的浪漫背影，海风吹拂发丝，电影感，唯美虐心" },
      { scene: "travel", keywords: ["旅行", "旅游", "度假"], prompt_template: "旅途中的甜蜜合照，各地美景，青春回忆，活力青春" },
      { scene: "festival", keywords: ["新年", "圣诞", "节日"], prompt_template: "圣诞树下的浪漫求婚，节日灯光，梦幻氛围，浪漫惊喜" },
      { scene: "cake", keywords: ["蛋糕", "甜点", "甜食"], prompt_template: "生日蛋糕前的惊喜表情，烛光晚餐，温馨祝福，浪漫氛围" },
      { scene: "book", keywords: ["书", "阅读", "看书"], prompt_template: "图书馆的安静时光，文艺男友侧脸，阳光书香，氛围感" },
      { scene: "game", keywords: ["游戏", "打游戏", "手游"], prompt_template: "并肩打游戏的甜蜜日常，专注神情，青春活力，温馨氛围" },
      { scene: "cooking", keywords: ["做饭", "烹饪", "厨房"], prompt_template: "厨房里认真做饭的男友，温暖灯光，居家魅力，甜蜜日常" },
      { scene: "home", keywords: ["睡衣", "居家", "宅"], prompt_template: "居家日常的慵懒男友，舒适睡衣，宅家幸福，温馨治愈" },
      { scene: "silhouette", keywords: ["背影", "侧脸", "剪影"], prompt_template: "夕阳下的帅气侧脸剪影，气质氛围感，电影感十足" },
      { scene: "hand", keywords: ["手", "牵手", "手指"], prompt_template: "十指紧扣的双手，浪漫戒指，特写镜头，甜蜜虐心" },
      { scene: "hug", keywords: ["拥抱", "抱抱", "抱"], prompt_template: "温暖拥抱的浪漫瞬间，背后环绕，甜蜜幸福，虐心唯美" },
      { scene: "heartbeat", keywords: ["心跳", "心动", "脸红"], prompt_template: "心动手捂胸口，脸红心跳，害羞表情，萌态可爱，青春悸动" },
      { scene: "promise", keywords: ["承诺", "誓言", "约定"], prompt_template: "星空下的浪漫誓言，小指拉钩，虐心约定，梦幻唯美" },
      { scene: "waiting", keywords: ["等待", "期盼", "希望"], prompt_template: "街角等待的身影，凝望远方，思念情感，虐心唯美" },
      { scene: "gift", keywords: ["礼物", "惊喜", "纪念日"], prompt_template: "纪念日惊喜礼物，浪漫氛围，花瓣装饰，温馨感动" },
    ];

    const scenePrompt = SCENE_PROMPTS.find(s => s.scene === scene);
    if (!scenePrompt) {
      return NextResponse.json({ error: "未找到场景" }, { status: 404 });
    }

    const result = await generateSceneImage(zodiac_sign as ZodiacSign, scenePrompt);

    return NextResponse.json({
      url: result.url,
      size: result.size,
      scene: scenePrompt.scene,
      prompt: result.prompt,
      cached: result.cached
    });
  } catch (error) {
    console.error("Image generation API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "图片生成失败" },
      { status: 500 }
    );
  }
}
