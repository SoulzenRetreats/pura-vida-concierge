import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InternationalPhoneInput, isValidPhone } from "@/components/ui/phone-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Loader2, Minus, Plus, ConciergeBell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTripPlan } from "@/contexts/TripPlanContext";

const Booking = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { clear: clearTripPlan, conciergeId, conciergeSlug } = useTripPlan();

  // Use slug from URL or fall back to context
  const activeSlug = slug || conciergeSlug;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Selected services from Trip Plan
  const serviceIds = useMemo(() => {
    const param = searchParams.get("services");
    return param ? param.split(",").filter(Boolean) : [];
  }, [searchParams]);

  const [selectedServiceNames, setSelectedServiceNames] = useState<string[]>([]);

  useEffect(() => {
    if (serviceIds.length === 0) return;
    supabase
      .from("services")
      .select("id, name_en, name_es")
      .in("id", serviceIds)
      .then(({ data }) => {
        if (data) {
          setSelectedServiceNames(
            data.map((s) =>
              i18n.language === "es" ? (s.name_es || s.name_en) : s.name_en
            )
          );
        }
      });
  }, [serviceIds, i18n.language]);

  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    adults: 2,
    kids: 0,
    vision: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    honeypot: "",
  });

  const handleGuestChange = (type: "adults" | "kids", delta: number) => {
    setFormData((prev) => ({
      ...prev,
      [type]: Math.max(type === "adults" ? 1 : 0, prev[type] + delta),
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.checkIn || !formData.checkOut) {
        toast({ title: t("booking.error.title"), description: t("booking.validation.datesRequired"), variant: "destructive" });
        return;
      }
      if (formData.adults < 1) {
        toast({ title: t("booking.error.title"), description: t("booking.validation.adultsRequired"), variant: "destructive" });
        return;
      }
      if (!formData.customerName.trim()) {
        toast({ title: t("booking.error.title"), description: t("booking.validation.nameRequired"), variant: "destructive" });
        return;
      }
      if (!formData.customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
        toast({ title: t("booking.error.title"), description: t("booking.validation.emailRequired"), variant: "destructive" });
        return;
      }

      setLoading(true);

      const { data, error } = await supabase.functions.invoke("submit-booking", {
        body: {
          customerName: formData.customerName.trim(),
          customerEmail: formData.customerEmail.trim(),
          customerPhone: formData.customerPhone.trim() || null,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          guestCount: formData.adults + formData.kids,
          budgetRange: null,
          serviceDates: `${formData.checkIn} to ${formData.checkOut}`,
          preferredTime: null,
          locationDetails: null,
          occasionType: null,
          dietaryPreferences: null,
          vibePreferences: null,
          surpriseElements: null,
          specialNotes: formData.vision.trim() || null,
          propertyId: null,
          selectedServices: serviceIds,
          honeypot: formData.honeypot,
          conciergeId: conciergeId,
        },
      });

      if (error) throw error;

      if (data?.success) {
        const serviceNames = [...selectedServiceNames];
        clearTripPlan();
        const successPath = activeSlug ? `/${activeSlug}/success` : "/success";
        navigate(successPath, { state: { serviceNames } });
      } else {
        throw new Error(data?.error || "Submission failed");
      }
    } catch (error: any) {
      console.error("Booking submission error:", error);
      toast({
        title: t("booking.error.title"),
        description: error.message || t("booking.error.message"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{t("booking.title")}</h1>
          </div>

          {/* Selected experiences from Trip Plan */}
          {selectedServiceNames.length > 0 && (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-start gap-3">
                <ConciergeBell className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-heading font-semibold text-sm mb-1">{t("tripPlan.selectedExperiences")}</p>
                  <p className="text-sm text-muted-foreground font-body">{selectedServiceNames.join(", ")}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Dates & Guests */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  {t("booking.datesAndGuests")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      {t("booking.step1.checkIn")}
                    </label>
                    <Input
                      type="date"
                      value={formData.checkIn}
                      onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      {t("booking.step1.checkOut")}
                    </label>
                    <Input
                      type="date"
                      value={formData.checkOut}
                      onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                      min={formData.checkIn || new Date().toISOString().split("T")[0]}
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      {t("booking.step1.adults")}
                    </label>
                    <div className="flex items-center gap-3">
                      <Button type="button" variant="outline" size="icon" className="h-12 w-12" onClick={() => handleGuestChange("adults", -1)} disabled={formData.adults <= 1}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-2xl font-semibold w-8 text-center">{formData.adults}</span>
                      <Button type="button" variant="outline" size="icon" className="h-12 w-12" onClick={() => handleGuestChange("adults", 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      {t("booking.step1.kids")}
                    </label>
                    <div className="flex items-center gap-3">
                      <Button type="button" variant="outline" size="icon" className="h-12 w-12" onClick={() => handleGuestChange("kids", -1)} disabled={formData.kids <= 0}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-2xl font-semibold w-8 text-center">{formData.kids}</span>
                      <Button type="button" variant="outline" size="icon" className="h-12 w-12" onClick={() => handleGuestChange("kids", 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Notes or Occasions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t("booking.specialNotesTitle")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.vision}
                  onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                  placeholder={t("booking.specialNotesPlaceholder")}
                  className="min-h-[120px] text-base resize-none"
                />
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" />
                  {t("booking.step2.contactTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">{t("booking.step2.name")} *</label>
                  <Input type="text" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} placeholder={t("booking.step2.namePlaceholder")} className="h-12 text-base" required />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">{t("booking.step2.email")} *</label>
                  <Input type="email" value={formData.customerEmail} onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })} placeholder={t("booking.step2.emailPlaceholder")} className="h-12 text-base" required />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">{t("booking.step2.whatsapp")}</label>
                  <Input type="tel" value={formData.customerPhone} onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })} placeholder={t("booking.step2.whatsappPlaceholder")} className="h-12 text-base" />
                </div>
                {/* Honeypot */}
                <input type="text" name="website" value={formData.honeypot} onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })} className="absolute opacity-0 pointer-events-none" tabIndex={-1} autoComplete="off" />
              </CardContent>
            </Card>

            {/* Submit */}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.customerName || !formData.customerEmail || !formData.checkIn || !formData.checkOut}
              className="w-full h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("booking.buttons.submitting")}
                </>
              ) : (
                t("booking.buttons.submitRequest")
              )}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Booking;
