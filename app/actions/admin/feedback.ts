"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

export async function updateFeatureRequestStatus(id: string, status: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("feature_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/feedback");
}

export async function toggleFeatureRequestVisibility(
  id: string,
  isVisible: boolean
) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("feature_requests")
    .update({ is_visible: isVisible, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/feedback");
}
