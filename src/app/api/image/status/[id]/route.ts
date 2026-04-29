import { NextResponse } from "next/server";
import { getImageTask } from "@/lib/image-generation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = getImageTask(id);

    if (!task) {
      return NextResponse.json(
        { error: "任务不存在或已过期" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: task.status,
      imageUrl: task.imageUrl,
      error: task.error,
    });
  } catch {
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
