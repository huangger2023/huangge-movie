import { NextRequest, NextResponse } from "next/server";
import { polishScript } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.content?.trim()) {
      return NextResponse.json({ error: "请输入需要润色的文案" }, { status: 400 });
    }
    const output = await polishScript({
      content: body.content.trim(),
      goal: body.goal || "爆款化",
    });

    const user = await getCurrentUser();
    let savedId: string | null = null;
    if (user) {
      const rec = await db.generatedScript.create({
        data: {
          userId: user.id,
          type: "POLISH",
          movieTitle: body.movieTitle?.trim() || "润色文案",
          genre: body.goal || "爆款化",
          input: body.content.trim().slice(0, 2000),
          output,
          meta: JSON.stringify({ goal: body.goal }),
        },
      });
      savedId = rec.id;
      await db.toolUsage.upsert({
        where: { userId_toolType: { userId: user.id, toolType: "POLISH" } },
        create: { userId: user.id, toolType: "POLISH", count: 1 },
        update: { count: { increment: 1 } },
      });
    }
    return NextResponse.json({ output, savedId });
  } catch (e) {
    console.error("polish error", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "润色失败" },
      { status: 500 }
    );
  }
}
