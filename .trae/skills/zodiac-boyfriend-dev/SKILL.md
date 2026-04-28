---
name: "zodiac-boyfriend-dev"
description: "Development guide for 12星座男友手账 web game. Invoke when building features, fixing bugs, or extending the chat game with zodiac boyfriend characters, relationship progression, and memory journal."
---

# 12星座男友手账 - 开发指南

## 产品定位

面向 25~30 岁都市职场女性的轻量网页恋爱聊天游戏，核心主题：**12星座男友收集 + 网恋式聊天 + 自动生成恋爱手账**。

整体气质：**轻奢都市恋爱风** - 成熟、克制、暧昧、有现实网恋感的幻想陪伴产品。

---

## 核心概念

### 关系阶段 (4阶段)
1. **陌生人** → 2. **暧昧对象** → 3. **心动对象** → 4. **恋人**

每个阶段有心动进度条（不显示具体数值），进度允许轻微下降但不会倒退。

### 12星座男友人设

| 星座 | 职业 | 性格关键词 | 聊天风格 |
|------|------|-----------|----------|
| 白羊 | 消防员 | 热烈、保护欲、行动派 | 直球直接 |
| 金牛 | 甜品店主 | 稳定、投喂、生活感 | 慢热用行动表达 |
| 双子 | 主播 | 会聊、会撩、新鲜感 | 灵动有趣 |
| 巨蟹 | 儿科医生 | 温柔、照顾、治愈感 | 情绪承接强 |
| 狮子 | 演员 | 耀眼、偏宠、骄傲感 | 骄傲但宠溺 |
| 处女 | 律师 | 理性、细节、克制关心 | 毒舌包装关心 |
| 天秤 | 造型师 | 优雅、暧昧、审美感 | 擅长拉近距离 |
| 天蝎 | 外科医生 | 神秘、深情、压迫感 | 深情试探 |
| 射手 | 旅行摄影师 | 自由、热烈、远方感 | 热情自由 |
| 摩羯 | 投资人 | 成熟、责任、掌控感 | 慢热稳定 |
| 水瓶 | AI工程师 | 特别、疏离、精神共鸣 | 疏离但特别 |
| 双鱼 | 插画师 | 浪漫、共情、梦幻感 | 情绪浓度高 |

### 聊天情绪尺度
- **治愈陪伴型**：金牛、巨蟹、双鱼
- **甜撩主动型**：白羊、双子、狮子、射手
- **暧昧拉扯型**：处女、天秤、天蝎、摩羯、水瓶

---

## 项目结构

```
src/
├── app/
│   ├── (main)/              # 需要登录的页面
│   │   ├── chat/           # 聊天页面 (核心)
│   │   ├── gallery/        # 恋爱手账/回忆卡
│   │   ├── home/           # 首页
│   │   └── select/         # 角色选择页
│   ├── api/                # API路由
│   │   ├── auth/           # 认证 (login/register/logout/me)
│   │   ├── chat/           # 聊天消息
│   │   ├── progress/       # 关系进度
│   │   └── memory-cards/   # 回忆卡
│   ├── login/              # 登录页
│   └── register/           # 注册页
├── components/
│   └── BackgroundEffects.tsx  # 星星背景+极光效果
├── constants/
│   ├── boyfriends.ts       # 12星座男友数据
│   └── images-game.ts      # 图片配置
├── contexts/
│   └── AuthContext.tsx     # 认证状态管理
├── lib/
│   └── db.ts               # Supabase数据库客户端
└── types/
    └── index.ts             # TypeScript类型定义
```

---

## 关键类型定义

```typescript
// types/index.ts
type ZodiacSign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' 
                | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

type RelationStage = 'stranger' | 'ambiguous' | 'crush' | 'lover';

interface Boyfriend {
  sign: ZodiacSign;
  name: string;
  emoji: string;
  occupation: string;           // 职业（陌生人阶段解锁）
  personality: string;          // 性格
  chatStyle: string;            // 聊天风格
  moodType: 'healing' | 'sweet' | 'ambiguous';  // 情绪类型
  appearance: string;           // 外貌描述
  introduction: string;         // 暧昧氛围介绍
  callNames: Record<RelationStage, string[]>;  // 各阶段称呼
}

interface Progress {
  user_id: number;
  zodiac_sign: ZodiacSign;
  stage: RelationStage;
  progress_value: number;       // 0-100，好感进度
}

interface ChatMessage {
  id: string;
  user_id: number;
  zodiac_sign: ZodiacSign;
  role: 'user' | 'assistant';
  content: string;
  image_url?: string;           // 可选的图片消息
  created_at: string;
}

interface MemoryCard {
  id: string;
  user_id: number;
  zodiac_sign: ZodiacSign;
  title: string;               // 如"第一次相遇"
  description: string;
  image_url: string;
  stage: RelationStage;        // 哪个阶段解锁
  unlocked_at: string;
}
```

---

## 设计规范

### 配色方案（轻奢都市恋爱风）
```css
--bg-primary: #050a12;         /* 深夜蓝黑 */
--bg-secondary: #0d1b2e;       /* 卡片背景 */
--bg-card: rgba(13,27,46,0.8); /* 半透明卡片 */
--accent-pink: #f0b8c4;        /* 雾粉 */
--accent-gold: #d4a574;        /* 香槟金 */
--text-primary: #ffffff;
--text-secondary: #a8b2c1;
--border-light: rgba(240,184,196,0.2);
--gradient-pink: linear-gradient(135deg, #f0b8c4, #d4a574);
```

### 视觉风格
- **Glassmorphism**：半透明磨砂玻璃效果
- **glow-border**：粉色光晕边框
- **星星粒子动画**：深空背景感
- **aurora-bg**：极光流动效果

### 动效
- 打字指示器动画：`typing-dot` class
- 心跳动画：`animate-glow-pulse`
- 星星粒子：`star-particle` class

---

## API 设计

### 认证 API
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `GET /api/auth/me` - 获取当前用户

### 业务 API
- `GET/POST /api/progress` - 获取/创建关系进度
- `GET/POST /api/chat` - 获取/发送聊天消息
- `GET /api/memory-cards` - 获取回忆卡
- `POST /api/memory-cards/generate` - 生成回忆卡

### Supabase 表结构
- `users` - 用户表
- `progress` - 关系进度表
- `chat_messages` - 聊天消息表
- `memory_cards` - 回忆卡表

---

## 开发注意事项

### 1. 聊天系统要点
- 男友回复前有 1-3 秒"正在输入中"等待感
- 关键节点进度阈值后，由用户主动开启剧情
- 图片消息采用预生成图片（目前用 Picsum 随机图片）

### 2. 称呼系统
- 陌生人阶段：叫昵称或名字
- 暧昧对象阶段：更亲近的叫法
- 心动对象阶段：可能出现专属称呼
- 恋人阶段：稳定的亲密称呼

### 3. 今日话题机制
- 系统提示"今日话题已解锁"
- 男友用自己星座风格包装发起话题

### 4. 重要提示文案
- "你们之间似乎可以更进一步了。"
- "他好像有话想对你说。"
- "今晚的聊天，可能会改变你们的关系。"

---

## 当前实现状态

### ✅ 已完成
- 用户注册/登录/登出
- 12星座角色选择页
- 聊天界面（文字消息）
- 关系进度管理
- 恋爱手账页面
- 回忆卡展示
- 深空主题 UI 样式

### 🚧 待开发
- 图片消息系统（需要预生成36张职业/日常/暧昧图片）
- 关键剧情选项系统
- 每日话题机制
- 主动消息推送提示
- 称呼阶段升级
- 恋人日常模式
- 12星座收集完成后的长期模式

---

## 技术栈
- **框架**：Next.js 16 (App Router)
- **样式**：Tailwind CSS
- **数据库**：Supabase
- **认证**：JWT Cookie
- **图片**：Picsum (当前)，需替换为预生成图片
