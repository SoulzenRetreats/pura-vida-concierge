import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Search, Copy, Check, Mail, Clock, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useBookings, useNotificationRecipient } from "@/hooks/useBookings";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";

export default function AdminBookings() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: bookings, isLoading } = useBookings({ searchTerm });

  const handleCopy = async (booking: NonNullable<typeof bookings>[number]) => {
    const services = booking.booking_services
      ?.map((bs) => bs.services?.name)
      .filter(Boolean);

    const text = [
      `${t("concierge.bookings.columns.customer")}: ${booking.customer_name}`,
      `Email: ${booking.customer_email}`,
      booking.customer_phone ? `Phone: ${booking.customer_phone}` : null,
      `${t("concierge.bookings.columns.date")}: ${format(new Date(booking.check_in), "MMM d")} – ${format(new Date(booking.check_out), "MMM d, yyyy")}`,
      `${t("concierge.bookings.guests")}: ${booking.guest_count}`,
      booking.occasion_type
        ? `${t("concierge.bookings.columns.occasion")}: ${t(`booking.occasions.${booking.occasion_type}`)}`
        : null,
      services?.length
        ? `\n${t("admin.bookings.tripPlan")}:\n${services.map((s) => `  • ${s}`).join("\n")}`
        : null,
      booking.special_notes ? `\nNotes: ${booking.special_notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    await navigator.clipboard.writeText(text);
    setCopiedId(booking.id);
    toast.success(t("admin.bookings.detailsCopied"));
    setTimeout(() => setCopiedId(null), 2000);
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
            <Accordion type="single" collapsible className="w-full">
              {bookings.map((booking) => {
                const services = booking.booking_services
                  ?.map((bs) => bs.services?.name)
                  .filter(Boolean) as string[];
                const submittedAt = booking.created_at
                  ? format(new Date(booking.created_at), "MMM d, yyyy 'at' h:mm a")
                  : "–";

                return (
                  <AccordionItem key={booking.id} value={booking.id}>
                    <AccordionTrigger className="hover:no-underline px-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-left flex-1 mr-4 font-body">
                        <span className="font-medium text-sm">
                          {format(new Date(booking.check_in), "MMM d")} –{" "}
                          {format(new Date(booking.check_out), "MMM d, yyyy")}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {booking.guest_count} {t("concierge.bookings.guests")}
                        </span>
                        <span className="font-medium text-sm">
                          {booking.customer_name}
                        </span>
                        {booking.occasion_type && (
                          <Badge variant="secondary" className="w-fit text-xs">
                            {t(`booking.occasions.${booking.occasion_type}`)}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2">
                      <div className="space-y-4 pt-2">
                        {/* Contact */}
                        <div className="text-sm text-muted-foreground">
                          {booking.customer_email}
                          {booking.customer_phone && ` · ${booking.customer_phone}`}
                        </div>

                        {/* Trip Plan */}
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium mb-1">
                            <ShoppingBag className="h-4 w-4" />
                            {t("admin.bookings.tripPlan")}
                          </div>
                          {services?.length ? (
                            <ul className="list-disc list-inside text-sm text-muted-foreground pl-1 space-y-0.5">
                              {services.map((name, i) => (
                                <li key={i}>{name}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              {t("admin.bookings.noServices")}
                            </p>
                          )}
                        </div>

                        {/* Timestamps */}
                        <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {t("admin.bookings.submitted")}: {submittedAt}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            {t("admin.bookings.emailSentTo", {
                              email: booking.customer_email,
                              date: submittedAt,
                            })}
                          </div>
                        </div>

                        {/* Copy button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(booking)}
                        >
                          {copiedId === booking.id ? (
                            <Check className="h-4 w-4 mr-1" />
                          ) : (
                            <Copy className="h-4 w-4 mr-1" />
                          )}
                          {t("admin.bookings.copyDetails")}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
