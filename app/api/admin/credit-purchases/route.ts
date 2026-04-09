import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server-roles";

export async function GET(request: Request) {
  let supabase;
  try {
    ({ supabase } = await requireAdmin());
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status") ?? "pending";

  const query = supabase
    .from("credit_purchases")
    .select("*, credit_packs(name), profiles(email)")
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query.eq("status", statusFilter as "pending" | "approved" | "rejected");
  }

  const { data: purchases, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(purchases);
}

export async function PATCH(request: Request) {
  let supabase;
  try {
    ({ supabase } = await requireAdmin());
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { purchaseId, action, admin_notes } = body as {
    purchaseId: string;
    action: "approve" | "reject";
    admin_notes?: string;
  };

  if (!purchaseId || !action) {
    return NextResponse.json(
      { error: "purchaseId and action are required" },
      { status: 400 }
    );
  }

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json(
      { error: "action must be 'approve' or 'reject'" },
      { status: 400 }
    );
  }

  // Fetch the purchase
  const { data: purchase, error: fetchError } = await supabase
    .from("credit_purchases")
    .select("id, user_id, credits, status")
    .eq("id", purchaseId)
    .single();

  if (fetchError || !purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  if (purchase.status !== "pending") {
    return NextResponse.json(
      { error: "Purchase has already been reviewed" },
      { status: 400 }
    );
  }

  if (action === "approve") {
    // Add credits to the user's balance
    const { error: rpcError } = await supabase.rpc("add_credits", {
      p_user_id: purchase.user_id,
      p_amount: purchase.credits,
    });

    if (rpcError) {
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }
  }

  // Update purchase status
  const { data: updated, error: updateError } = await supabase
    .from("credit_purchases")
    .update({
      status: action === "approve" ? "approved" : "rejected",
      admin_notes: admin_notes ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", purchaseId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json(updated);
}

