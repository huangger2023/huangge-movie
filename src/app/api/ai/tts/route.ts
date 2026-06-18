import { NextRequest, NextResponse } from "next/server";
import { generateTTS } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = (body.text as string)?.trim();
    if (!text) {
      return NextResponse.json({ error: "请输入要试听的文案" }, { status: 400 });
    }
    const buffer = await generateTTS({
      text,
      voice: body.voice,
      speed: body.speed,
    });
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    console.error("tts error", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "语音合成失败" },
      { status: 500 }
    );
  }
}
