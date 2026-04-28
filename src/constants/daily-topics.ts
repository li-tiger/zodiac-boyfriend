import type { ZodiacSign } from "@/types";

export interface DailyTopic {
  id: string;
  keywords: string[];
  topic: string;
  followUp?: string;
}

export const DAILY_TOPICS: DailyTopic[] = [
  {
    id: "food",
    keywords: ["吃", "美食", "餐厅", "做饭", "厨师", "喜欢吃什么"],
    topic: "今天想吃什么？",
    followUp: "我最近发现了一家很棒的小店..."
  },
  {
    id: "work",
    keywords: ["工作", "上班", "加班", "老板", "同事", "辞职", "下班"],
    topic: "今天工作累吗？",
    followUp: "适当休息也很重要哦~"
  },
  {
    id: "movie",
    keywords: ["电影", "看剧", "追剧", "Netflix", "电影院", "影片"],
    topic: "最近有看什么好看的电影吗？",
    followUp: "我最近在看一部..."
  },
  {
    id: "travel",
    keywords: ["旅行", "旅游", "度假", "出差", "想去", "海边", "日本"],
    topic: "最近有想去的地方吗？",
    followUp: "我一直想去..."
  },
  {
    id: "music",
    keywords: ["音乐", "歌", "听歌", "演唱会", "歌手", "Playlist"],
    topic: "最近在听什么歌？",
    followUp: "这首歌真的很适合现在的氛围"
  },
  {
    id: "pet",
    keywords: ["猫", "狗", "宠物", "猫咪", "狗狗", "养宠物"],
    topic: "你喜欢小动物吗？",
    followUp: "我邻居家的猫猫超可爱的"
  },
  {
    id: "hobby",
    keywords: ["爱好", "兴趣", "无聊", "平时做什么", "周末", "休息"],
    topic: "周末一般怎么过？",
    followUp: "我周末喜欢..."
  },
  {
    id: "weather",
    keywords: ["天气", "下雨", "晴天", "冷", "热", "温度", "下雨天"],
    topic: "今天天气怎么样？",
    followUp: "这样的天气很适合..."
  },
  {
    id: "childhood",
    keywords: ["小时候", "童年", "学生时代", "高中", "大学", "毕业"],
    topic: "你小时候最难忘的事是什么？",
    followUp: "我记得我小时候..."
  },
  {
    id: "dream",
    keywords: ["梦想", "以后", "未来", "目标", "想成为", "愿望"],
    topic: "你有什么一直想做的事吗？",
    followUp: "我一直想..."
  },
  {
    id: "friend",
    keywords: ["朋友", "闺蜜", "兄弟", "友情", "朋友多"],
    topic: "你有那种无话不说的朋友吗？",
    followUp: "我最好的朋友是..."
  },
  {
    id: "memory",
    keywords: ["回忆", "记起", "想起", "以前", "曾经", "那件事"],
    topic: "有没有一件事让你一想起来就觉得很温暖？",
    followUp: "让我想想..."
  },
  {
    id: "style",
    keywords: ["穿搭", "衣服", "时尚", "品牌", "购物", "买衣服"],
    topic: "你平时喜欢什么风格的穿搭？",
    followUp: "我比较喜欢..."
  },
  {
    id: "exercise",
    keywords: ["运动", "健身", "跑步", "瑜伽", "锻炼", "健身房"],
    topic: "你有运动的习惯吗？",
    followUp: "我每天都会..."
  },
  {
    id: "late_night",
    keywords: ["晚安", "睡觉", "失眠", "夜深了", "熬夜", "早点睡"],
    topic: "这么晚还没睡？在想什么呢？",
    followUp: "我有时候也会睡不着..."
  }
];

export function matchDailyTopic(message: string): DailyTopic | null {
  const lowerMessage = message.toLowerCase();
  for (const topic of DAILY_TOPICS) {
    for (const keyword of topic.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return topic;
      }
    }
  }
  return null;
}

export interface ImageMessage {
  id: number;
  keywords: string[];
  scene: string;
  imageUrl: string;
}

export const IMAGE_MESSAGES: ImageMessage[] = [
  { id: 1, keywords: ["早安", "早上", "起床"], scene: "morning", imageUrl: "/images/chat/morning-1.jpg" },
  { id: 2, keywords: ["晚安", "睡觉", "夜"], scene: "night", imageUrl: "/images/chat/night-1.jpg" },
  { id: 3, keywords: ["吃饭", "饿", "美食"], scene: "food", imageUrl: "/images/chat/food-1.jpg" },
  { id: 4, keywords: ["工作", "加班", "累"], scene: "work", imageUrl: "/images/chat/work-1.jpg" },
  { id: 5, keywords: ["想念", "想你", "思念"], scene: "miss", imageUrl: "/images/chat/miss-1.jpg" },
  { id: 6, keywords: ["开心", "高兴", "快乐"], scene: "happy", imageUrl: "/images/chat/happy-1.jpg" },
  { id: 7, keywords: ["难过", "伤心", "哭"], scene: "sad", imageUrl: "/images/chat/sad-1.jpg" },
  { id: 8, keywords: ["生气", "愤怒", "讨厌"], scene: "angry", imageUrl: "/images/chat/angry-1.jpg" },
  { id: 9, keywords: ["困", "睡觉", "累了"], scene: "sleepy", imageUrl: "/images/chat/sleepy-1.jpg" },
  { id: 10, keywords: ["约会", "出去", "出门"], scene: "date", imageUrl: "/images/chat/date-1.jpg" },
  { id: 11, keywords: ["咖啡", "奶茶", "喝"], scene: "drink", imageUrl: "/images/chat/drink-1.jpg" },
  { id: 12, keywords: ["雨", "下雨", "雨天"], scene: "rain", imageUrl: "/images/chat/rain-1.jpg" },
  { id: 13, keywords: ["太阳", "晴天", "阳光"], scene: "sunny", imageUrl: "/images/chat/sunny-1.jpg" },
  { id: 14, keywords: ["月亮", "星空", "星星"], scene: "star", imageUrl: "/images/chat/star-1.jpg" },
  { id: 15, keywords: ["花", "玫瑰", "浪漫"], scene: "flower", imageUrl: "/images/chat/flower-1.jpg" },
  { id: 16, keywords: ["狗", "狗狗", "宠物"], scene: "dog", imageUrl: "/images/chat/dog-1.jpg" },
  { id: 17, keywords: ["猫", "猫咪", "喵"], scene: "cat", imageUrl: "/images/chat/cat-1.jpg" },
  { id: 18, keywords: ["照片", "自拍", "拍照"], scene: "photo", imageUrl: "/images/chat/photo-1.jpg" },
  { id: 19, keywords: ["电影", "看剧", "追剧"], scene: "movie", imageUrl: "/images/chat/movie-1.jpg" },
  { id: 20, keywords: ["音乐", "听歌", "歌"], scene: "music", imageUrl: "/images/chat/music-1.jpg" },
  { id: 21, keywords: ["运动", "跑步", "健身"], scene: "exercise", imageUrl: "/images/chat/exercise-1.jpg" },
  { id: 22, keywords: ["海边", "沙滩", "海洋"], scene: "beach", imageUrl: "/images/chat/beach-1.jpg" },
  { id: 23, keywords: ["旅行", "旅游", "度假"], scene: "travel", imageUrl: "/images/chat/travel-1.jpg" },
  { id: 24, keywords: ["新年", "圣诞", "节日"], scene: "festival", imageUrl: "/images/chat/festival-1.jpg" },
  { id: 25, keywords: ["蛋糕", "甜点", "甜食"], scene: "cake", imageUrl: "/images/chat/cake-1.jpg" },
  { id: 26, keywords: ["书", "阅读", "看书"], scene: "book", imageUrl: "/images/chat/book-1.jpg" },
  { id: 27, keywords: ["游戏", "打游戏", "手游"], scene: "game", imageUrl: "/images/chat/game-1.jpg" },
  { id: 28, keywords: [" cooking"], scene: "cooking", imageUrl: "/images/chat/cooking-1.jpg" },
  { id: 29, keywords: ["睡衣", "居家", "宅"], scene: "home", imageUrl: "/images/chat/home-1.jpg" },
  { id: 30, keywords: ["背影", "侧脸", "剪影"], scene: "silhouette", imageUrl: "/images/chat/silhouette-1.jpg" },
  { id: 31, keywords: ["手", "牵手", "手指"], scene: "hand", imageUrl: "/images/chat/hand-1.jpg" },
  { id: 32, keywords: ["拥抱", "抱抱", "抱"], scene: "hug", imageUrl: "/images/chat/hug-1.jpg" },
  { id: 33, keywords: ["心跳", "心动", "脸红"], scene: "heartbeat", imageUrl: "/images/chat/heartbeat-1.jpg" },
  { id: 34, keywords: ["承诺", "誓言", "约定"], scene: "promise", imageUrl: "/images/chat/promise-1.jpg" },
  { id: 35, keywords: ["等待", "期盼", "希望"], scene: "waiting", imageUrl: "/images/chat/waiting-1.jpg" },
  { id: 36, keywords: ["礼物", "惊喜", "纪念日"], scene: "gift", imageUrl: "/images/chat/gift-1.jpg" },
];

export function matchImageMessage(message: string): ImageMessage | null {
  const lowerMessage = message.toLowerCase();
  for (const img of IMAGE_MESSAGES) {
    for (const keyword of img.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return img;
      }
    }
  }
  return null;
}

export function getRandomFallbackImage(): ImageMessage {
  const index = Math.floor(Math.random() * IMAGE_MESSAGES.length);
  return IMAGE_MESSAGES[index];
}
