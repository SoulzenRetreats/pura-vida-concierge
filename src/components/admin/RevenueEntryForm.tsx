import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import type { RevenueSplit } from "@/hooks/useRevenueSplits";

const revenueSchema = z.object({
  total_charged: z.coerce.number().min(0, "Must be positive"),
  vendor_cost: z.coerce.number().min(0, "Must be positive"),
  concierge_share_percentage: z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
});

type RevenueFormData = z.infer<typeof revenueSchema>;

interface RevenueEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RevenueFormData) => void;
  existingData?: RevenueSplit | null;
  defaultPercentage: number;
  isPending: boolean;
  bookingName?: string;
}

export function RevenueEntryForm({
  open,
  onOpenChange,
  onSubmit,
  existingData,
  defaultPercentage,
  isPending,
  bookingName,
}: RevenueEntryFormProps) {
  const { t } = useTranslation();
  const [calculatedShare, setCalculatedShare] = useState(0);

  const form = useForm<RevenueFormData>({
    resolver: zodResolver(revenueSchema),
    defaultValues: {
      total_charged: 0,
      vendor_cost: 0,
      concierge_share_percentage: defaultPercentage,
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        total_charged: existingData?.total_charged ?? 0,
        vendor_cost: existingData?.vendor_cost ?? 0,
        concierge_share_percentage: existingData?.concierge_share_percentage ?? defaultPercentage,
        notes: existingData?.notes ?? "",
      });
    }
  }, [open, existingData, defaultPercentage, form]);

  const watchedValues = form.watch(["total_charged", "vendor_cost", "concierge_share_percentage"]);

  useEffect(() => {
    const [total, vendor, percentage] = watchedValues;
    const profit = (total || 0) - (vendor || 0);
    const share = profit * ((percentage || 0) / 100);
    setCalculatedShare(Math.max(0, share));
  }, [watchedValues]);

  const handleSubmit = (data: RevenueFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {existingData ? t("admin.revenue.editEntry") : t("admin.revenue.addEntry")}
          </DialogTitle>
          <DialogDescription>
            {bookingName && <span className="font-medium">{bookingName}</span>}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="total_charged"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.revenue.form.totalCharged")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-7"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vendor_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.revenue.form.vendorCost")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-7"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="concierge_share_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.revenue.form.sharePercentage")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        className="pr-8"
                        {...field}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">{t("admin.revenue.form.calculatedShare")}</div>
              <div className="text-2xl font-bold text-primary">
                ${calculatedShare.toFixed(2)}
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.revenue.form.notes")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("admin.revenue.form.notesPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("admin.revenue.form.cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {existingData ? t("admin.revenue.form.update") : t("admin.revenue.form.create")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
