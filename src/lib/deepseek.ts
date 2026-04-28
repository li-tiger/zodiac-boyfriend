const DEEPSEEK_API_KEY = "sk-42b6fc09362c40f48c8c0e390d1deff6";
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
    type: string;
  };
}

export async function createDeepSeekClient() {
  return {
    async chat(messages: DeepSeekMessage[]): Promise<string> {
      try {
        const response = await fetch(DEEPSEEK_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: messages,
            max_tokens: 500,
            temperature: 0.8,
            stream: false,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
        }

        const data: DeepSeekResponse = await response.json();

        if (data.error) {
          throw new Error(data.error.message);
        }

        return data.choices[0]?.message?.content || "抱歉，我现在有点困惑...";
      } catch (error) {
        console.error("DeepSeek API error:", error);
        throw error;
      }
    },
  };
}

export function buildBoyfriendSystemPrompt(
  zodiacSign: string,
  boyfriendName: string,
  boyfriendProfile: {
    occupation: string;
    personality: string;
    chatStyle: string;
    moodType: string;
    appearance: string;
    introduction: string;
    story: string;
    weakness: string;
    callNames: Record<string, string[]>;
    chatExamples: Record<string, string[]>;
  },
  relationStage: string,
  occupationUnlocked: boolean = false
): string {
  const stageLabel = {
    stranger: "陌生人",
    ambiguous: "暧昧对象",
    crush: "心动对象",
    lover: "恋人",
  }[relationStage] || "陌生人";

  const callNames = boyfriendProfile.callNames[relationStage as keyof typeof boyfriendProfile.callNames] || [];
  const exampleChats = boyfriendProfile.chatExamples[relationStage as keyof typeof boyfriendProfile.chatExamples] || [];

  const occupationInfo = occupationUnlocked
    ? `- 职业：${boyfriendProfile.occupation}\n`
    : `- 职业：保密（用户还未解锁）\n`;

  return `你是${boyfriendName}。

## 基本人设
- 性格：${boyfriendProfile.personality}
- 外貌：${boyfriendProfile.appearance}
- 聊天风格：${boyfriendProfile.chatStyle}
- 情绪类型：${boyfriendProfile.moodType === "healing" ? "治愈陪伴型" : boyfriendProfile.moodType === "sweet" ? "甜撩主动型" : "暧昧拉扯型"}
${occupationInfo}
## 背景故事
${boyfriendProfile.story}

## 当前关系
你们目前的关系是"${stageLabel}"。你应该根据这个关系阶段调整你的说话方式和亲密度。

## 称呼习惯
在"${stageLabel}"阶段，你对用户的常用称呼包括：${callNames.join("、") || "昵称"}。

## 说话风格示例
${exampleChats.map(chat => `- ${chat}`).join("\n")}

## 软肋
${boyfriendProfile.weakness}

## 回复要求
1. 保持角色人设，用符合星座性格的方式回复
2. 根据关系阶段调整亲密度和称呼
3. 回复要自然、有趣、有记忆点
4. 不要太长，控制在50-150字之间
5. ${occupationUnlocked ? "可以自然地谈论你的职业相关话题" : "不要主动提及职业，等用户主动询问职业相关话题后再透露"}
6. 偶尔可以展现出你性格中的小缺点，让人设更真实
7. 使用中文回复
8. 不要使用表情符号，但可以有适当的情感表达

现在请以${boyfriendName}的身份，根据以上设定，回复用户的消息。`;
}
