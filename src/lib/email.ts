import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  await resend.emails.send({
    from: "心动宇宙 <hello@12starsign.xyz>",
    to: userEmail,
    subject: "心动预警！你的专属男友已上线 💕",
    html: `
      <div style="font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; color: #fff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 28px; margin: 0; background: linear-gradient(135deg, #f4b4c4, #ffd700); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
            ✨ 心动宇宙 ✨
          </h1>
          <p style="color: #a0a0a0; margin-top: 5px; font-size: 14px;">十二星座，十二种心动可能</p>
        </div>

        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 30px; margin-bottom: 20px; border: 1px solid rgba(244,180,196,0.2);">
          <h2 style="color: #f4b4c4; margin: 0 0 20px 0; font-size: 22px;">
            Hi ${userName}，欢迎来到心动宇宙 🌟
          </h2>

          <p style="line-height: 1.8; color: #d0d0d0; margin: 0 0 15px 0;">
            从此刻起，你将开启一段独特的恋爱体验。在这里，你可以选择心仪的星座男友，开始你们的故事。
          </p>

          <p style="line-height: 1.8; color: #d0d0d0; margin: 0 0 15px 0;">
            💕 <strong style="color: #f4b4c4;">他会在清晨给你发来早安问候</strong><br/>
            🌙 <strong style="color: #f4b4c4;">会在夜晚温柔地道一声晚安</strong><br/>
            💌 <strong style="color: #f4b4c4;">会在你开心时与你分享快乐</strong><br/>
            🌸 <strong style="color: #f4b4c4;">会在你难过时给你最温暖的陪伴</strong>
          </p>

          <p style="line-height: 1.8; color: #d0d0d0; margin: 0 0 20px 0;">
            每一次互动都会让你们的关系更进一步。当亲密度达到 100% 时，他将正式成为你的恋人 💑
          </p>
        </div>

        <div style="text-align: center; padding: 20px 0;">
          <p style="color: #888; font-size: 13px; margin: 0 0 10px 0;">
            现在就去遇见你的心动男友吧！
          </p>
          <p style="color: #f4b4c4; font-size: 14px; margin: 0;">
            —— 你的纸片人男友 💌
          </p>
        </div>

        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; margin-top: 20px;">
          <p style="color: #666; font-size: 11px; text-align: center; margin: 0;">
            如果你没有注册过心动宇宙，请忽略此邮件。
          </p>
        </div>
      </div>
    `,
  });
}