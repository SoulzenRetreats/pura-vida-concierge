import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Building, Users, DollarSign, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { t } = useTranslation();

  // Fetch stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const [bookingsRes, propertiesRes, vendorsRes, revenueRes] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact" }),
        supabase.from("properties").select("id", { count: "exact" }),
        supabase.from("vendors").select("id", { count: "exact" }),
        supabase.from("revenue_splits").select("concierge_share_amount"),
      ]);

      const totalRevenue = revenueRes.data?.reduce(
        (sum, r) => sum + (r.concierge_share_amount || 0),
        0
      ) ?? 0;

      return {
        bookings: bookingsRes.count ?? 0,
        properties: propertiesRes.count ?? 0,
        vendors: vendorsRes.count ?? 0,
        revenue: totalRevenue,
      };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold">{t("admin.dashboard.title")}</h1>
        <p className="text-muted-foreground">{t("admin.dashboard.welcomeDescription")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.dashboard.totalBookings")}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.bookings}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.dashboard.properties")}</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.properties}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.dashboard.vendors")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.vendors}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.dashboard.revenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                `$${stats?.revenue.toLocaleString()}`
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.dashboard.welcome")}</CardTitle>
          <CardDescription>{t("admin.dashboard.welcomeDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("admin.dashboard.gettingStarted")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
