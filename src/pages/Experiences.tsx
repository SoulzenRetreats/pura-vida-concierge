import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronLeft, ChevronRight, ChevronUp, BellRing, X, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import servicesHero from "@/assets/services-hero.jpg";
import { useCategories, getCategoryName, getCategoryNameBySlug } from "@/hooks/useCategories";
import { useTripPlan } from "@/contexts/TripPlanContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Service {
  id: string;
  name: string;
  name_en: string;
  name_es: string | null;
  category: string;
  description: string;
  description_en: string;
  description_es: string | null;
  photos: string[];
  price_min: number | null;
  price_max: number | null;
  is_for_sale: boolean;
  is_rental: boolean;
}

// Simple photo gallery component with manual navigation
function ServicePhotoGallery({ photos, serviceName }: { photos: string[]; serviceName: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length <= 1) {
    return (
      <img
        src={photos?.[0] || "/placeholder.svg"}
        alt={serviceName}
        className="w-full h-full object-cover group-hover:scale-110 transition-spring"
      />
    );
  }

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-full">
      <img
        src={photos[currentIndex] || "/placeholder.svg"}
        alt={`${serviceName} ${currentIndex + 1}`}
        className="w-full h-full object-cover group-hover:scale-110 transition-spring"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={goToPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
        aria-label="Previous photo"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
        aria-label="Next photo"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {photos.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex
                ? "bg-primary"
                : "bg-background/60 hover:bg-background/80"
            }`}
            aria-label={`Go to photo ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// Sparkling bell button with gold particle burst on activation
function SparklingBell({
  active,
  onToggle,
  ariaLabel,
}: {
  active: boolean;
  onToggle: () => void;
  ariaLabel: string;
}) {
  const [sparkling, setSparkling] = useState(false);
  const wasActive = React.useRef(active);

  const PARTICLES = 10;
  const particleOffsets = React.useMemo(
    () =>
      Array.from({ length: PARTICLES }, () => ({
        tx: `${(Math.random() - 0.5) * 120}px`,
        ty: `${(Math.random() - 0.5) * 120}px`,
        size: Math.random() > 0.5 ? "w-1.5 h-1.5" : "w-1 h-1",
        delay: `${Math.random() * 150}ms`,
      })),
    // regenerate on each burst
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sparkling],
  );

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only sparkle when adding (going from inactive → active)
    if (!active) {
      setSparkling(true);
      setTimeout(() => setSparkling(false), 500);
    }
    onToggle();
  };

  React.useEffect(() => {
    wasActive.current = active;
  }, [active]);

  return (
    <button
      onClick={handleClick}
      aria-label={ariaLabel}
      className="absolute top-4 right-4 z-10 h-11 w-11 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm transition-all hover:bg-black/30 active:scale-95"
    >
      <BellRing
        className={`h-5 w-5 transition-all ${sparkling ? "animate-bell-pulse" : ""} ${
          active
            ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
            : "text-white"
        }`}
      />
      {sparkling &&
        particleOffsets.map((offset, i) => (
          <span
            key={i}
            className={`absolute ${offset.size} rounded-full bg-amber-400 animate-sparkle-burst pointer-events-none`}
            style={
              { "--tx": offset.tx, "--ty": offset.ty, animationDelay: offset.delay } as React.CSSProperties
            }
          />
        ))}
    </button>
  );
}

function PriceDisplay({ service }: { service: Service }) {
  const { t } = useTranslation();
  if (service.price_min != null && service.price_max != null && service.price_min === service.price_max) {
    return <p className="text-lg font-semibold text-accent font-body">${service.price_min.toFixed(2)}</p>;
  }
  if (service.price_min != null && service.price_max != null) {
    return (
      <p className="text-sm font-medium text-accent font-body">
        ${service.price_min.toFixed(2)} – ${service.price_max.toFixed(2)}
      </p>
    );
  }
  if (service.price_min != null) {
    return (
      <p className="text-sm font-medium text-accent font-body">
        {t("experiences.fromPrice", { price: service.price_min.toFixed(2) })}
      </p>
    );
  }
  return null;
}

// Service detail content (shared between Dialog and Drawer)
function ServiceDetailContent({
  service,
  getLocalizedName,
  getLocalizedDescription,
}: {
  service: Service;
  getLocalizedName: (s: Service) => string;
  getLocalizedDescription: (s: Service) => string;
}) {
  const { t } = useTranslation();
  const { toggle, isInPlan } = useTripPlan();
  const inPlan = isInPlan(service.id);
  const photos = service.photos || [];

  return (
    <div className="space-y-4">
      {/* Photo gallery */}
      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {photos.map((photo, i) => (
            <img
              key={i}
              src={photo}
              alt={`${getLocalizedName(service)} ${i + 1}`}
              className="h-48 w-auto rounded-lg object-cover flex-shrink-0"
            />
          ))}
        </div>
      )}
      <p className="text-muted-foreground font-body leading-relaxed">{getLocalizedDescription(service)}</p>
      <PriceDisplay service={service} />
      <Button
        onClick={() => toggle(service.id)}
        variant={inPlan ? "secondary" : "default"}
        className="w-full h-12 gap-2"
      >
        <BellRing
          className={`h-5 w-5 ${inPlan ? "fill-amber-400 text-amber-400" : ""}`}
        />
        {inPlan ? t("tripPlan.removeFromPlan") : t("tripPlan.addToPlan")}
      </Button>
    </div>
  );
}

const Experiences = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toggle, isInPlan, planCount, planItems, remove } = useTripPlan();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const { data: categories = [] } = useCategories();

  // Detail modal/drawer
  const [detailService, setDetailService] = useState<Service | null>(null);
  // Review drawer
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    fetchServices();
  }, [filter]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      let query = supabase.from("services").select("*");
      if (filter !== "all") {
        query = query.eq("category", filter);
      }
      const { data, error } = await query;
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedName = (service: Service) => {
    if (i18n.language === "es") return service.name_es || service.name_en || service.name;
    return service.name_en || service.name;
  };

  const getLocalizedDescription = (service: Service) => {
    if (i18n.language === "es") return service.description_es || service.description_en || service.description;
    return service.description_en || service.description;
  };

  const categoryFilters = [
    { value: "all", label: t("experiences.filter.all") },
    ...categories.map((cat) => ({
      value: cat.slug,
      label: getCategoryName(cat, i18n.language),
    })),
  ];

  const plannedServices = services.filter((s) => planItems.includes(s.id));

  const handleFinalize = () => {
    setReviewOpen(false);
    navigate(`/booking?services=${planItems.join(",")}`);
  };

  // Detail view
  const detailContent = detailService ? (
    <ServiceDetailContent
      service={detailService}
      getLocalizedName={getLocalizedName}
      getLocalizedDescription={getLocalizedDescription}
    />
  ) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden mt-20">
        <div className="absolute inset-0">
          <img src={servicesHero} alt="Luxury Experiences" className="w-full h-full object-cover" />
          <div className="absolute inset-0 gradient-hero" />
        </div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl font-heading font-bold text-white mb-4">
            {t("experiences.hero")}
          </h1>
        </div>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {categoryFilters.map((category) => (
              <button
                key={category.value}
                onClick={() => setFilter(category.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-smooth ${
                  filter === category.value
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card hover:bg-muted"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-heading font-semibold mb-4">
                {t("experiences.noServices")}
              </h3>
              <p className="text-muted-foreground">
                Check back soon or contact us for custom experiences
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => {
                const inPlan = isInPlan(service.id);
                return (
                  <Card key={service.id} className="overflow-hidden hover:shadow-luxury transition-spring group">
                    <div className="relative h-56 overflow-hidden">
                      <ServicePhotoGallery photos={service.photos || []} serviceName={getLocalizedName(service)} />

                      {/* Top-left badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
                        <Badge className="gradient-secondary">
                          {getCategoryNameBySlug(categories, service.category, i18n.language)}
                        </Badge>
                        {service.is_for_sale && (
                          <Badge className="bg-accent text-accent-foreground">{t("experiences.forSale")}</Badge>
                        )}
                        {service.is_rental && (
                          <Badge variant="outline" className="bg-background/80">{t("experiences.rental")}</Badge>
                        )}
                      </div>

                      {/* Bell icon top-right */}
                      <SparklingBell
                        active={inPlan}
                        onToggle={() => toggle(service.id)}
                        ariaLabel={inPlan ? t("tripPlan.removeFromPlan") : t("tripPlan.addToPlan")}
                      />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-heading font-semibold mb-2">{getLocalizedName(service)}</h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3 font-body">{getLocalizedDescription(service)}</p>
                      <div className="flex items-center justify-between">
                        <PriceDisplay service={service} />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetailService(service)}
                          className="text-primary gap-1.5"
                        >
                          <Eye className="h-4 w-4" />
                          {t("tripPlan.moreDetails")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Sticky bottom bar */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${
          planCount > 0 ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={() => setReviewOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground shadow-luxury font-body font-medium text-sm hover:bg-primary/90 active:scale-[0.97] transition-all"
        >
          <BellRing className="h-4 w-4" />
          {t("tripPlan.servicesInPlan", { count: planCount })}
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>

      {/* Review Drawer */}
      <Drawer open={reviewOpen} onOpenChange={setReviewOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle className="font-heading">{t("tripPlan.reviewPlan")}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-2 overflow-y-auto flex-1">
            {plannedServices.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 font-body">{t("tripPlan.emptyPlan")}</p>
            ) : (
              <ul className="space-y-3">
                {plannedServices.map((service) => (
                  <li key={service.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <img
                      src={service.photos?.[0] || "/placeholder.svg"}
                      alt={getLocalizedName(service)}
                      className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-semibold text-sm truncate">{getLocalizedName(service)}</p>
                      <PriceDisplay service={service} />
                    </div>
                    <button
                      onClick={() => remove(service.id)}
                      aria-label={t("tripPlan.removeFromPlan")}
                      className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DrawerFooter>
            <Button onClick={handleFinalize} disabled={planCount === 0} className="w-full h-12">
              {t("tripPlan.finalizePlan")}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Service detail - Drawer on mobile, Dialog on desktop */}
      {isMobile ? (
        <Drawer open={!!detailService} onOpenChange={(open) => !open && setDetailService(null)}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader>
              <DrawerTitle className="font-heading">{detailService ? getLocalizedName(detailService) : ""}</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6 overflow-y-auto">{detailContent}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={!!detailService} onOpenChange={(open) => !open && setDetailService(null)}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">{detailService ? getLocalizedName(detailService) : ""}</DialogTitle>
            </DialogHeader>
            {detailContent}
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </div>
  );
};

export default Experiences;
