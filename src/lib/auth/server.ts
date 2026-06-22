import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export type AuthorizedUser = {
  id: string;
  email: string;
  role: UserRole;
};

async function getAuthorizedUser(): Promise<AuthorizedUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return null;
  return { id: profile.id, email: profile.email, role: profile.role };
}

export async function requireUser(locale: string): Promise<AuthorizedUser> {
  const user = await getAuthorizedUser();
  if (!user) redirect(`/${locale}/login`);
  return user;
}

export async function requireRole(
  locale: string,
  role: UserRole,
): Promise<AuthorizedUser> {
  const user = await requireUser(locale);
  if (role === "full_access" && user.role !== "full_access") {
    redirect(`/${locale}/dashboard`);
  }
  return user;
}
