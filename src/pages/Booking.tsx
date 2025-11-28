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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, Users, Home, Sparkles, Check, Loader2 } from "lucide-react";
import { z } from "zod";

const bookingSchema = z.object({
  customerName: z.string().trim().min(1, "Name is required").max(100),
  customerEmail: z.string().trim().email("Invalid email").max(255),
  customerPhone: z.string().trim().max(20).optional(),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  guestCount: z.number().min(1, "At least 1 guest required").max(100),
  specialNotes: z.string().max(1000).optional(),
});

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guestCount: 4,
    propertyId: searchParams.get("property") || "",
    needHelp: false,
    selectedServices: [] as string[],
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    specialNotes: "",
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validate form data
      const validatedData = bookingSchema.parse({
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guestCount: formData.guestCount,
        specialNotes: formData.specialNotes,
      });

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          property_id: formData.propertyId || null,
          customer_name: validatedData.customerName,
          customer_email: validatedData.customerEmail,
          customer_phone: validatedData.customerPhone || null,
          check_in: validatedData.checkIn,
          check_out: validatedData.checkOut,
          guest_count: validatedData.guestCount,
          special_notes: validatedData.specialNotes || null,
          status: "new_request",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Add selected services
      if (formData.selectedServices.length > 0 && booking) {
        const { error: servicesError } = await supabase
          .from("booking_services")
          .insert(
            formData.selectedServices.map((serviceId) => ({
              booking_id: booking.id,
              service_id: serviceId,
            }))
          );

        if (servicesError) throw servicesError;
      }

      toast.success("Booking request submitted successfully!", {
        description: "We'll be in touch within 24 hours to discuss your trip.",
      });

      // Reset and navigate
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting booking:", error);
      if (error instanceof z.ZodError) {
        toast.error("Please check your form inputs", {
          description: error.errors[0]?.message || "Invalid form data",
        });
      } else {
        toast.error("Failed to submit booking request", {
          description: "Please try again or contact us directly.",
        });
      }
    } finally {
      setLoading(false);
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
                When are you visiting?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="checkIn">Check-in Date</Label>
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
                  <Label htmlFor="checkOut">Check-out Date</Label>
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
              <div>
                <Label htmlFor="guestCount">Number of Guests</Label>
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
                  required
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-6 h-6 text-primary" />
                Choose Your Villa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted transition-smooth">
                <Checkbox
                  id="needHelp"
                  checked={formData.needHelp}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, needHelp: checked as boolean })
                  }
                />
                <Label htmlFor="needHelp" className="cursor-pointer flex-1">
                  I need help choosing the perfect property
                </Label>
              </div>

              {!formData.needHelp && (
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
                        {property.photos[0] && (
                          <img
                            src={property.photos[0]}
                            alt={property.name}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{property.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Sleeps {property.sleeps} · {property.bedrooms} Beds ·{" "}
                            {property.bathrooms} Baths
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
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Select Add-On Services
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
                            {service.price_range}
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

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Your Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  required
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, customerEmail: e.target.value })
                  }
                  required
                  maxLength={255}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  maxLength={20}
                />
              </div>
              <div>
                <Label htmlFor="notes">Special Requests or Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.specialNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, specialNotes: e.target.value })
                  }
                  rows={4}
                  maxLength={1000}
                  placeholder="Tell us about your celebration, dietary restrictions, accessibility needs, or any special requests..."
                />
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
              Plan Your Perfect Trip
            </h1>
            <p className="text-xl text-muted-foreground">
              Step {step} of 4 - {["Dates & Guests", "Villa Selection", "Add-On Services", "Contact Info"][step - 1]}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-12">
            {[1, 2, 3, 4].map((s) => (
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
                {s < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-smooth ${
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
              Back
            </Button>
            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="gradient-secondary"
                disabled={loading}
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="gradient-secondary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
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
