import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Category } from "@/hooks/useCategories";

const categorySchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9_]+$/, "Slug must be lowercase letters, numbers, and underscores only"),
  name_en: z.string().min(1, "English name is required"),
  name_es: z.string().min(1, "Spanish name is required"),
  icon: z.string().optional().nullable(),
  sort_order: z.number().min(0).default(0),
  is_active: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSubmit: (data: CategoryFormData) => void;
  isSubmitting?: boolean;
}

export function CategoryForm({
  open,
  onOpenChange,
  category,
  onSubmit,
  isSubmitting = false,
}: CategoryFormProps) {
  const { t } = useTranslation();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      slug: "",
      name_en: "",
      name_es: "",
      icon: "",
      sort_order: 0,
      is_active: true,
    },
  });

  // Auto-generate slug from English name
  const nameEn = form.watch("name_en");
  useEffect(() => {
    if (!category && nameEn) {
      const slug = nameEn
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .substring(0, 50);
      form.setValue("slug", slug, { shouldValidate: true });
    }
  }, [nameEn, category, form]);

  useEffect(() => {
    if (open) {
      if (category) {
        form.reset({
          slug: category.slug,
          name_en: category.name_en,
          name_es: category.name_es,
          icon: category.icon || "",
          sort_order: category.sort_order,
          is_active: category.is_active,
        });
      } else {
        form.reset({
          slug: "",
          name_en: "",
          name_es: "",
          icon: "",
          sort_order: 0,
          is_active: true,
        });
      }
    }
  }, [open, category, form]);

  const handleSubmit = (data: CategoryFormData) => {
    onSubmit({
      ...data,
      icon: data.icon || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {category
              ? t("admin.categories.editCategory")
              : t("admin.categories.addCategory")}
          </DialogTitle>
          <DialogDescription>
            {t("admin.categories.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.categories.form.nameEn")}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Skydiving" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name_es"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.categories.form.nameEs")}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Paracaidismo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.categories.form.slug")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., skydiving"
                      {...field}
                      disabled={!!category}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("admin.categories.form.slugHint")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.categories.form.icon")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Plane"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("admin.categories.form.iconHint")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sort_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.categories.form.sortOrder")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer">
                    {t("admin.categories.form.active")}
                  </FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("admin.revenue.form.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {category
                  ? t("admin.categories.form.update")
                  : t("admin.categories.form.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
