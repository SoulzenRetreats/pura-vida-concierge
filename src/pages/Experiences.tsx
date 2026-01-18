import { useState, useEffect, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import servicesHero from "@/assets/services-hero.jpg";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  photos: string[];
  price_range: string;
  price: number | null;
}

// Photo Carousel component for service cards
function ServicePhotoCarousel({ photos, serviceName }: { photos: string[]; serviceName: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    emblaApi?.scrollNext();
  }, [emblaApi]);

  // Single photo - no carousel needed
  if (!photos || photos.length <= 1) {
    return (
      <img
        src={photos?.[0] || "/placeholder.svg"}
        alt={serviceName}
        className="w-full h-full object-cover group-hover:scale-110 transition-spring"
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      <div className="overflow-hidden w-full h-full" ref={emblaRef}>
        <div className="flex h-full">
          {photos.map((photo, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 h-full">
              <img
                src={photo || "/placeholder.svg"}
                alt={`${serviceName} ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-spring"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={scrollPrev}
        className={`absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-1.5 rounded-full shadow-md transition-opacity ${
          canScrollPrev ? "opacity-100" : "opacity-50"
        }`}
        aria-label="Previous photo"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={scrollNext}
        className={`absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-1.5 rounded-full shadow-md transition-opacity ${
          canScrollNext ? "opacity-100" : "opacity-50"
        }`}
        aria-label="Next photo"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {photos.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              emblaApi?.scrollTo(index);
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === selectedIndex
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
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  // Fetch distinct categories dynamically from the services table
  const { data: categoryList } = useQuery({
    queryKey: ["service-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("category")
        .order("category");
      if (error) throw error;
      return [...new Set(data?.map((s) => s.category))] as string[];
    },
  });

  useEffect(() => {
    fetchServices();
  }, [filter]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      let query = supabase.from("services").select("*");

      if (filter !== "all") {
        query = query.eq(
          "category",
          filter as "chef" | "transportation" | "adventure" | "spa" | "tours" | "celebrations" | "other" | "luxury_items"
        );
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

  const formatCategory = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Build categories dynamically from fetched data
  const categories = [
    { value: "all", label: t('experiences.filter.all') },
    ...(categoryList || []).map(cat => ({
      value: cat,
      label: t(`experiences.filter.${cat}`, formatCategory(cat))
    }))
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
            {t('experiences.hero')}
          </h1>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
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
                No Services Available
              </h3>
              <p className="text-muted-foreground">
                Check back soon or contact us for custom experiences
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => {
                const isForSale = service.category === "luxury_items";
                return (
                  <Card
                    key={service.id}
                    className="overflow-hidden hover:shadow-luxury transition-spring group"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <ServicePhotoCarousel 
                        photos={service.photos || []} 
                        serviceName={service.name} 
                      />
                      
                      {/* Category badge */}
                      <Badge className="absolute top-4 right-4 gradient-secondary">
                        {formatCategory(service.category)}
                      </Badge>
                      
                      {/* For Sale badge for luxury items */}
                      {isForSale && (
                        <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
                          {t('experiences.forSale')}
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-xl font-heading font-semibold mb-2">
                        {service.name}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {service.description}
                      </p>
                      {/* Show fixed price for luxury items, price range for others */}
                      {isForSale && service.price ? (
                        <p className="text-lg font-semibold text-accent">
                          ${service.price.toFixed(2)}
                        </p>
                      ) : service.price_range ? (
                        <p className="text-sm font-medium text-accent">
                          {t('experiences.priceRange', { range: service.price_range })}
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Experiences;
