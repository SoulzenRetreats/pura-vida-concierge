import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LayoutDashboard, ClipboardList, Users, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { key: "dashboard", path: "/concierge/dashboard", icon: LayoutDashboard },
  { key: "bookings", path: "/concierge/bookings", icon: ClipboardList },
  { key: "vendors", path: "/concierge/vendors", icon: Users },
];

export function ConciergeSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const isAdmin = userRole === "admin";
  const currentPath = location.pathname;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading font-semibold text-sm">
            PV
          </div>
          <span className="font-heading font-semibold text-lg group-data-[collapsible=icon]:hidden">
            {t("concierge.sidebar.title")}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("concierge.sidebar.menu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath === item.path || currentPath.startsWith(item.path + "/")}
                    tooltip={t(`concierge.sidebar.${item.key}`)}
                  >
                    <button onClick={() => navigate(item.path)}>
                      <item.icon className="h-4 w-4" />
                      <span>{t(`concierge.sidebar.${item.key}`)}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start group-data-[collapsible=icon]:justify-center"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">
              {t("concierge.dashboard.backToAdmin")}
            </span>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
