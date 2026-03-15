import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookings } from "@/hooks/useBookings";

export default function AdminBookings() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: bookings, isLoading } = useBookings({ searchTerm });

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
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("concierge.bookings.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        <div>
                          {format(new Date(booking.check_in), "MMM d")} –{" "}
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
                          : "–"}
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
