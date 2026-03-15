import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, ClipboardList, Users, Settings, UserCog, Package, Home, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { key: "dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { key: "bookings", path: "/admin/bookings", icon: ClipboardList },
  { key: "properties", path: "/admin/properties", icon: Home },
  { key: "vendors", path: "/admin/vendors", icon: Users },
  { key: "services", path: "/admin/services", icon: Package },
  { key: "categories", path: "/admin/categories", icon: Tags },
  
  { key: "users", path: "/admin/users", icon: UserCog },
  { key: "settings", path: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();

  const currentPath = location.pathname;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading font-semibold text-sm">
            PV
          </div>
          <span className="font-heading font-semibold text-lg group-data-[collapsible=icon]:hidden">
            {t("admin.sidebar.title")}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("admin.sidebar.menu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath === item.path || currentPath.startsWith(item.path + "/")}
                    tooltip={t(`admin.sidebar.${item.key}`)}
                  >
                    <button onClick={() => navigate(item.path)}>
                      <item.icon className="h-4 w-4" />
                      <span>{t(`admin.sidebar.${item.key}`)}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t space-y-2">
        <div className="flex justify-center group-data-[collapsible=icon]:px-0 px-2">
          <LanguageToggle variant="full" className="w-full group-data-[collapsible=icon]:w-auto" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
