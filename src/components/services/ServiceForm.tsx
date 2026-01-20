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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useVendors } from "@/hooks/useVendors";
import { useCategories, getCategoryName } from "@/hooks/useCategories";
import type { Service } from "@/hooks/useServices";

const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  price_range: z.string().optional().nullable(),
  photo_urls: z.string().optional().nullable(),
  default_vendor_id: z.string().optional().nullable(),
  price: z.number().optional().nullable(),
  is_for_sale: z.boolean().default(false),
  is_rental: z.boolean().default(false),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

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
  const { data: vendors = [] } = useVendors({});
  const { data: categories = [] } = useCategories();

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "other",
      price_range: "",
      photo_urls: "",
      default_vendor_id: null,
      price: null,
      is_for_sale: false,
      is_rental: false,
    },
  });

  const selectedCategory = form.watch("category");
  const isLuxuryItem = selectedCategory === "luxury_items";

  useEffect(() => {
    if (open) {
      if (service) {
        // Join photos array into newline-separated string for textarea
        const photoUrlsString = service.photos?.join("\n") || "";
        form.reset({
          name: service.name,
          description: service.description,
          category: service.category,
          price_range: service.price_range || "",
          photo_urls: photoUrlsString,
          default_vendor_id: service.default_vendor_id || null,
          price: service.price || null,
          is_for_sale: service.is_for_sale ?? false,
          is_rental: service.is_rental ?? false,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          category: "other",
          price_range: "",
          photo_urls: "",
          default_vendor_id: null,
          price: null,
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.services.form.name")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.services.form.description")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            {/* Show price range for non-luxury items, fixed price for luxury items */}
            {isLuxuryItem ? (
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.services.form.price")}</FormLabel>
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
            ) : (
              <FormField
                control={form.control}
                name="price_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.services.form.priceRange")}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="$50 - $200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

            <FormField
              control={form.control}
              name="default_vendor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.services.form.defaultVendor")}</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? null : value)
                    }
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("admin.services.form.selectVendor")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        {t("admin.services.form.noVendor")}
                      </SelectItem>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
