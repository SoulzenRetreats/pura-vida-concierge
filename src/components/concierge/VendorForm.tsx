import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { Vendor } from "@/hooks/useVendors";
import { Constants } from "@/integrations/supabase/types";

const serviceCategories = Constants.public.Enums.service_category;

const vendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact_info: z.string().optional(),
  service_types: z.array(z.string()).optional(),
  internal_notes: z.string().optional(),
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: Vendor | null;
  onSubmit: (data: VendorFormData) => void;
  isSubmitting: boolean;
}

export function VendorForm({
  open,
  onOpenChange,
  vendor,
  onSubmit,
  isSubmitting,
}: VendorFormProps) {
  const { t } = useTranslation();

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      contact_info: "",
      service_types: [],
      internal_notes: "",
    },
  });

  // Reset form when vendor changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: vendor?.name || "",
        contact_info: vendor?.contact_info || "",
        service_types: vendor?.service_types || [],
        internal_notes: vendor?.internal_notes || "",
      });
    }
  }, [open, vendor, form]);

  const handleSubmit = (data: VendorFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {vendor
              ? t("concierge.vendors.editVendor")
              : t("concierge.vendors.addVendor")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("concierge.vendors.form.name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("concierge.vendors.form.namePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("concierge.vendors.form.contactInfo")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("concierge.vendors.form.contactInfoPlaceholder")}
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_types"
              render={() => (
                <FormItem>
                  <FormLabel>{t("concierge.vendors.form.serviceTypes")}</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {serviceCategories.map((category) => (
                      <FormField
                        key={category}
                        control={form.control}
                        name="service_types"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(category)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, category]);
                                  } else {
                                    field.onChange(
                                      current.filter((c) => c !== category)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {t(`experiences.filter.${category}`)}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="internal_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("concierge.vendors.form.internalNotes")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("concierge.vendors.form.internalNotesPlaceholder")}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("concierge.vendors.form.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {vendor
                  ? t("concierge.vendors.form.update")
                  : t("concierge.vendors.form.create")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
