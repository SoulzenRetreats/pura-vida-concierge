import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Users, Sparkles, ArrowLeft, ArrowRight, Loader2, Minus, Plus, MapPin, Hotel } from "lucide-react";

const bookingSchema = z.object({
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  adults: z.number().min(1, "At least 1 adult required"),
  kids: z.number().min(0),
  tripFocus: z.string().min(1, "Please select your trip focus"),
  accommodationStatus: z.string().min(1, "Please select accommodation status"),
  stayingLocation: z.string().optional(),
  vibePreferences: z.array(z.string()),
  vision: z.string().optional(),
  customerName: z.string().min(1, "Name is required").max(100),
  customerEmail: z.string().email("Invalid email").max(255),
  customerPhone: z.string().optional(),
});

const TRIP_FOCUS_OPTIONS = [
  { value: "activities", labelKey: "tripFocusOptions.activities" },
  { value: "standard", labelKey: "tripFocusOptions.standard" },
  { value: "premiere", labelKey: "tripFocusOptions.premiere" },
  { value: "ultraluxe", labelKey: "tripFocusOptions.ultraluxe" },
];

const ACCOMMODATION_OPTIONS = [
  { value: "have_place", labelKey: "accommodationOptions.havePlace" },
  { value: "need_recommendations", labelKey: "accommodationOptions.needRecommendations" },
];

const VIBE_OPTIONS = [
  "relaxing",
  "adventure", 
  "gastronomy",
  "family",
  "nature",
  "spa",
  "party",
];

const Booking = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    adults: 2,
    kids: 0,
    tripFocus: "",
    accommodationStatus: "",
    stayingLocation: "",
    vibePreferences: [] as string[],
    vision: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    honeypot: "",
  });

  const handleVibeToggle = (vibe: string) => {
    setFormData((prev) => ({
      ...prev,
      vibePreferences: prev.vibePreferences.includes(vibe)
        ? prev.vibePreferences.filter((v) => v !== vibe)
        : [...prev.vibePreferences, vibe],
    }));
  };

  const handleGuestChange = (type: "adults" | "kids", delta: number) => {
    setFormData((prev) => ({
      ...prev,
      [type]: Math.max(type === "adults" ? 1 : 0, prev[type] + delta),
    }));
  };

  const canProceedToStep2 = () => {
    return (
      formData.checkIn &&
      formData.checkOut &&
      formData.tripFocus &&
      formData.accommodationStatus &&
      (formData.accommodationStatus !== "have_place" || formData.stayingLocation.trim())
    );
  };

  const handleSubmit = async () => {
    try {
      const validated = bookingSchema.parse(formData);
      
      if (formData.accommodationStatus === "have_place" && !formData.stayingLocation.trim()) {
        toast({
          title: t("booking.error.title"),
          description: t("booking.validation.locationRequired"),
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      // Map trip focus to budget range label
      const tripFocusLabel = t(`booking.${TRIP_FOCUS_OPTIONS.find(o => o.value === formData.tripFocus)?.labelKey}`);
      
      // Map accommodation status to location details
      const locationDetails = formData.accommodationStatus === "have_place" 
        ? formData.stayingLocation 
        : t("booking.step1.curatedBadge");

      const { data, error } = await supabase.functions.invoke("submit-booking", {
        body: {
          customerName: validated.customerName,
          customerEmail: validated.customerEmail,
          customerPhone: validated.customerPhone || null,
          checkIn: validated.checkIn,
          checkOut: validated.checkOut,
          guestCount: validated.adults + validated.kids,
          budgetRange: tripFocusLabel,
          serviceDates: `${validated.checkIn} to ${validated.checkOut}`,
          preferredTime: null,
          locationDetails: locationDetails,
          occasionType: null,
          dietaryPreferences: null,
          vibePreferences: validated.vibePreferences.map(v => t(`booking.vibes.${v}`)).join(", "),
          surpriseElements: null,
          specialNotes: validated.vision || null,
          propertyId: null,
          selectedServices: [],
          honeypot: formData.honeypot,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: t("booking.success.title"),
          description: t("booking.success.message"),
        });
        // Reset form
        setFormData({
          checkIn: "",
          checkOut: "",
          adults: 2,
          kids: 0,
          tripFocus: "",
          accommodationStatus: "",
          stayingLocation: "",
          vibePreferences: [],
          vision: "",
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          honeypot: "",
        });
        setStep(1);
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

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Dates Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            {t("booking.step1.dates")}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Guests Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            {t("booking.step1.guests")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                {t("booking.step1.adults")}
              </label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => handleGuestChange("adults", -1)}
                  disabled={formData.adults <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-2xl font-semibold w-8 text-center">
                  {formData.adults}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => handleGuestChange("adults", 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                {t("booking.step1.kids")}
              </label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => handleGuestChange("kids", -1)}
                  disabled={formData.kids <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-2xl font-semibold w-8 text-center">
                  {formData.kids}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => handleGuestChange("kids", 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trip Focus Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            {t("booking.step1.tripFocus")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={formData.tripFocus}
            onValueChange={(value) => setFormData({ ...formData, tripFocus: value })}
          >
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder={t("booking.step1.tripFocusPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {TRIP_FOCUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="py-3">
                  {t(`booking.${option.labelKey}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Accommodation Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Hotel className="h-5 w-5 text-primary" />
            {t("booking.step1.accommodation")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={formData.accommodationStatus}
            onValueChange={(value) => setFormData({ ...formData, accommodationStatus: value, stayingLocation: "" })}
          >
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder={t("booking.step1.accommodationPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {ACCOMMODATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="py-3">
                  {t(`booking.${option.labelKey}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {formData.accommodationStatus === "have_place" && (
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                {t("booking.step1.stayingLocation")}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={formData.stayingLocation}
                  onChange={(e) => setFormData({ ...formData, stayingLocation: e.target.value })}
                  placeholder={t("booking.step1.stayingLocationPlaceholder")}
                  className="h-12 pl-10 text-base"
                />
              </div>
            </div>
          )}

          {formData.accommodationStatus === "need_recommendations" && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
              <Hotel className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">
                {t("booking.step1.curatedBadge")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Vibe Tags Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("booking.step2.vibeTitle")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("booking.step2.vibeHint")}</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {VIBE_OPTIONS.map((vibe) => (
              <button
                key={vibe}
                type="button"
                onClick={() => handleVibeToggle(vibe)}
                className={`px-5 py-3 rounded-full text-sm font-medium transition-all min-h-[48px] ${
                  formData.vibePreferences.includes(vibe)
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t(`booking.vibes.${vibe}`)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vision Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("booking.step2.visionTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.vision}
            onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
            placeholder={t("booking.step2.visionPlaceholder")}
            className="min-h-[120px] text-base resize-none"
          />
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("booking.step2.contactTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">
              {t("booking.step2.name")} *
            </label>
            <Input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder={t("booking.step2.namePlaceholder")}
              className="h-12 text-base"
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">
              {t("booking.step2.email")} *
            </label>
            <Input
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              placeholder={t("booking.step2.emailPlaceholder")}
              className="h-12 text-base"
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">
              {t("booking.step2.whatsapp")}
            </label>
            <Input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              placeholder={t("booking.step2.whatsappPlaceholder")}
              className="h-12 text-base"
            />
          </div>
          {/* Honeypot field */}
          <input
            type="text"
            name="website"
            value={formData.honeypot}
            onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
            className="absolute opacity-0 pointer-events-none"
            tabIndex={-1}
            autoComplete="off"
          />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t("booking.title")}
            </h1>
            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className={`h-2.5 w-2.5 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
              <div className={`h-2.5 w-2.5 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t("booking.stepOf", { current: step, total: 2 })}
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={(e) => e.preventDefault()}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 h-12"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("booking.buttons.back")}
                </Button>
              )}

              {step === 1 && (
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!canProceedToStep2()}
                  className="flex-1 h-12"
                >
                  {t("booking.buttons.next")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}

              {step === 2 && (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !formData.customerName || !formData.customerEmail}
                  className="flex-1 h-12"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("booking.buttons.submitting")}
                    </>
                  ) : (
                    t("booking.buttons.submit")
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Booking;
