import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
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
import { useUserProfile, useUpdateProfile } from "@/hooks/useProfiles";
import { toast } from "sonner";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { user_id: string; email: string } | null;
}

export function EditProfileDialog({ open, onOpenChange, user }: EditProfileDialogProps) {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useUserProfile(user?.user_id ?? "");
  const updateProfile = useUpdateProfile();

  const [firstName, setFirstName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? "");
      setWhatsappNumber(profile.whatsapp_number ?? "");
    } else {
      setFirstName("");
      setWhatsappNumber("");
    }
  }, [profile]);

  const handleSave = () => {
    if (!user) return;
    updateProfile.mutate(
      {
        userId: user.user_id,
        firstName: firstName.trim() || null,
        whatsappNumber: whatsappNumber.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success(t("admin.users.profile.updated"));
          onOpenChange(false);
        },
        onError: () => {
          toast.error(t("admin.users.error"));
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("admin.users.profile.title")}</DialogTitle>
          <DialogDescription>{user?.email}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>{t("admin.users.profile.firstName")}</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t("admin.users.profile.firstNamePlaceholder")}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>{t("admin.users.profile.whatsapp")}</Label>
              <Input
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder={t("admin.users.profile.whatsappPlaceholder")}
                className="mt-1.5"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("admin.users.profile.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={updateProfile.isPending || isLoading}>
            {updateProfile.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t("admin.users.profile.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
