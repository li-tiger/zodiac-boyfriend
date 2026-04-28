export type ZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export type RelationStage =
  | "stranger"
  | "ambiguous"
  | "crush"
  | "lover";

export const RELATION_STAGE_CONFIG: Record<RelationStage, {
  label: string;
  description: string;
  progressThreshold: number;
  statusTexts: string[];
}> = {
  stranger: {
    label: "陌生人",
    description: "初次相遇，还不熟悉",
    progressThreshold: 0,
    statusTexts: [
      "他似乎在等你主动",
      "第一句话，你来开启",
      "一切才刚刚开始"
    ]
  },
  ambiguous: {
    label: "暧昧对象",
    description: "有些心动，试探中",
    progressThreshold: 30,
    statusTexts: [
      "你们之间似乎有了些火花",
      "他好像有话想对你说",
      "今晚的聊天，可能会改变什么"
    ]
  },
  crush: {
    label: "心动对象",
    description: "心跳加速，感情升温",
    progressThreshold: 60,
    statusTexts: [
      "你们之间似乎可以更进一步了",
      "他最近总是在想你",
      "告白的话，你会答应吗"
    ]
  },
  lover: {
    label: "恋人",
    description: "确认关系，开始交往",
    progressThreshold: 85,
    statusTexts: [
      "他在等你打开对话框",
      "今天的你也让他心动",
      "恋人之间的日常，最珍贵"
    ]
  }
};

export interface User {
  id: string;
  username: string;
  email?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface MemoryCard {
  id: string;
  zodiac_sign: string;
  card_title: string;
  card_content: string;
  stage: RelationStage;
  unlocked_at: string;
}

export interface Progress {
  zodiac_sign: string;
  stage: RelationStage;
  progress_value: number;
  updated_at: string;
  occupation_unlocked: boolean;
  last_daily_topic_date: string | null;
}

export interface BoyfriendProfile {
  name: string;
  emoji: string;
  occupation: string;
  personality: string;
  chatStyle: string;
  moodType: "healing" | "sweet" | "ambiguous";
  appearance: string;
  introduction: string;
  story: string;
  weakness: string;
  callNames: Record<RelationStage, string[]>;
  chatExamples: Record<RelationStage, string[]>;
}
