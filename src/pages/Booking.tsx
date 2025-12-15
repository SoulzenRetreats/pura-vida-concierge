import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, Users, Home, Sparkles, Check, Loader2, DollarSign, MapPin, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const bookingSchema = z.object({
  customerName: z.string().trim().min(1, "Name is required").max(100),
  customerEmail: z.string().trim().email("Invalid email").max(255),
  customerPhone: z.string().trim().max(20).optional(),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  guestCount: z.number().min(1, "At least 1 guest required").max(100),
  budgetRange: z.string().min(1, "Budget range is required"),
  serviceDates: z.string().min(1, "Service dates are required"),
  locationDetails: z.string().min(1, "Location is required").max(500),
  specialNotes: z.string().max(1000).optional(),
});

const BUDGET_RANGES = [
  "$1,000 - $2,500",
  "$2,500 - $5,000",
  "$5,000 - $10,000",
  "$10,000 - $25,000",
  "$25,000+",
];

const OCCASION_TYPES = [
  "birthday",
  "anniversary",
  "bachelor",
  "bachelorette",
  "wedding",
  "family_trip",
  "corporate",
  "celebration",
  "other",
];

const PREFERRED_TIMES = [
  "morning",
  "afternoon",
  "evening",
  "flexible",
];

const VIBE_OPTIONS = [
  "relaxed",
  "adventurous",
  "romantic",
  "party",
  "wellness",
  "cultural",
];

const Booking = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Dates & Budget
    checkIn: "",
    checkOut: "",
    guestCount: 4,
    budgetRange: "",
    serviceDates: "",
    preferredTime: "",
    // Step 2: Property & Location
    propertyId: searchParams.get("property") || "",
    needHelp: false,
    locationDetails: "",
    // Step 3: Occasion & Preferences
    occasionType: "",
    dietaryPreferences: "",
    vibePreferences: [] as string[],
    surpriseElements: "",
    // Step 4: Services
    selectedServices: [] as string[],
    // Step 5: Contact
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    specialNotes: "",
    honeypot: "",
  });

  useEffect(() => {
    fetchProperties();
    fetchServices();
  }, []);

  const fetchProperties = async () => {
    const { data } = await supabase.from("properties").select("*");
    setProperties(data || []);
  };

  const fetchServices = async () => {
    const { data } = await supabase.from("services").select("*");
    setServices(data || []);
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter((id) => id !== serviceId)
        : [...prev.selectedServices, serviceId],
    }));
  };

  const handleVibeToggle = (vibe: string) => {
    setFormData((prev) => ({
      ...prev,
      vibePreferences: prev.vibePreferences.includes(vibe)
        ? prev.vibePreferences.filter((v) => v !== vibe)
        : [...prev.vibePreferences, vibe],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validate form data client-side first
      const validatedData = bookingSchema.parse({
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guestCount: formData.guestCount,
        budgetRange: formData.budgetRange,
        serviceDates: formData.serviceDates,
        locationDetails: formData.locationDetails,
        specialNotes: formData.specialNotes,
      });

      // Submit via rate-limited edge function
      const response = await supabase.functions.invoke("submit-booking", {
        body: {
          customerName: validatedData.customerName,
          customerEmail: validatedData.customerEmail,
          customerPhone: validatedData.customerPhone || null,
          checkIn: validatedData.checkIn,
          checkOut: validatedData.checkOut,
          guestCount: validatedData.guestCount,
          budgetRange: validatedData.budgetRange,
          serviceDates: validatedData.serviceDates,
          preferredTime: formData.preferredTime || null,
          locationDetails: validatedData.locationDetails,
          occasionType: formData.occasionType || null,
          dietaryPreferences: formData.dietaryPreferences || null,
          vibePreferences: formData.vibePreferences.join(", ") || null,
          surpriseElements: formData.surpriseElements || null,
          specialNotes: validatedData.specialNotes || null,
          propertyId: formData.propertyId || null,
          selectedServices: formData.selectedServices,
          honeypot: formData.honeypot,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to submit booking");
      }

      const data = response.data;

      if (data.error) {
        if (data.code === "RATE_LIMIT_EXCEEDED") {
          toast.error(t('booking.messages.rateLimited') || "Too many requests. Please try again later.");
        } else {
          toast.error(data.error);
        }
        return;
      }

      toast.success(t('booking.messages.success'));

      // Reset and navigate
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting booking:", error);
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast.error(firstError?.message || t('booking.messages.error'));
      } else {
        toast.error(t('booking.messages.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const canProceedToNextStep = () => {
    switch (step) {
      case 1:
        return formData.checkIn && formData.checkOut && formData.guestCount >= 1 && formData.budgetRange && formData.serviceDates;
      case 2:
        return formData.locationDetails || formData.needHelp;
      case 3:
        return true; // Optional step
      case 4:
        return true; // Optional step
      case 5:
        return formData.customerName && formData.customerEmail;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                {t('booking.steps.dates')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="checkIn">{t('booking.step1.checkIn')}</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) =>
                      setFormData({ ...formData, checkIn: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut">{t('booking.step1.checkOut')}</Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) =>
                      setFormData({ ...formData, checkOut: e.target.value })
                    }
                    min={formData.checkIn || new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="guestCount">{t('booking.step1.guests')} *</Label>
                  <Input
                    id="guestCount"
                    type="number"
                    min="1"
                    value={formData.guestCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guestCount: parseInt(e.target.value) || 1,
                      })
                    }
                    placeholder={t('booking.step1.guestsPlaceholder')}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="budgetRange">{t('booking.step1.budget')} *</Label>
                  <Select
                    value={formData.budgetRange}
                    onValueChange={(value) => setFormData({ ...formData, budgetRange: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('booking.step1.budgetPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGET_RANGES.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="serviceDates">{t('booking.step1.serviceDates')} *</Label>
                  <Input
                    id="serviceDates"
                    type="text"
                    value={formData.serviceDates}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceDates: e.target.value })
                    }
                    placeholder={t('booking.step1.serviceDatesPlaceholder')}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="preferredTime">{t('booking.step1.preferredTime')}</Label>
                  <Select
                    value={formData.preferredTime}
                    onValueChange={(value) => setFormData({ ...formData, preferredTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('booking.step1.preferredTimePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {PREFERRED_TIMES.map((time) => (
                        <SelectItem key={time} value={time}>
                          {t(`booking.preferredTimes.${time}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                {t('booking.step2.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="locationDetails">{t('booking.step2.location')} *</Label>
                <Textarea
                  id="locationDetails"
                  value={formData.locationDetails}
                  onChange={(e) =>
                    setFormData({ ...formData, locationDetails: e.target.value })
                  }
                  placeholder={t('booking.step2.locationPlaceholder')}
                  rows={3}
                  maxLength={500}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {t('booking.step2.locationHint')}
                </p>
              </div>

              <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted transition-smooth">
                <Checkbox
                  id="needHelp"
                  checked={formData.needHelp}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, needHelp: checked as boolean })
                  }
                />
                <Label htmlFor="needHelp" className="cursor-pointer flex-1">
                  {t('booking.step2.needHelp')}
                </Label>
              </div>

              {!formData.needHelp && properties.length > 0 && (
                <>
                  <div className="text-sm text-muted-foreground">
                    {t('booking.step2.orSelectProperty')}
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {properties.map((property) => (
                      <div
                        key={property.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-smooth ${
                          formData.propertyId === property.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted"
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, propertyId: property.id })
                        }
                      >
                        <div className="flex items-start gap-4">
                          {property.photos?.[0] && (
                            <img
                              src={property.photos[0]}
                              alt={property.name}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{property.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {t('booking.step2.sleeps', { count: property.sleeps })} · {t('booking.step2.bedrooms', { count: property.bedrooms })} · {t('booking.step2.bathrooms', { count: property.bathrooms })}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {property.description}
                            </p>
                          </div>
                          {formData.propertyId === property.id && (
                            <Check className="w-6 h-6 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                {t('booking.step3.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="occasionType">{t('booking.step3.occasion')}</Label>
                <Select
                  value={formData.occasionType}
                  onValueChange={(value) => setFormData({ ...formData, occasionType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('booking.step3.occasionPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {OCCASION_TYPES.map((occasion) => (
                      <SelectItem key={occasion} value={occasion}>
                        {t(`booking.occasions.${occasion}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('booking.step3.vibe')}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {VIBE_OPTIONS.map((vibe) => (
                    <div
                      key={vibe}
                      className={`p-3 border rounded-lg cursor-pointer text-center transition-smooth ${
                        formData.vibePreferences.includes(vibe)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => handleVibeToggle(vibe)}
                    >
                      <span className="text-sm">{t(`booking.vibes.${vibe}`)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="dietaryPreferences">{t('booking.step3.dietary')}</Label>
                <Textarea
                  id="dietaryPreferences"
                  value={formData.dietaryPreferences}
                  onChange={(e) =>
                    setFormData({ ...formData, dietaryPreferences: e.target.value })
                  }
                  placeholder={t('booking.step3.dietaryPlaceholder')}
                  rows={2}
                  maxLength={500}
                />
              </div>

              <div>
                <Label htmlFor="surpriseElements">{t('booking.step3.surprises')}</Label>
                <Textarea
                  id="surpriseElements"
                  value={formData.surpriseElements}
                  onChange={(e) =>
                    setFormData({ ...formData, surpriseElements: e.target.value })
                  }
                  placeholder={t('booking.step3.surprisesPlaceholder')}
                  rows={2}
                  maxLength={500}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                {t('booking.step4.title')} {t('booking.step4.optional')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-smooth ${
                      formData.selectedServices.includes(service.id)
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => handleServiceToggle(service.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{service.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {service.description}
                        </p>
                        {service.price_range && (
                          <p className="text-sm font-medium text-accent">
                            {t('booking.step4.priceRange', { range: service.price_range })}
                          </p>
                        )}
                      </div>
                      <Checkbox
                        checked={formData.selectedServices.includes(service.id)}
                        className="ml-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                {t('booking.step5.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">{t('booking.step5.name')} *</Label>
                <Input
                  id="name"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  placeholder={t('booking.step5.namePlaceholder')}
                  required
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="email">{t('booking.step5.email')} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, customerEmail: e.target.value })
                  }
                  placeholder={t('booking.step5.emailPlaceholder')}
                  required
                  maxLength={255}
                />
              </div>
              <div>
                <Label htmlFor="phone">{t('booking.step5.phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  placeholder={t('booking.step5.phonePlaceholder')}
                  maxLength={20}
                />
              </div>
              <div>
                <Label htmlFor="notes">{t('booking.step5.notes')}</Label>
                <Textarea
                  id="notes"
                  value={formData.specialNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, specialNotes: e.target.value })
                  }
                  rows={4}
                  maxLength={1000}
                  placeholder={t('booking.step5.notesPlaceholder')}
                />
              </div>
              {/* Honeypot field - hidden from users, bots will fill it */}
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <Input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.honeypot}
                  onChange={(e) =>
                    setFormData({ ...formData, honeypot: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const stepLabels = [
    t('booking.steps.dates'),
    t('booking.steps.location'),
    t('booking.steps.preferences'),
    t('booking.steps.services'),
    t('booking.steps.contact'),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
              {t('booking.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('booking.stepOf', { current: step, total: 5 })} - {stepLabels[step - 1]}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-12">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-smooth ${
                    s === step
                      ? "bg-primary text-primary-foreground"
                      : s < step
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 5 && (
                  <div
                    className={`w-12 h-1 mx-1 transition-smooth ${
                      s < step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="mb-8">{renderStep()}</div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1 || loading}
            >
              {t('booking.buttons.back')}
            </Button>
            {step < 5 ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="gradient-secondary"
                disabled={loading || !canProceedToNextStep()}
              >
                {t('booking.buttons.next')}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="gradient-secondary"
                disabled={loading || !canProceedToNextStep()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('booking.buttons.submitting')}
                  </>
                ) : (
                  t('booking.buttons.submit')
                )}
              </Button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Booking;
