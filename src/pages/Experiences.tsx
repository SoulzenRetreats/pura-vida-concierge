import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import servicesHero from "@/assets/services-hero.jpg";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  photos: string[];
  price_range: string;
}

const Experiences = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

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
          filter as "chef" | "transportation" | "adventure" | "spa" | "tours" | "celebrations" | "other"
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

  const categories = [
    { value: "all", label: t('experiences.filter.all') },
    { value: "chef", label: t('experiences.filter.chef') },
    { value: "transportation", label: t('experiences.filter.transportation') },
    { value: "adventure", label: t('experiences.filter.adventure') },
    { value: "spa", label: t('experiences.filter.spa') },
    { value: "tours", label: t('experiences.filter.tours') },
    { value: "celebrations", label: t('experiences.filter.celebrations') },
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
              {services.map((service) => (
                <Card
                  key={service.id}
                  className="overflow-hidden hover:shadow-luxury transition-spring group"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={service.photos[0] || "/placeholder.svg"}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-spring"
                    />
                    <Badge className="absolute top-4 right-4 gradient-secondary">
                      {formatCategory(service.category)}
                    </Badge>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-heading font-semibold mb-2">
                      {service.name}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {service.description}
                    </p>
                    {service.price_range && (
                      <p className="text-sm font-medium text-accent">
                        {t('experiences.priceRange', { range: service.price_range })}
                      </p>
                    )}
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
