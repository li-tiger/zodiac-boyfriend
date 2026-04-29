import type { ZodiacSign } from "@/types";

export const GAME_IMAGES = {
  logo: "/images/characters/Taurus.png",

  heroScene: "/images/characters/Taurus.png",

  featureChat: "/images/characters/Taurus.png",

  featureMemory: "/images/characters/Taurus.png",

  featureStory: "/images/characters/Taurus.png",

  characterAries: "/images/characters/Aries1.png",

  characterTaurus: "/images/characters/Taurus.png",

  characterGemini: "/images/characters/Gemini.png",

  characterCancer: "/images/characters/Cancer.png",

  characterLeo: "/images/characters/Leo.png",

  characterVirgo: "/images/characters/Virgo.png",

  characterLibra: "/images/characters/Libra.png",

  characterScorpio: "/images/characters/Scorpio.png",

  characterSagittarius: "/images/characters/Sagittarius.png",

  characterCapricorn: "/images/characters/Capricorn.png",

  characterAquarius: "/images/characters/Aquarius.png",

  characterPisces: "/images/characters/Pisces.png",

  featureIcon1: "/images/characters/Taurus.png",

  featureIcon2: "/images/characters/Taurus.png",

  featureIcon3: "/images/characters/Taurus.png",
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
