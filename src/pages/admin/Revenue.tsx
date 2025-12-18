import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { 
  useCompletedBookingsForRevenue, 
  useCreateRevenueSplit, 
  useUpdateRevenueSplit,
  type RevenueSplit,
} from "@/hooks/useRevenueSplits";
import { useAppSetting } from "@/hooks/useAppSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, TrendingUp, Receipt, Edit2, Plus } from "lucide-react";
import { RevenueEntryForm } from "@/components/admin/RevenueEntryForm";
import { toast } from "sonner";

interface SelectedBooking {
  id: string;
  customer_name: string;
  existingRevenue: RevenueSplit | null;
}

export default function AdminRevenue() {
  const { t } = useTranslation();
  const { data: bookings, isLoading } = useCompletedBookingsForRevenue();
  const { data: percentageSetting } = useAppSetting("revenue_share_percentage");
  const createRevenueSplit = useCreateRevenueSplit();
  const updateRevenueSplit = useUpdateRevenueSplit();
  
  const [selectedBooking, setSelectedBooking] = useState<SelectedBooking | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const defaultPercentage = typeof percentageSetting?.value === "number" 
    ? percentageSetting.value 
    : 15;

  const handleOpenForm = (booking: NonNullable<typeof bookings>[number]) => {
    const existing = booking.revenue_splits?.[0] ?? null;
    setSelectedBooking({
      id: booking.id,
      customer_name: booking.customer_name,
      existingRevenue: existing,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (data: {
    total_charged: number;
    vendor_cost: number;
    concierge_share_percentage: number;
    notes?: string;
  }) => {
    if (!selectedBooking) return;

    const profit = data.total_charged - data.vendor_cost;
    const conciergeShare = profit * (data.concierge_share_percentage / 100);

    try {
      if (selectedBooking.existingRevenue) {
        await updateRevenueSplit.mutateAsync({
          id: selectedBooking.existingRevenue.id,
          total_charged: data.total_charged,
          vendor_cost: data.vendor_cost,
          concierge_share_percentage: data.concierge_share_percentage,
          concierge_share_amount: conciergeShare,
          notes: data.notes || null,
          calculated_at: new Date().toISOString(),
        });
        toast.success(t("admin.revenue.updated"));
      } else {
        await createRevenueSplit.mutateAsync({
          booking_id: selectedBooking.id,
          total_charged: data.total_charged,
          vendor_cost: data.vendor_cost,
          concierge_share_percentage: data.concierge_share_percentage,
          concierge_share_amount: conciergeShare,
          notes: data.notes || null,
        });
        toast.success(t("admin.revenue.created"));
      }
      setFormOpen(false);
      setSelectedBooking(null);
    } catch {
      toast.error(t("admin.revenue.error"));
    }
  };

  // Calculate summary stats
  const stats = bookings?.reduce(
    (acc, booking) => {
      const revenue = booking.revenue_splits?.[0];
      if (revenue) {
        acc.totalCharged += revenue.total_charged || 0;
        acc.totalVendorCost += revenue.vendor_cost || 0;
        acc.totalConciergeShare += revenue.concierge_share_amount || 0;
        acc.entriesCount++;
      }
      return acc;
    },
    { totalCharged: 0, totalVendorCost: 0, totalConciergeShare: 0, entriesCount: 0 }
  ) ?? { totalCharged: 0, totalVendorCost: 0, totalConciergeShare: 0, entriesCount: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold">{t("admin.revenue.title")}</h1>
        <p className="text-muted-foreground">{t("admin.revenue.description")}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.revenue.totalCharged")}</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalCharged.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t("admin.revenue.fromEntries", { count: stats.entriesCount })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.revenue.vendorCosts")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalVendorCost.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.revenue.conciergeShare")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${stats.totalConciergeShare.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.revenue.completedBookings")}</CardTitle>
          <CardDescription>{t("admin.revenue.completedDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !bookings?.length ? (
            <p className="text-center text-muted-foreground py-8">
              {t("admin.revenue.noBookings")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.revenue.columns.customer")}</TableHead>
                  <TableHead>{t("admin.revenue.columns.dates")}</TableHead>
                  <TableHead className="text-right">{t("admin.revenue.columns.totalCharged")}</TableHead>
                  <TableHead className="text-right">{t("admin.revenue.columns.vendorCost")}</TableHead>
                  <TableHead className="text-right">{t("admin.revenue.columns.conciergeShare")}</TableHead>
                  <TableHead className="text-right">{t("admin.revenue.columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => {
                  const revenue = booking.revenue_splits?.[0];
                  return (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.customer_name}</div>
                          <div className="text-sm text-muted-foreground">{booking.customer_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(booking.check_in), "MMM d")} - {format(new Date(booking.check_out), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        {revenue?.total_charged != null ? (
                          `$${revenue.total_charged.toLocaleString()}`
                        ) : (
                          <Badge variant="outline">{t("admin.revenue.pending")}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {revenue?.vendor_cost != null ? (
                          `$${revenue.vendor_cost.toLocaleString()}`
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {revenue?.concierge_share_amount != null ? (
                          `$${revenue.concierge_share_amount.toLocaleString()}`
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenForm(booking)}
                        >
                          {revenue ? (
                            <>
                              <Edit2 className="h-4 w-4 mr-1" />
                              {t("admin.revenue.edit")}
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              {t("admin.revenue.add")}
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <RevenueEntryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        existingData={selectedBooking?.existingRevenue}
        defaultPercentage={defaultPercentage}
        isPending={createRevenueSplit.isPending || updateRevenueSplit.isPending}
        bookingName={selectedBooking?.customer_name}
      />
    </div>
  );
}
