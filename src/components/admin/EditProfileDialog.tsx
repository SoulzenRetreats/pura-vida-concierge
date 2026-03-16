import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Pencil, Copy } from "lucide-react";
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

const LIVE_DOMAIN = "https://puravidaconcierge.co";

export function EditProfileDialog({ open, onOpenChange, user }: EditProfileDialogProps) {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useUserProfile(user?.user_id ?? "");
  const updateProfile = useUpdateProfile();

  const [firstName, setFirstName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [slug, setSlug] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [slugEditing, setSlugEditing] = useState(false);
  const [originalSlug, setOriginalSlug] = useState("");

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? "");
      setWhatsappNumber(profile.whatsapp_number ?? "");
      setSlug(profile.slug ?? "");
      setOriginalSlug(profile.slug ?? "");
      setContactEmail(profile.contact_email ?? "");
    } else {
      setFirstName("");
      setWhatsappNumber("");
      setSlug("");
      setOriginalSlug("");
      setContactEmail("");
    }
    setSlugEditing(false);
  }, [profile]);

  // Reset editing state when dialog closes
  useEffect(() => {
    if (!open) setSlugEditing(false);
  }, [open]);

  const handleSlugChange = (value: string) => {
    const slugified = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(slugified);
  };

  const fullUrl = slug ? `${LIVE_DOMAIN}/${slug}` : "";

  const handleCopyUrl = async () => {
    if (!fullUrl) return;
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success(t("admin.users.profile.urlCopied"));
    } catch {
      toast.error(t("admin.users.error"));
    }
  };

  const handleSave = () => {
    if (!user) return;
    updateProfile.mutate(
      {
        userId: user.user_id,
        firstName: firstName.trim() || null,
        whatsappNumber: whatsappNumber.trim() || null,
        slug: slug.trim() || null,
        contactEmail: contactEmail.trim() || null,
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

  const slugChanged = slugEditing && slug !== originalSlug;

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
            <div>
              <div className="flex items-center gap-2">
                <Label>{t("admin.users.profile.slug")}</Label>
                {!slugEditing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setSlugEditing(true)}
                    aria-label={t("admin.users.profile.editSlug")}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <Input
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder={t("admin.users.profile.slugPlaceholder")}
                className={`mt-1.5 ${!slugEditing ? "opacity-60" : ""}`}
                readOnly={!slugEditing}
              />
              {slugChanged && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {t("admin.users.profile.slugWarning")}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {t("admin.users.profile.slugHelp")}
              </p>
              {slug && (
                <div className="flex items-center gap-2 mt-2 p-2 rounded-md bg-muted/50">
                  <span className="text-xs text-muted-foreground font-mono truncate flex-1">
                    {fullUrl}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={handleCopyUrl}
                    aria-label={t("admin.users.profile.copyUrl")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
            <div>
              <Label>{t("admin.users.profile.contactEmail")}</Label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder={t("admin.users.profile.contactEmailPlaceholder")}
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
