import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format, isPast } from "date-fns";
import { 
  Users, 
  Shield, 
  Loader2, 
  AlertTriangle, 
  UserPlus, 
  Clock, 
  XCircle,
  Mail,
  MoreHorizontal
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useAllUsersWithRoles,
  useRemoveUserRole, 
  usePendingInvitations,
  useRevokeInvitation,
  type MergedUser
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
  const { data: mergedUsers, isLoading } = useAllUsersWithRoles();
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

  const canRemoveRole = (userId: string, role: AppRole) => {
    // Cannot remove own admin role
    return !(userId === currentUser?.id && role === "admin");
  };

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

      {/* All Users Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("admin.users.allUsers")}
          </CardTitle>
          <CardDescription>{t("admin.users.allUsersDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !mergedUsers.length ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("admin.users.noUsers")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.users.columns.email")}</TableHead>
                  <TableHead>{t("admin.users.columns.role")}</TableHead>
                  <TableHead>{t("admin.users.columns.joined")}</TableHead>
                  <TableHead className="text-right">{t("admin.users.columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mergedUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div className="font-medium">
                        {user.email}
                        {user.user_id === currentUser?.id && (
                          <span className="text-xs text-muted-foreground ml-1">{t("admin.users.you")}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.roles.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                          {user.roles.map((role) => (
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
                      ) : (
                        <span className="text-muted-foreground text-sm">{t("admin.users.noRole")}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.roles.length === 0 ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setAddRoleUser({
                            user_id: user.user_id,
                            email: user.email,
                            existingRoles: [],
                          })}
                        >
                          {t("admin.users.assignRole")}
                        </Button>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setAddRoleUser({
                                user_id: user.user_id,
                                email: user.email,
                                existingRoles: user.roles,
                              })}
                            >
                              {t("admin.users.addRoleBtn")}
                            </DropdownMenuItem>
                            {user.roles.map((role) => (
                              <DropdownMenuItem
                                key={role}
                                disabled={!canRemoveRole(user.user_id, role)}
                                className="text-destructive focus:text-destructive"
                                onClick={() => setRemovingUser({ userId: user.user_id, email: user.email, role })}
                              >
                                {t("admin.users.removeRole", { role: t(`admin.users.roles.${role}`) })}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
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
