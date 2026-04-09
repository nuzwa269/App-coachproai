import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type UserRole = "user" | "subscriber" | "admin" | "super_admin";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  subscriber: 1,
  admin: 2,
  super_admin: 3,
};

/**
 * Returns true if `userRole` meets or exceeds `requiredRole` in the hierarchy.
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/** True for admin or super_admin. */
export function isAdmin(role: UserRole): boolean {
  return role === "admin" || role === "super_admin";
}

/** True only for super_admin. */
export function isSuperAdmin(role: UserRole): boolean {
  return role === "super_admin";
}

/** True for subscriber, admin, or super_admin. */
export function isSubscriber(role: UserRole): boolean {
  return hasRole(role, "subscriber");
}

/**
 * Fetches the authenticated user's role from the profiles table.
 * Defaults to 'user' if no profile or role is found.
 */
export async function getUserRole(
  supabase: SupabaseClient<Database>
): Promise<UserRole> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "user";

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (data?.role as UserRole | null) ?? "user";
}
