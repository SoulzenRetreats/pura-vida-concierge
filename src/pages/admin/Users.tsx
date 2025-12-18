import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format, isPast } from "date-fns";
import { 
  Users, 
  Shield, 
  UserMinus, 
  Loader2, 
  AlertTriangle, 
  UserPlus, 
  Clock, 
  XCircle,
  Mail,
  Plus
} from "lucide-react";
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
import { 
  useUsersWithRoles, 
  useRemoveUserRole, 
  usePendingInvitations,
  useRevokeInvitation,
  useAllUsers
} from "@/hooks/useUsers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { InviteUserDialog } from "@/components/admin/InviteUserDialog";
import { AddRoleDialog } from "@/components/admin/AddRoleDialog";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export default function AdminUsers() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useUsersWithRoles();
  const { data: allUsers, isLoading: isLoadingAllUsers } = useAllUsers();
  const { data: pendingInvitations, isLoading: isLoadingInvitations } = usePendingInvitations();
  const removeRole = useRemoveUserRole();
  const revokeInvitation = useRevokeInvitation();
  
  const [removingUser, setRemovingUser] = useState<{ userId: string; email: string; role: AppRole } | null>(null);
  const [revokingInvitation, setRevokingInvitation] = useState<{ id: string; email: string } | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [addRoleUser, setAddRoleUser] = useState<{ user_id: string; email: string; existingRoles: AppRole[] } | null>(null);

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

  const handleRevokeInvitation = () => {
    if (!revokingInvitation) return;
    
    revokeInvitation.mutate(revokingInvitation.id, {
      onSuccess: () => {
        toast.success(t("admin.users.invitations.revoked"));
        setRevokingInvitation(null);
      },
      onError: () => {
        toast.error(t("admin.users.error"));
      },
    });
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
  
  // Find users without any roles
  const userIdsWithRoles = new Set(userList.map(u => u.user_id));
  const usersWithoutRoles = allUsers?.filter(u => !userIdsWithRoles.has(u.user_id)) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold">{t("admin.users.title")}</h1>
          <p className="text-muted-foreground">{t("admin.users.description")}</p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          {t("admin.users.inviteUser")}
        </Button>
      </div>

      {/* User Roles Card */}
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
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAddRoleUser({
                            user_id: user.user_id,
                            email: user.email,
                            existingRoles: user.roles.map(r => r.role),
                          })}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {t("admin.users.addRoleBtn")}
                        </Button>
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Users Without Roles Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {t("admin.users.usersWithoutRoles")}
          </CardTitle>
          <CardDescription>{t("admin.users.usersWithoutRolesDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingAllUsers ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !usersWithoutRoles.length ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("admin.users.noUsersWithoutRoles")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.users.columns.email")}</TableHead>
                  <TableHead>{t("admin.users.columns.since")}</TableHead>
                  <TableHead className="text-right">{t("admin.users.columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersWithoutRoles.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div className="font-medium">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddRoleUser({
                          user_id: user.user_id,
                          email: user.email,
                          existingRoles: [],
                        })}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {t("admin.users.assignRole")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t("admin.users.invitations.title")}
          </CardTitle>
          <CardDescription>{t("admin.users.invitations.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingInvitations ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !pendingInvitations?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("admin.users.invitations.none")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.users.invitations.columns.email")}</TableHead>
                  <TableHead>{t("admin.users.invitations.columns.role")}</TableHead>
                  <TableHead>{t("admin.users.invitations.columns.notes")}</TableHead>
                  <TableHead>{t("admin.users.invitations.columns.sent")}</TableHead>
                  <TableHead>{t("admin.users.invitations.columns.expires")}</TableHead>
                  <TableHead className="text-right">{t("admin.users.invitations.columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvitations.map((invitation) => {
                  const isExpired = isPast(new Date(invitation.expires_at));
                  return (
                    <TableRow key={invitation.id} className={isExpired ? "opacity-60" : ""}>
                      <TableCell>
                        <div className="font-medium">{invitation.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={invitation.role === "admin" ? "default" : "secondary"}>
                          {t(`admin.users.roles.${invitation.role}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {invitation.notes || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(invitation.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {isExpired ? (
                            <Badge variant="destructive" className="gap-1">
                              <Clock className="h-3 w-3" />
                              {t("admin.users.invitations.expired")}
                            </Badge>
                          ) : (
                            <span className="text-sm">
                              {format(new Date(invitation.expires_at), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRevokingInvitation({ id: invitation.id, email: invitation.email })}
                          className="text-destructive hover:text-destructive"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {t("admin.users.invitations.revoke")}
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

      {/* Invite User Dialog */}
      <InviteUserDialog 
        open={inviteDialogOpen} 
        onOpenChange={setInviteDialogOpen} 
      />

      {/* Add Role Dialog */}
      <AddRoleDialog
        open={!!addRoleUser}
        onOpenChange={(open) => !open && setAddRoleUser(null)}
        user={addRoleUser}
      />

      {/* Remove Role Confirmation */}
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

      {/* Revoke Invitation Confirmation */}
      <AlertDialog open={!!revokingInvitation} onOpenChange={() => setRevokingInvitation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t("admin.users.invitations.revokeConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.users.invitations.revokeConfirm.description", {
                email: revokingInvitation?.email,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.users.invitations.revokeConfirm.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeInvitation}
              disabled={revokeInvitation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revokeInvitation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("admin.users.invitations.revokeConfirm.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
