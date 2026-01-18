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
import { useVendors } from "@/hooks/useVendors";
import type { Property } from "@/hooks/useProperties";
import { Constants } from "@/integrations/supabase/types";

const locationTypes = Constants.public.Enums.location_type;

const propertySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.enum(locationTypes as unknown as [string, ...string[]]),
  booking_url: z.string().optional().nullable(),
  sleeps: z.number().min(1, "Must sleep at least 1"),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  vendor_id: z.string().optional().nullable(),
  photo_urls: z.string().optional().nullable(),
  amenities_text: z.string().optional().nullable(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: Property | null;
  onSubmit: (data: PropertyFormData) => void;
  isSubmitting?: boolean;
}

export function PropertyForm({
  open,
  onOpenChange,
  property,
  onSubmit,
  isSubmitting = false,
}: PropertyFormProps) {
  const { t } = useTranslation();
  const { data: vendors = [] } = useVendors({});

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      description: "",
      location: "jaco",
      booking_url: "",
      sleeps: 1,
      bedrooms: 1,
      bathrooms: 1,
      vendor_id: null,
      photo_urls: "",
      amenities_text: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (property) {
        // Join arrays into newline-separated strings for textareas
        const photoUrlsString = property.photos?.join("\n") || "";
        const amenitiesString = property.amenities?.join("\n") || "";
        form.reset({
          name: property.name,
          description: property.description,
          location: property.location,
          booking_url: property.booking_url || "",
          sleeps: property.sleeps,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          vendor_id: property.vendor_id || null,
          photo_urls: photoUrlsString,
          amenities_text: amenitiesString,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          location: "jaco",
          booking_url: "",
          sleeps: 1,
          bedrooms: 1,
          bathrooms: 1,
          vendor_id: null,
          photo_urls: "",
          amenities_text: "",
        });
      }
    }
  }, [open, property, form]);

  const handleSubmit = (data: PropertyFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {property
              ? t("admin.properties.editProperty")
              : t("admin.properties.addProperty")}
          </DialogTitle>
          <DialogDescription>
            {t("admin.properties.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.properties.form.name")}</FormLabel>
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
                  <FormLabel>{t("admin.properties.form.description")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.properties.form.location")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locationTypes.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {t(`properties.locations.${loc}`)}
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
              name="booking_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.properties.form.bookingUrl")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder={t("admin.properties.form.bookingUrlPlaceholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="sleeps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.properties.form.sleeps")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.properties.form.bedrooms")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
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
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("admin.properties.form.bathrooms")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="vendor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.properties.form.propertyManager")}</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? null : value)
                    }
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("admin.properties.form.selectManager")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        {t("admin.properties.form.noManager")}
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
              name="photo_urls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.properties.form.photoUrls")}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder={t("admin.properties.form.photoUrlsPlaceholder")}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amenities_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.properties.form.amenities")}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder={t("admin.properties.form.amenitiesPlaceholder")}
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
                {property
                  ? t("admin.properties.form.update")
                  : t("admin.properties.form.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
