"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

// 所有视图懒加载，避免 SSR 时编译所有组件导致内存爆炸
const HomeView = dynamic(() => import("@/components/views/home-view").then(m => ({ default: m.HomeView })), { ssr: false });
const CoursesView = dynamic(() => import("@/components/views/courses-view").then(m => ({ default: m.CoursesView })), { ssr: false });
const CourseDetailView = dynamic(() => import("@/components/views/course-detail-view").then(m => ({ default: m.CourseDetailView })), { ssr: false });
const ScriptGeneratorView = dynamic(() => import("@/components/views/script-generator-view").then(m => ({ default: m.ScriptGeneratorView })), { ssr: false });
const ToolsView = dynamic(() => import("@/components/views/tools-view").then(m => ({ default: m.ToolsView })), { ssr: false });
const DashboardView = dynamic(() => import("@/components/views/dashboard-view").then(m => ({ default: m.DashboardView })), { ssr: false });
const AdminView = dynamic(() => import("@/components/views/admin-view").then(m => ({ default: m.AdminView })), { ssr: false });
const AuthView = dynamic(() => import("@/components/views/auth-view").then(m => ({ default: m.AuthView })), { ssr: false });
const WorkspaceView = dynamic(() => import("@/components/views/workspace-view").then(m => ({ default: m.WorkspaceView })), { ssr: false });

export default function Page() {
  const view = useAppStore((s) => s.view);
  const setUser = useAppStore((s) => s.setUser);
  const [synced, setSynced] = React.useState(false);

  // Sync session user on mount
  React.useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user) setUser(d.user);
      })
      .catch(() => {})
      .finally(() => setSynced(true));
  }, [setUser]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {!synced ? (
          <div className="flex h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <React.Suspense
            fallback={
              <div className="flex h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            }
          >
            {view === "home" && <HomeView />}
            {view === "courses" && <CoursesView />}
            {view === "course-detail" && <CourseDetailView />}
            {view === "script-generator" && <ScriptGeneratorView />}
            {view === "tools" && <ToolsView />}
            {view === "dashboard" && <DashboardView />}
            {view === "admin" && <AdminView />}
            {view === "auth" && <AuthView />}
            {view === "workspace" && <WorkspaceView />}
          </React.Suspense>
        )}
      </main>
      <Footer />
    </div>
  );
}
