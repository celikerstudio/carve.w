import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from '@/components/admin/settings-form';

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data: settingsData } = await supabase
    .from('app_settings')
    .select('key, value');

  const settings: Record<string, any> = {};
  settingsData?.forEach((row: any) => {
    settings[row.key] = row.value;
  });

  return <SettingsForm initialSettings={settings} />;
}
