"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import {
  customerSchema,
  customerStatuses,
  type CustomerFormValues,
} from "@/lib/validations/customerSchema";
import {
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from "@/store/slices/customersApi";
import type { CustomerRow } from "@/types/database";

type Props = {
  mode: "create" | "update";
  initial?: CustomerRow;
  locale: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

function getValidationMessage(t: (key: string) => string, code?: string) {
  if (!code) return undefined;
  if (code === "minLength") return t("errorMinLength");
  if (code === "invalidEmail") return t("errorInvalidEmail");
  return code;
}

export function CustomerForm({ mode, initial, locale, onSuccess, onCancel }: Props) {
  const t = useTranslations("customers.form");
  const tCustomers = useTranslations("customers");
  const tStatus = useTranslations("customers.status");
  const tValidation = useTranslations("validation");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: initial
      ? {
          full_name: initial.full_name,
          email: initial.email,
          phone: initial.phone ?? "",
          city: initial.city ?? "",
          status: initial.status as CustomerFormValues["status"],
        }
      : {
          full_name: "",
          email: "",
          phone: "",
          city: "",
          status: "active",
        },
  });

  const [createCustomer] = useCreateCustomerMutation();
  const [updateCustomer] = useUpdateCustomerMutation();

  async function onSubmit(values: CustomerFormValues) {
    setSubmitting(true);
    try {
      const payload = {
        full_name: values.full_name,
        email: values.email,
        phone: values.phone || null,
        city: values.city || null,
        status: values.status,
      };
      if (mode === "create") {
        await createCustomer(payload).unwrap();
        toast.success(tCustomers("created"));
      } else if (initial) {
        await updateCustomer({ id: initial.id, patch: payload }).unwrap();
        toast.success(tCustomers("updated"));
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/${locale}/customers`);
        router.refresh();
      }
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardBody className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label={t("fullName")}
            error={getValidationMessage(tValidation, errors.full_name?.message)}
            {...register("full_name")}
          />
          <Input
            label={t("email")}
            type="email"
            error={getValidationMessage(tValidation, errors.email?.message)}
            {...register("email")}
          />
          <Input
            label={t("phone")}
            error={getValidationMessage(tValidation, errors.phone?.message)}
            {...register("phone")}
          />
          <Input
            label={t("city")}
            error={getValidationMessage(tValidation, errors.city?.message)}
            {...register("city")}
          />
          <Select
            label={t("status")}
            error={getValidationMessage(tValidation, errors.status?.message)}
            {...register("status")}
          >
            {customerStatuses.map((s) => (
              <option key={s} value={s}>
                {tStatus(s)}
              </option>
            ))}
          </Select>
        </CardBody>
      </Card>

      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {tCommon("cancel")}
          </Button>
        ) : (
          <Link href="/customers">
            <Button type="button" variant="ghost">
              {tCommon("cancel")}
            </Button>
          </Link>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting
            ? tCommon("loading")
            : mode === "create"
              ? t("submitCreate")
              : t("submitUpdate")}
        </Button>
      </div>
    </form>
  );
}
