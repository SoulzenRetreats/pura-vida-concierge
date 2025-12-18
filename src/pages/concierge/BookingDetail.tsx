import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  Mail,
  Phone,
  Gift,
  FileText,
  Loader2,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  useBookingDetail,
  useUpdateBookingStatus,
  useUpdateBookingNotes,
  useAssignVendor,
} from "@/hooks/useBookingDetail";
import { useClaimBooking } from "@/hooks/useBookings";
import { useAuth } from "@/contexts/AuthContext";
import { BookingStatusBadge } from "@/components/concierge/BookingStatusBadge";
import { BookingStatusWorkflow } from "@/components/concierge/BookingStatusWorkflow";
import { VendorAssignment } from "@/components/concierge/VendorAssignment";
import type { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: booking, isLoading } = useBookingDetail(id || "");
  const updateStatus = useUpdateBookingStatus();
  const updateNotes = useUpdateBookingNotes();
  const assignVendor = useAssignVendor();
  const claimBooking = useClaimBooking();

  const [internalNotes, setInternalNotes] = useState<string | null>(null);

  const handleClaim = () => {
    if (!id) return;
    claimBooking.mutate(id, {
      onSuccess: () => {
        toast({
          title: t("concierge.bookings.claimSuccess"),
          description: t("concierge.bookings.claimSuccessDescription"),
        });
      },
      onError: () => {
        toast({
          title: t("concierge.bookings.claimError"),
          variant: "destructive",
        });
      },
    });
  };

  const handleStatusChange = (newStatus: BookingStatus) => {
    if (!id) return;
    updateStatus.mutate(
      { bookingId: id, status: newStatus },
      {
        onSuccess: () => {
          toast({
            title: t("concierge.bookingDetail.statusUpdated"),
            description: t(`concierge.bookings.statuses.${newStatus}`),
          });
        },
        onError: () => {
          toast({
            title: t("concierge.bookingDetail.error"),
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleNotesBlur = () => {
    if (!id || internalNotes === null || internalNotes === booking?.internal_notes) return;
    updateNotes.mutate({ bookingId: id, internalNotes });
  };

  const handleAssignVendor = (serviceId: string, vendorId: string | null, price: number | null) => {
    if (!id) return;
    assignVendor.mutate({ bookingId: id, serviceId, vendorId, price });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("concierge.bookingDetail.notFound")}</p>
        <Button variant="link" onClick={() => navigate("/concierge/bookings")}>
          {t("concierge.bookingDetail.backToList")}
        </Button>
      </div>
    );
  }

  const displayNotes = internalNotes ?? booking.internal_notes ?? "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/concierge/bookings")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-heading font-semibold">
                {booking.customer_name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <BookingStatusBadge status={booking.status || "new_request"} />
                {booking.assigned_to === user?.id ? (
                  <Badge variant="secondary" className="gap-1">
                    <UserCheck className="h-3 w-3" />
                    {t("concierge.bookings.assignedToYou")}
                  </Badge>
                ) : booking.assigned_to ? (
                  <Badge variant="outline" className="gap-1">
                    <UserCheck className="h-3 w-3" />
                    {t("concierge.bookings.assigned")}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    {t("concierge.bookings.unassigned")}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!booking.assigned_to && (
              <Button
                variant="outline"
                onClick={handleClaim}
                disabled={claimBooking.isPending}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {t("concierge.bookings.claim")}
              </Button>
            )}
            <BookingStatusWorkflow
              currentStatus={booking.status || "new_request"}
              onStatusChange={handleStatusChange}
              isUpdating={updateStatus.isPending}
            />
          </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              {t("concierge.bookingDetail.customer.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${booking.customer_email}`} className="hover:underline">
                {booking.customer_email}
              </a>
            </div>
            {booking.customer_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${booking.customer_phone}`} className="hover:underline">
                  {booking.customer_phone}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                {booking.guest_count} {t("concierge.bookings.guests")}
              </span>
            </div>
            {booking.occasion_type && (
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-muted-foreground" />
                <span>{t(`booking.occasions.${booking.occasion_type}`)}</span>
              </div>
            )}
            {booking.dietary_preferences && (
              <div className="pt-2 border-t">
                <p className="text-sm font-medium mb-1">
                  {t("concierge.bookingDetail.customer.dietary")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {booking.dietary_preferences}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stay Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              {t("concierge.bookingDetail.stay.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(booking.check_in), "MMM d, yyyy")} -{" "}
                {format(new Date(booking.check_out), "MMM d, yyyy")}
              </span>
            </div>
            {booking.properties ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{booking.properties.name}</span>
              </div>
            ) : booking.location_details ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{booking.location_details}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{t("concierge.bookingDetail.stay.needsRecommendation")}</span>
              </div>
            )}
            {booking.budget_range && (
              <div className="pt-2 border-t">
                <p className="text-sm font-medium mb-1">
                  {t("concierge.bookingDetail.stay.budget")}
                </p>
                <p className="text-sm text-muted-foreground">{booking.budget_range}</p>
              </div>
            )}
            {booking.vibe_preferences && (
              <div className="pt-2 border-t">
                <p className="text-sm font-medium mb-1">
                  {t("concierge.bookingDetail.stay.vibe")}
                </p>
                <p className="text-sm text-muted-foreground">{booking.vibe_preferences}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vendor Assignment */}
        <VendorAssignment
          bookingServices={booking.booking_services || []}
          onAssign={handleAssignVendor}
        />

        {/* Internal Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              {t("concierge.bookingDetail.notes.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={t("concierge.bookingDetail.notes.placeholder")}
              value={displayNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              onBlur={handleNotesBlur}
              rows={4}
            />
            {updateNotes.isPending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                {t("concierge.bookingDetail.notes.saving")}
              </div>
            )}
            {booking.special_notes && (
              <div className="pt-2 border-t">
                <p className="text-sm font-medium mb-1">
                  {t("concierge.bookingDetail.notes.customerNotes")}
                </p>
                <p className="text-sm text-muted-foreground">{booking.special_notes}</p>
              </div>
            )}
            {booking.surprise_elements && (
              <div className="pt-2 border-t">
                <p className="text-sm font-medium mb-1">
                  {t("concierge.bookingDetail.notes.surpriseElements")}
                </p>
                <p className="text-sm text-muted-foreground">{booking.surprise_elements}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
