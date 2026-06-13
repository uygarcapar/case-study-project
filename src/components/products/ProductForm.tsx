"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { Link } from "@/i18n/navigation";
import {
  productCategories,
  productSchema,
  productStatuses,
  type ProductFormValues,
} from "@/lib/validations/productSchema";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/store/slices/productsApi";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  uploadProductImage,
} from "@/lib/supabase/storage";
import type { ProductRow } from "@/types/database";

type Props = {
  mode: "create" | "update";
  initial?: ProductRow;
  locale: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

function getValidationMessage(t: (key: string) => string, code?: string) {
  if (!code) return undefined;
  if (code === "required") return t("errorRequired");
  if (code === "min0") return t("errorMin0");
  if (code === "integer") return t("errorInteger");
  if (code === "invalidUrl") return t("errorInvalidUrl");
  return code;
}

export function ProductForm({ mode, initial, locale, onSuccess, onCancel }: Props) {
  const t = useTranslations("products.form");
  const tProducts = useTranslations("products");
  const tStatus = useTranslations("products.status");
  const tValidation = useTranslations("validation");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Image state managed outside RHF (file + preview + removed flag)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initial?.image_url ?? null,
  );
  const [imageRemoved, setImageRemoved] = useState(false);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function onFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
      toast.error(t("invalidImageType"));
      e.target.value = "";
      return;
    }
    if (f.size > MAX_IMAGE_SIZE) {
      toast.error(t("fileTooLarge"));
      e.target.value = "";
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(f);
    objectUrlRef.current = url;
    setImageFile(f);
    setImagePreview(url);
    setImageRemoved(false);
  }

  function onRemoveImage() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setImageFile(null);
    setImagePreview(null);
    setImageRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initial
      ? {
          name_tr: initial.name.tr,
          name_en: initial.name.en,
          description_tr: initial.description?.tr ?? "",
          description_en: initial.description?.en ?? "",
          category: initial.category as ProductFormValues["category"],
          price: initial.price,
          stock: initial.stock,
          status: initial.status as ProductFormValues["status"],
          image_url: initial.image_url ?? "",
        }
      : {
          name_tr: "",
          name_en: "",
          description_tr: "",
          description_en: "",
          category: "other",
          price: 0,
          stock: 0,
          status: "draft",
          image_url: "",
        },
  });

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  async function onSubmit(values: ProductFormValues) {
    setSubmitting(true);
    try {
      let imageUrl: string | null = initial?.image_url ?? null;
      if (imageRemoved) imageUrl = null;
      if (imageFile) {
        try {
          const result = await uploadProductImage(imageFile);
          imageUrl = result.url;
        } catch {
          toast.error(t("uploadFailed"));
          return;
        }
      }

      const payload = {
        name: { tr: values.name_tr, en: values.name_en },
        description:
          values.description_tr || values.description_en
            ? { tr: values.description_tr ?? "", en: values.description_en ?? "" }
            : null,
        category: values.category,
        price: values.price,
        stock: values.stock,
        status: values.status,
        image_url: imageUrl,
      };
      if (mode === "create") {
        await createProduct(payload).unwrap();
        toast.success(tProducts("created"));
      } else if (initial) {
        await updateProduct({ id: initial.id, patch: payload }).unwrap();
        toast.success(tProducts("updated"));
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/${locale}/products`);
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
            label={t("nameTr")}
            error={getValidationMessage(tValidation, errors.name_tr?.message)}
            {...register("name_tr")}
          />
          <Input
            label={t("nameEn")}
            error={getValidationMessage(tValidation, errors.name_en?.message)}
            {...register("name_en")}
          />
          <Textarea
            label={t("descriptionTr")}
            error={getValidationMessage(tValidation, errors.description_tr?.message)}
            {...register("description_tr")}
          />
          <Textarea
            label={t("descriptionEn")}
            error={getValidationMessage(tValidation, errors.description_en?.message)}
            {...register("description_en")}
          />
          <Select
            label={t("category")}
            error={getValidationMessage(tValidation, errors.category?.message)}
            {...register("category")}
          >
            {productCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select
            label={t("status")}
            error={getValidationMessage(tValidation, errors.status?.message)}
            {...register("status")}
          >
            {productStatuses.map((s) => (
              <option key={s} value={s}>
                {tStatus(s)}
              </option>
            ))}
          </Select>
          <Controller
            control={control}
            name="price"
            render={({ field, fieldState }) => (
              <MoneyInput
                label={t("price")}
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                error={getValidationMessage(tValidation, fieldState.error?.message)}
              />
            )}
          />
          <Input
            type="number"
            step="1"
            label={t("stock")}
            error={getValidationMessage(tValidation, errors.stock?.message)}
            {...register("stock", { valueAsNumber: true })}
          />

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-[var(--color-fg)]">
              {t("image")}
            </label>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-[var(--color-fg-muted)]" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  className="hidden"
                  onChange={onFileSelect}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  {imagePreview ? t("replaceImage") : t("uploadImage")}
                </Button>
                {imagePreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onRemoveImage}
                  >
                    <Trash2 className="h-4 w-4 text-[var(--color-danger)]" />
                    {t("removeImage")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {tCommon("cancel")}
          </Button>
        ) : (
          <Link href="/products">
            <Button type="button" variant="ghost">
              {tCommon("cancel")}
            </Button>
          </Link>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting
            ? t("saving")
            : mode === "create"
              ? t("submitCreate")
              : t("submitUpdate")}
        </Button>
      </div>
    </form>
  );
}
