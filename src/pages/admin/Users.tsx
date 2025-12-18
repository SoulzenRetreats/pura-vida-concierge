import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Users, Shield, UserMinus, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsersWithRoles, useRemoveUserRole } from "@/hooks/useUsers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export default function AdminUsers() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useUsersWithRoles();
  const removeRole = useRemoveUserRole();
  
  const [removingUser, setRemovingUser] = useState<{ userId: string; email: string; role: AppRole } | null>(null);

  const handleRemoveRole = () => {
    if (!removingUser) return;
    
    removeRole.mutate(
      { userId: removingUser.userId, role: removingUser.role },
      {
        onSuccess: () => {
          toast.success(t("admin.users.roleRemoved"));
          setRemovingUser(null);
        },
        onError: () => {
          toast.error(t("admin.users.error"));
        },
      }
    );
  };

  // Group users by user_id to show all roles
  const groupedUsers = users?.reduce((acc, user) => {
    if (!acc[user.user_id]) {
      acc[user.user_id] = {
        user_id: user.user_id,
        email: user.email,
        roles: [],
      };
    }
    acc[user.user_id].roles.push({
      role: user.role,
      created_at: user.role_created_at,
    });
    return acc;
  }, {} as Record<string, { user_id: string; email: string; roles: Array<{ role: AppRole; created_at: string }> }>);

  const userList = groupedUsers ? Object.values(groupedUsers) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold">{t("admin.users.title")}</h1>
        <p className="text-muted-foreground">{t("admin.users.description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("admin.users.userRoles")}
          </CardTitle>
          <CardDescription>{t("admin.users.userRolesDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !userList.length ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("admin.users.noUsers")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.users.columns.email")}</TableHead>
                  <TableHead>{t("admin.users.columns.roles")}</TableHead>
                  <TableHead>{t("admin.users.columns.since")}</TableHead>
                  <TableHead className="text-right">{t("admin.users.columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userList.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div className="font-medium">{user.email}</div>
                      {user.user_id === currentUser?.id && (
                        <span className="text-xs text-muted-foreground">{t("admin.users.you")}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {user.roles.map(({ role }) => (
                          <Badge
                            key={role}
                            variant={role === "admin" ? "default" : "secondary"}
                            className="gap-1"
                          >
                            {role === "admin" && <Shield className="h-3 w-3" />}
                            {t(`admin.users.roles.${role}`)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.roles[0] && format(new Date(user.roles[0].created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.roles.map(({ role }) => (
                        <Button
                          key={role}
                          variant="ghost"
                          size="sm"
                          disabled={user.user_id === currentUser?.id && role === "admin"}
                          onClick={() => setRemovingUser({ userId: user.user_id, email: user.email, role })}
                          className="text-destructive hover:text-destructive"
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          {t("admin.users.removeRole", { role: t(`admin.users.roles.${role}`) })}
                        </Button>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.users.addRoleTitle")}</CardTitle>
          <CardDescription>{t("admin.users.addRoleDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("admin.users.addRoleInstructions")}
          </p>
        </CardContent>
      </Card>

      <AlertDialog open={!!removingUser} onOpenChange={() => setRemovingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t("admin.users.removeConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.users.removeConfirm.description", {
                email: removingUser?.email,
                role: removingUser ? t(`admin.users.roles.${removingUser.role}`) : "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.users.removeConfirm.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveRole}
              disabled={removeRole.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeRole.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("admin.users.removeConfirm.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
