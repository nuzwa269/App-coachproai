import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export const metadata = {
  title: "Dashboard — CoachPro AI",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the user's profile to get their name
  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name, plan, ai_messages_used, ai_messages_limit")
    .eq("id", user!.id)
    .single();

  // Cast to a typed subset since we selected specific columns
  const profile = profileData as Pick<
    Profile,
    "full_name" | "plan" | "ai_messages_used" | "ai_messages_limit"
  > | null;

  const displayName =
    profile?.full_name ?? user?.email?.split("@")[0] ?? "there";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#FF8A00] to-[#9333EA] p-8 text-white">
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
        >
          Welcome to CoachPro AI, {displayName}! 👋
        </h1>
        <p className="mt-2 text-orange-100">
          Your AI-powered development coach is ready. Start a project to get
          personalized guidance.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Current Plan
          </p>
          <p className="mt-1 text-2xl font-bold text-[#111827] capitalize">
            {profile?.plan ?? "free"}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            AI Messages Used
          </p>
          <p className="mt-1 text-2xl font-bold text-[#111827]">
            {profile?.ai_messages_used ?? 0}{" "}
            <span className="text-sm font-normal text-gray-400">
              / {profile?.ai_messages_limit ?? 50}
            </span>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Projects
          </p>
          <p className="mt-1 text-2xl font-bold text-[#111827]">0</p>
        </div>
      </div>

      {/* Coming soon sections */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
        <div className="text-5xl mb-4">🚀</div>
        <h2
          className="text-xl font-bold text-[#111827]"
          style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
        >
          Project Workspace Coming in Week 2
        </h2>
        <p className="mt-2 text-gray-500 max-w-md mx-auto">
          Soon you&apos;ll be able to create projects, chat with specialised AI
          assistants, and save outputs directly to your workspace.
        </p>
      </div>
    </div>
  );
}
