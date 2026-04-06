import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Server-side auth guard — redirect unauthenticated users to login
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex bg-[#FAFAFA]">
      {/* ── Sidebar placeholder ────────────────────────────── */}
      <aside className="w-64 hidden md:flex flex-col bg-white border-r border-gray-200 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span
            className="text-xl font-bold text-[#111827]"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            CoachPro <span className="text-[#FF8A00]">AI</span>
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-[#FF8A00] transition-colors"
          >
            🏠 Dashboard
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
          >
            📁 Projects <span className="ml-auto text-xs">(Week 2)</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
          >
            🤖 AI Chat <span className="ml-auto text-xs">(Week 3)</span>
          </a>
        </nav>
      </aside>

      {/* ── Main content area ──────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top nav */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 shrink-0">
          <h1
            className="text-lg font-semibold text-[#111827] md:hidden"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            CoachPro <span className="text-[#FF8A00]">AI</span>
          </h1>

          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
