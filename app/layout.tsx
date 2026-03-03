import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from '@/components/app/layout-wrapper';
import { createClient } from "@/lib/supabase/server";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carve Wiki - Your Health & Fitness Knowledge Base",
  description: "Evidence-based information on nutrition, fitness, and health. Track your progress with personalized dashboards.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0c0e14]`}
      >
        <LayoutWrapper
          isAuthenticated={!!user}
          userEmail={user?.email}
          userName={profile?.display_name || profile?.username || undefined}
          userAvatar={profile?.avatar_image_url || undefined}
          userRole={profile?.role || undefined}
        >
          {children}
        </LayoutWrapper>
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}
