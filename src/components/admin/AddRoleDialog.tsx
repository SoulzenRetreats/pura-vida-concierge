import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddUserRole } from "@/hooks/useUsers";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface AddRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    user_id: string;
    email: string;
    existingRoles: AppRole[];
  } | null;
}

export function AddRoleDialog({ open, onOpenChange, user }: AddRoleDialogProps) {
  const { t } = useTranslation();
  const addRole = useAddUserRole();
  
  const [selectedRole, setSelectedRole] = useState<AppRole | "">("");

  // Get available roles that the user doesn't already have
  const allRoles: AppRole[] = ["admin", "staff"];
  const availableRoles = allRoles.filter(
    (role) => !user?.existingRoles.includes(role)
  );

  useEffect(() => {
    if (open && availableRoles.length > 0) {
      setSelectedRole(availableRoles[0]);
    }
  }, [open, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedRole) return;

    addRole.mutate(
      { userId: user.user_id, role: selectedRole },
      {
        onSuccess: () => {
          toast.success(t("admin.users.addRole.success", { 
            role: t(`admin.users.roles.${selectedRole}`),
            email: user.email 
          }));
          setSelectedRole("");
          onOpenChange(false);
        },
        onError: () => {
          toast.error(t("admin.users.error"));
        },
      }
    );
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t("admin.users.addRole.title")}
          </DialogTitle>
          <DialogDescription>
            {t("admin.users.addRole.description", { email: user.email })}
          </DialogDescription>
        </DialogHeader>
        
        {availableRoles.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            {t("admin.users.addRole.noRolesAvailable")}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">{t("admin.users.addRole.selectRole")}</Label>
              <Select 
                value={selectedRole} 
                onValueChange={(value: AppRole) => setSelectedRole(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("admin.users.addRole.selectRolePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {t(`admin.users.roles.${role}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("admin.users.addRole.cancel")}
              </Button>
              <Button type="submit" disabled={addRole.isPending || !selectedRole}>
                {addRole.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t("admin.users.addRole.confirm")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
