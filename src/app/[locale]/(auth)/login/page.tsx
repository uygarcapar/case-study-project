import { setRequestLocale, getTranslations } from "next-intl/server";
import { Boxes } from "lucide-react";
import { LoginForm } from "./LoginForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("app");

  return (
    <main className="flex min-h-screen flex-col items-center bg-[var(--color-bg)] px-4 pt-32 pb-12">
      <span
        className="mb-10 flex h-24 w-24 items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
        aria-label={t("name")}
      >
        <Boxes className="h-12 w-12" />
      </span>
      <LoginForm />
    </main>
  );
}
