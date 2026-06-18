import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

// 获取当前用户的生成历史
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const onlyFav = searchParams.get("favorite") === "1";

    const where: Record<string, unknown> = { userId: user.id };
    if (type) where.type = type;
    if (onlyFav) where.isFavorite = true;

    const scripts = await db.generatedScript.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ scripts });
  } catch (e) {
    console.error("scripts list error", e);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// 收藏 / 取消收藏
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    const { id, isFavorite } = await req.json();
    const rec = await db.generatedScript.findUnique({ where: { id } });
    if (!rec || rec.userId !== user.id) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }
    await db.generatedScript.update({
      where: { id },
      data: { isFavorite: !!isFavorite },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("script patch error", e);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}

// 删除
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "缺少 id" }, { status: 400 });
    }
    const rec = await db.generatedScript.findUnique({ where: { id } });
    if (!rec || rec.userId !== user.id) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }
    await db.generatedScript.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("script delete error", e);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
