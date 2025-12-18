import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Mail, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInviteUser } from "@/hooks/useUsers";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteUserDialog({ open, onOpenChange }: InviteUserDialogProps) {
  const { t } = useTranslation();
  const inviteUser = useInviteUser();
  
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("staff");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error(t("admin.users.invite.emailRequired"));
      return;
    }

    inviteUser.mutate(
      { email: email.trim(), role, notes: notes.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(t("admin.users.invite.success", { email }));
          setEmail("");
          setRole("staff");
          setNotes("");
          onOpenChange(false);
        },
        onError: (error: Error) => {
          toast.error(error.message || t("admin.users.error"));
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {t("admin.users.invite.title")}
          </DialogTitle>
          <DialogDescription>
            {t("admin.users.invite.description")}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("admin.users.invite.email")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={t("admin.users.invite.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{t("admin.users.invite.role")}</Label>
            <Select value={role} onValueChange={(value: AppRole) => setRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{t("admin.users.roles.admin")}</SelectItem>
                <SelectItem value="staff">{t("admin.users.roles.staff")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("admin.users.invite.notes")}</Label>
            <Textarea
              id="notes"
              placeholder={t("admin.users.invite.notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("admin.users.invite.cancel")}
            </Button>
            <Button type="submit" disabled={inviteUser.isPending}>
              {inviteUser.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("admin.users.invite.send")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
