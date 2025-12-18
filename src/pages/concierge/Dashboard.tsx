import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ClipboardList, Users, TrendingUp } from "lucide-react";
import { useBookingCounts } from "@/hooks/useBookings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function ConciergeDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: bookingCounts } = useBookingCounts();

  const { data: vendorCount } = useQuery({
    queryKey: ["vendor-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("vendors")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const pendingCount = (bookingCounts?.new_request || 0) + (bookingCounts?.in_review || 0);
  const upcomingCount = (bookingCounts?.quote_sent || 0) + (bookingCounts?.confirmed || 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold">
          {t("concierge.dashboard.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("concierge.dashboard.welcomeDescription")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/concierge/bookings")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("concierge.dashboard.pendingRequests")}
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              {t("concierge.dashboard.pendingDescription")}
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/concierge/bookings")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("concierge.dashboard.upcomingBookings")}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground">
              {t("concierge.dashboard.upcomingDescription")}
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/concierge/vendors")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("concierge.dashboard.activeVendors")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("concierge.dashboard.vendorsDescription")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("concierge.dashboard.completedBookings")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingCounts?.completed || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("concierge.dashboard.completedDescription")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("concierge.dashboard.welcome")}</CardTitle>
          <CardDescription>{t("concierge.dashboard.placeholder")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t("concierge.dashboard.gettingStarted")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
