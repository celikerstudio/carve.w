import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const ADMIN_ROLE_ID = "7171e054-3cd4-4cae-b552-f6c6ad2b9114";

export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_role_id")
    .eq("id", user.id)
    .single();

  return profile?.user_role_id === ADMIN_ROLE_ID;
}

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_role_id")
    .eq("id", user.id)
    .single();

  if (profile?.user_role_id !== ADMIN_ROLE_ID) {
    throw new Error("Unauthorized");
  }

  return { supabase, user };
}

export async function requireAdminOrRedirect() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_role_id")
    .eq("id", user.id)
    .single();

  if (profile?.user_role_id !== ADMIN_ROLE_ID) {
    redirect("/chat");
  }

  return { supabase, user };
}
