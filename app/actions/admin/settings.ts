"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

export async function getSettings(keys: string[]) {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", keys);

  if (error) throw new Error(error.message);

  const settings: Record<string, any> = {};
  data?.forEach((row: any) => {
    settings[row.key] = row.value;
  });
  return settings;
}

export async function saveSetting(key: string, value: any) {
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase
    .from("app_settings")
    .upsert({
      key,
      value,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
}

export async function saveSettings(settings: Record<string, any>) {
  const { supabase, user } = await requireAdmin();

  const rows = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("app_settings")
    .upsert(rows);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
}
