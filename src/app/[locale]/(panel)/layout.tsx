import { setRequestLocale } from "next-intl/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { requireUser } from "@/lib/auth/server";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function PanelLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUser(locale);

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col lg:pl-0">
        <Header />
        <main className="flex-1 px-4 py-4 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
