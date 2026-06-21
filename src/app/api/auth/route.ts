import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, setSession, clearSession } from "@/lib/auth";

export const runtime = "nodejs";

// 登录 / 注册
export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json();
    if (!email?.trim()) {
      return NextResponse.json({ error: "请输入邮箱" }, { status: 400 });
    }

    let user = await db.user.findUnique({ where: { email: email.trim() } });
    if (!user) {
      // 注册新用户
      user = await db.user.create({
        data: {
          email: email.trim(),
          name: name?.trim() || email.split("@")[0],
          password: password || "123456",
          role: "STUDENT",
        },
      });
    } else {
      if (password && user.password !== password) {
        return NextResponse.json({ error: "密码错误" }, { status: 401 });
      }
    }

    await setSession(user.id);
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as "STUDENT" | "ADMIN",
        avatar: user.avatar,
      },
    });
  } catch (e) {
    console.error("auth error", e);
    return NextResponse.json({ error: "登录失败", detail: e instanceof Error ? e.message : String(e), db: process.env.DATABASE_URL ?? "(未设置)" }, { status: 500 });
  }
}

// 获取当前用户
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({ user });
  } catch (e) {
    console.error("auth get error", e);
    return NextResponse.json({ user: null });
  }
}

// 登出
export async function DELETE() {
  try {
    await clearSession();
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("logout error", e);
    return NextResponse.json({ error: "登出失败" }, { status: 500 });
  }
}
