import type { ZodiacSign } from "@/types";

export const GAME_IMAGES = {
  logo: "https://picsum.photos/seed/zodiac-logo/400/400",

  heroScene: "https://picsum.photos/seed/zodiac-hero/1200/600",

  featureChat: "https://picsum.photos/seed/zodiac-chat/600/400",

  featureMemory: "https://picsum.photos/seed/zodiac-memory/600/400",

  featureStory: "https://picsum.photos/seed/zodiac-story/600/400",

  characterLeo: "https://picsum.photos/seed/zodiac-leo/400/500",

  characterVirgo: "https://picsum.photos/seed/zodiac-virgo/400/500",

  characterScorpio: "https://picsum.photos/seed/zodiac-scorpio/400/500",

  characterAries: "https://picsum.photos/seed/zodiac-aries/400/500",

  characterTaurus: "https://picsum.photos/seed/zodiac-taurus/400/500",

  characterGemini: "https://picsum.photos/seed/zodiac-gemini/400/500",

  characterCancer: "https://picsum.photos/seed/zodiac-cancer/400/500",

  characterLibra: "https://picsum.photos/seed/zodiac-libra/400/500",

  characterSagittarius: "https://picsum.photos/seed/zodiac-sagittarius/400/500",

  characterCapricorn: "https://picsum.photos/seed/zodiac-capricorn/400/500",

  characterAquarius: "https://picsum.photos/seed/zodiac-aquarius/400/500",

  characterPisces: "https://picsum.photos/seed/zodiac-pisces/400/500",

  featureIcon1: "https://picsum.photos/seed/icon-heart/200/200",

  featureIcon2: "https://picsum.photos/seed/icon-star/200/200",

  featureIcon3: "https://picsum.photos/seed/icon-constellation/200/200",
};

export function getCharacterImage(sign: ZodiacSign): string {
  const key = `character${sign.charAt(0).toUpperCase() + sign.slice(1)}` as keyof typeof GAME_IMAGES;
  return GAME_IMAGES[key] || GAME_IMAGES.logo;
}

export function getZodiacEmoji(sign: ZodiacSign): string {
  const emojis: Record<ZodiacSign, string> = {
    aries: "♈",
    taurus: "♉",
    gemini: "♊",
    cancer: "♋",
    leo: "♌",
    virgo: "♍",
    libra: "♎",
    scorpio: "♏",
    sagittarius: "♐",
    capricorn: "♑",
    aquarius: "♒",
    pisces: "♓",
  };
  return emojis[sign] || "⭐";
}
