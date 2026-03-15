import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import servicesHero from "@/assets/services-hero.jpg";
import { useCategories, getCategoryName, getCategoryNameBySlug } from "@/hooks/useCategories";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  photos: string[];
  price_range: string;
  price: number | null;
  is_for_sale: boolean;
  is_rental: boolean;
}

// Simple photo gallery component with manual navigation (no embla dependency)
function ServicePhotoGallery({ photos, serviceName }: { photos: string[]; serviceName: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Single photo or no photos - no navigation needed
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

      {/* Navigation arrows */}
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

      {/* Dot indicators */}
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

const Experiences = () => {
  const { t, i18n } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  // Fetch categories dynamically from the categories table
  const { data: categories = [] } = useCategories();

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

  // Build categories dynamically from fetched data
  const categoryFilters = [
    { value: "all", label: t("experiences.filter.all") },
    ...categories.map((cat) => ({
      value: cat.slug,
      label: getCategoryName(cat, i18n.language),
    })),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden mt-20">
        <div className="absolute inset-0">
          <img
            src={servicesHero}
            alt="Luxury Experiences"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 gradient-hero" />
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl font-heading font-bold text-white mb-4">
            {t("experiences.hero")}
          </h1>
        </div>
      </section>

      {/* Filter Section */}
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

      {/* Services Grid */}
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
              {services.map((service) => (
                <Card
                  key={service.id}
                  className="overflow-hidden hover:shadow-luxury transition-spring group"
                >
                  <div className="relative h-56 overflow-hidden">
                    <ServicePhotoGallery 
                      photos={service.photos || []} 
                      serviceName={service.name} 
                    />
                    
                    {/* Category badge */}
                    <Badge className="absolute top-4 right-4 gradient-secondary z-10">
                      {getCategoryNameBySlug(categories, service.category, i18n.language)}
                    </Badge>
                    
                    {/* Status badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
                      {service.is_for_sale && (
                        <Badge className="bg-accent text-accent-foreground">
                          {t("experiences.forSale")}
                        </Badge>
                      )}
                      {service.is_rental && (
                        <Badge variant="outline" className="bg-background/80">
                          {t("experiences.rental")}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-heading font-semibold mb-2">
                      {service.name}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {service.description}
                    </p>
                    {/* Price display using price_min / price_max */}
                    {service.price_min != null && service.price_max != null && service.price_min === service.price_max ? (
                      <p className="text-lg font-semibold text-accent">
                        ${service.price_min.toFixed(2)}
                      </p>
                    ) : service.price_min != null && service.price_max != null ? (
                      <p className="text-sm font-medium text-accent">
                        ${service.price_min.toFixed(2)} – ${service.price_max.toFixed(2)}
                      </p>
                    ) : service.price_min != null ? (
                      <p className="text-sm font-medium text-accent">
                        {t("experiences.fromPrice", { price: service.price_min.toFixed(2) })}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Experiences;
