// 图片生成任务管理
import type { ZodiacSign } from "@/types";
import { generateSceneImage, type ScenePrompt } from "./volcano-image";

export interface ImageGenerationTask {
  id: string;
  status: "generating" | "completed" | "failed";
  imageUrl: string | null;
  error: string | null;
  createdAt: number;
}

// 内存存储生成任务（生产环境建议使用 Redis）
const taskStore = new Map<string, ImageGenerationTask>();

// 清理过期任务（30分钟）
const CLEANUP_INTERVAL = 30 * 60 * 1000;

export function createImageTask(): string {
  const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const task: ImageGenerationTask = {
    id,
    status: "generating",
    imageUrl: null,
    error: null,
    createdAt: Date.now(),
  };
  taskStore.set(id, task);
  return id;
}

export function getImageTask(id: string): ImageGenerationTask | null {
  return taskStore.get(id) || null;
}

export function updateImageTask(
  id: string,
  updates: Partial<ImageGenerationTask>
): void {
  const task = taskStore.get(id);
  if (task) {
    Object.assign(task, updates);
  }
}

export async function generateImageAsync(
  taskId: string,
  sign: ZodiacSign,
  scenePrompt: ScenePrompt,
  llmSceneDescription: string
): Promise<void> {
  try {
    const generatedImage = await generateSceneImage(sign, {
      ...scenePrompt,
      prompt_template: llmSceneDescription,
    });

    updateImageTask(taskId, {
      status: "completed",
      imageUrl: generatedImage.url,
    });
  } catch (error) {
    console.error("Async image generation failed:", error);
    updateImageTask(taskId, {
      status: "failed",
      error: error instanceof Error ? error.message : "生成失败",
    });
  }
}

// 定期清理过期任务
setInterval(() => {
  const now = Date.now();
  for (const [id, task] of taskStore.entries()) {
    if (now - task.createdAt > CLEANUP_INTERVAL) {
      taskStore.delete(id);
    }
  }
}, CLEANUP_INTERVAL);
