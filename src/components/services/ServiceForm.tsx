import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCategories, getCategoryName } from "@/hooks/useCategories";
import type { Service } from "@/hooks/useServices";

const serviceSchema = z.object({
  name_en: z.string().min(1, "English name is required"),
  name_es: z.string().optional().default(""),
  description_en: z.string().min(1, "English description is required"),
  description_es: z.string().optional().default(""),
  category: z.string().min(1, "Category is required"),
  price_min: z.number().optional().nullable(),
  price_max: z.number().optional().nullable(),
  photo_urls: z.string().optional().nullable(),
  is_for_sale: z.boolean().default(false),
  is_rental: z.boolean().default(false),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
  onSubmit: (data: ServiceFormData) => void;
  isSubmitting?: boolean;
}

export function ServiceForm({
  open,
  onOpenChange,
  service,
  onSubmit,
  isSubmitting = false,
}: ServiceFormProps) {
  const { t, i18n } = useTranslation();
  const { data: categories = [] } = useCategories();

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name_en: "",
      name_es: "",
      description_en: "",
      description_es: "",
      category: "other",
      price_min: null,
      price_max: null,
      photo_urls: "",
      is_for_sale: false,
      is_rental: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (service) {
        const photoUrlsString = service.photos?.join("\n") || "";
        form.reset({
          name_en: (service as any).name_en || service.name || "",
          name_es: (service as any).name_es || "",
          description_en: (service as any).description_en || service.description || "",
          description_es: (service as any).description_es || "",
          category: service.category,
          price_min: service.price_min ?? null,
          price_max: service.price_max ?? null,
          photo_urls: photoUrlsString,
          is_for_sale: service.is_for_sale ?? false,
          is_rental: service.is_rental ?? false,
        });
      } else {
        form.reset({
          name_en: "",
          name_es: "",
          description_en: "",
          description_es: "",
          category: "other",
          price_min: null,
          price_max: null,
          photo_urls: "",
          is_for_sale: false,
          is_rental: false,
        });
      }
    }
  }, [open, service, form]);

  const handleSubmit = (data: ServiceFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {service
              ? t("admin.services.editService")
              : t("admin.services.addService")}
          </DialogTitle>
          <DialogDescription>
            {t("admin.services.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Localized Name & Description Tabs */}
            <Tabs defaultValue="en" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="en" className="flex-1">
                  {t("admin.services.form.tabEnglish")}
                </TabsTrigger>
                <TabsTrigger value="es" className="flex-1">
                  {t("admin.services.form.tabSpanish")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="en" className="space-y-4">
                <FormField
                  control={form.control}
                  name="name_en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.services.form.nameEn")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description_en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.services.form.descriptionEn")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="es" className="space-y-4">
                <FormField
                  control={form.control}
                  name="name_es"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.services.form.nameEs")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description_es"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("admin.services.form.descriptionEs")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.services.form.category")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.slug} value={category.slug}>
                          {getCategoryName(category, i18n.language)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* For Sale and Rental toggles */}
            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="is_for_sale"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      {t("admin.services.form.forSale")}
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_rental"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      {t("admin.services.form.rental")}
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {/* Price Min / Max */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.services.form.priceMin")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.services.form.priceMax")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              {t("admin.services.form.priceHelp")}
            </p>

            <FormField
              control={form.control}
              name="photo_urls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.services.form.photoUrls")}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder={t("admin.services.form.photoUrlsPlaceholder")}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
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
                {service
                  ? t("admin.services.form.update")
                  : t("admin.services.form.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
