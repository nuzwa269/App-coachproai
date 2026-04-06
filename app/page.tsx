import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect logged-in users straight to their dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FF8A00] flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span
            className="text-xl font-bold text-[#111827]"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            CoachPro <span className="text-[#FF8A00]">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-[#FF8A00] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-[#FF8A00] text-white text-sm font-medium hover:bg-[#E67A00] transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#FF8A00] text-xs font-semibold uppercase tracking-wide mb-6">
          🚀 AI-Powered Development Coach
        </div>

        <h1
          className="text-5xl md:text-6xl font-bold text-[#111827] max-w-3xl leading-tight"
          style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
        >
          Build Smarter with{" "}
          <span className="text-[#FF8A00]">AI Coaching</span>
        </h1>

        <p className="mt-6 text-lg text-[#4B5563] max-w-2xl">
          CoachPro AI gives you context-aware AI assistants for every part of
          your project — architecture, databases, APIs, and documentation.
          All in one workspace.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-[#FF8A00] text-white text-base font-semibold hover:bg-[#E67A00] transition-colors shadow-lg shadow-orange-200"
          >
            Start for Free →
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center h-12 px-8 rounded-xl border border-gray-300 text-gray-700 text-base font-medium hover:border-[#FF8A00] hover:text-[#FF8A00] transition-colors"
          >
            Sign In
          </Link>
        </div>

        {/* Feature pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-3 text-sm">
          {[
            "✅ Free tier available",
            "🔒 Secure with Supabase Auth",
            "⚡ Powered by OpenAI / Claude",
            "💾 Save outputs to workspace",
          ].map((feature) => (
            <span
              key={feature}
              className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm"
            >
              {feature}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-200">
        © {new Date().getFullYear()} CoachPro AI. All rights reserved.
      </footer>
    </main>
  );
}

