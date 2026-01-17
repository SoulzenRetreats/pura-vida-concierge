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
import { Checkbox } from "@/components/ui/checkbox";
import { useVendors } from "@/hooks/useVendors";
import type { Service } from "@/hooks/useServices";
import { Constants } from "@/integrations/supabase/types";

const serviceCategories = Constants.public.Enums.service_category;

const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(serviceCategories as unknown as [string, ...string[]]),
  price_range: z.string().optional().nullable(),
  photo_url: z.string().optional().nullable(),
  default_vendor_id: z.string().optional().nullable(),
  is_for_sale: z.boolean().default(false),
  price: z.number().optional().nullable(),
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
  const { t } = useTranslation();
  const { data: vendors = [] } = useVendors({});

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "other",
      price_range: "",
      photo_url: "",
      default_vendor_id: null,
      is_for_sale: false,
      price: null,
    },
  });

  const isForSale = form.watch("is_for_sale");

  useEffect(() => {
    if (open) {
      if (service) {
        form.reset({
          name: service.name,
          description: service.description,
          category: service.category,
          price_range: service.price_range || "",
          photo_url: service.photos?.[0] || "",
          default_vendor_id: service.default_vendor_id || null,
          is_for_sale: service.is_for_sale || false,
          price: service.price || null,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          category: "other",
          price_range: "",
          photo_url: "",
          default_vendor_id: null,
          is_for_sale: false,
          price: null,
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
                      {serviceCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {t(`experiences.filter.${category}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <FormField
              control={form.control}
              name="photo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.services.form.photoUrl")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="https://example.com/photo.jpg"
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

            <FormField
              control={form.control}
              name="is_for_sale"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t("admin.services.form.isForSale")}</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {isForSale && (
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
            )}

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
