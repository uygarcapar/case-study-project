"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const buildSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().min(1, t("errorRequired")).email(t("errorEmail")),
    password: z.string().min(6, t("errorPasswordMin")),
  });

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export function LoginForm() {
  const t = useTranslations("auth");
  const tApp = useTranslations("app");
  const locale = useLocale();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(buildSchema(t)),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) {
        toast.error(t("errorInvalid"));
        return;
      }
      router.replace(`/${locale}/dashboard`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div>
          <CardTitle>{t("loginTitle")}</CardTitle>
          <p className="mt-1 text-xl text-[var(--color-fg)]">{tApp("name")}</p>
        </div>
      </CardHeader>
      <CardBody>
        <p className="mb-4 text-xs text-[var(--color-fg-muted)]">{t("loginSubtitle")}</p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label={t("email")}
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label={t("password")}
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" disabled={submitting} fullWidth>
            {submitting ? t("loading") : t("submit")}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
