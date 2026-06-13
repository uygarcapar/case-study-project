import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { routing } from "@/i18n/routing";
import { Providers } from "@/store/Providers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthUser } from "@/store/slices/authSlice";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Uplide Admin",
  description: "E-Commerce Admin Panel",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme")?.value;
  const initialTheme: "light" | "dark" = themeCookie === "dark" ? "dark" : "light";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialUser: AuthUser | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile) initialUser = { id: profile.id, email: profile.email, role: profile.role };
  }

  return (
    <html
      lang={locale}
      data-theme={initialTheme}
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-bg text-fg">
        <NextIntlClientProvider>
          <Providers initialUser={initialUser} initialTheme={initialTheme}>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
