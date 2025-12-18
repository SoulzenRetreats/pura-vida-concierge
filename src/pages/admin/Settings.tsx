import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppSetting, useUpdateAppSetting } from "@/hooks/useAppSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Percent } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const { t } = useTranslation();
  const { data: setting, isLoading } = useAppSetting("revenue_share_percentage");
  const updateSetting = useUpdateAppSetting();
  
  const [percentage, setPercentage] = useState("");

  useEffect(() => {
    if (setting?.value !== undefined) {
      setPercentage(String(setting.value));
    }
  }, [setting]);

  const handleSave = async () => {
    const value = parseFloat(percentage);
    if (isNaN(value) || value < 0 || value > 100) {
      toast.error(t("admin.settings.invalidPercentage"));
      return;
    }

    try {
      await updateSetting.mutateAsync({ key: "revenue_share_percentage", value });
      toast.success(t("admin.settings.saved"));
    } catch {
      toast.error(t("admin.settings.error"));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold">{t("admin.settings.title")}</h1>
        <p className="text-muted-foreground">{t("admin.settings.description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            {t("admin.settings.revenueShare.title")}
          </CardTitle>
          <CardDescription>
            {t("admin.settings.revenueShare.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="percentage">
                  {t("admin.settings.revenueShare.label")}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    className="w-32"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.settings.revenueShare.hint")}
                </p>
              </div>

              <Button 
                onClick={handleSave} 
                disabled={updateSetting.isPending}
              >
                {updateSetting.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {t("admin.settings.save")}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
