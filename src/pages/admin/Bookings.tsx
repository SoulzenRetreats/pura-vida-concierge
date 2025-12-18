import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookings, useBookingCounts, useUpdateBooking } from "@/hooks/useBookings";
import { BookingStatusBadge } from "@/components/concierge/BookingStatusBadge";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

const statusTabs: Array<{ key: BookingStatus | "all"; labelKey: string }> = [
  { key: "all", labelKey: "all" },
  { key: "new_request", labelKey: "new_request" },
  { key: "in_review", labelKey: "in_review" },
  { key: "quote_sent", labelKey: "quote_sent" },
  { key: "confirmed", labelKey: "confirmed" },
  { key: "completed", labelKey: "completed" },
];

const allStatuses: BookingStatus[] = [
  "new_request",
  "in_review",
  "quote_sent",
  "confirmed",
  "completed",
];

export default function AdminBookings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: bookings, isLoading } = useBookings({ statusFilter, searchTerm });
  const { data: counts } = useBookingCounts();
  const updateBooking = useUpdateBooking();

  const handleStatusOverride = (bookingId: string, newStatus: BookingStatus) => {
    updateBooking.mutate(
      { id: bookingId, status: newStatus },
      {
        onSuccess: () => {
          toast.success(t("admin.bookings.statusUpdated"));
        },
        onError: () => {
          toast.error(t("admin.bookings.error"));
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold">
          {t("admin.bookings.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("admin.bookings.description")}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("concierge.bookings.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as BookingStatus | "all")}
          >
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              {statusTabs.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key} className="text-xs sm:text-sm">
                  {t(`concierge.bookings.tabs.${tab.labelKey}`)}
                  {counts && (
                    <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                      {counts[tab.key] || 0}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !bookings?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("concierge.bookings.noBookings")}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("concierge.bookings.columns.date")}</TableHead>
                    <TableHead>{t("concierge.bookings.columns.customer")}</TableHead>
                    <TableHead className="hidden md:table-cell">
                      {t("concierge.bookings.columns.occasion")}
                    </TableHead>
                    <TableHead>{t("concierge.bookings.columns.status")}</TableHead>
                    <TableHead>{t("admin.bookings.override")}</TableHead>
                    <TableHead className="text-right">
                      {t("concierge.bookings.columns.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        <div>
                          {format(new Date(booking.check_in), "MMM d")} -{" "}
                          {format(new Date(booking.check_out), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {booking.guest_count} {t("concierge.bookings.guests")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{booking.customer_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {booking.customer_email}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {booking.occasion_type
                          ? t(`booking.occasions.${booking.occasion_type}`)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <BookingStatusBadge status={booking.status || "new_request"} />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={booking.status || "new_request"}
                          onValueChange={(value) =>
                            handleStatusOverride(booking.id, value as BookingStatus)
                          }
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {allStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {t(`concierge.bookings.statuses.${status}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/concierge/bookings/${booking.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">{t("concierge.bookings.view")}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
