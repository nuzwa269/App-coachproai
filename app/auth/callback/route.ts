import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // ✅ IMPORTANT: use relative redirect (NOT absolute URL)
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // ❌ fallback
  return NextResponse.redirect(new URL("/login?error=auth_callback_failed", request.url));
}
