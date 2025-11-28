import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Users, Bed, Bath, Loader2 } from "lucide-react";
import propertiesHero from "@/assets/properties-hero.jpg";

interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  sleeps: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  photos: string[];
}

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchProperties();
  }, [filter]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      let query = supabase.from("properties").select("*");

      if (filter !== "all") {
        query = query.eq("location", filter as "jaco" | "la_fortuna");
      }

      const { data, error } = await query;

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatLocation = (location: string) => {
    return location
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden mt-20">
        <div className="absolute inset-0">
          <img
            src={propertiesHero}
            alt="Luxury Properties"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 gradient-hero" />
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl font-heading font-bold text-white mb-4">
            Luxury Villas
          </h1>
          <p className="text-xl text-white/90">
            Discover our handpicked collection of stunning properties
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className="transition-smooth"
            >
              All Locations
            </Button>
            <Button
              variant={filter === "jaco" ? "default" : "outline"}
              onClick={() => setFilter("jaco")}
              className="transition-smooth"
            >
              Jaco
            </Button>
            <Button
              variant={filter === "la_fortuna" ? "default" : "outline"}
              onClick={() => setFilter("la_fortuna")}
              className="transition-smooth"
            >
              La Fortuna
            </Button>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-heading font-semibold mb-4">
                No Properties Available
              </h3>
              <p className="text-muted-foreground mb-8">
                Check back soon for our luxury villas or contact us for availability
              </p>
              <Link to="/booking">
                <Button className="gradient-secondary">Request Information</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <Card
                  key={property.id}
                  className="overflow-hidden hover:shadow-luxury transition-spring group"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={property.photos[0] || "/placeholder.svg"}
                      alt={property.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-spring"
                    />
                    <Badge className="absolute top-4 right-4 gradient-primary">
                      <MapPin className="w-3 h-3 mr-1" />
                      {formatLocation(property.location)}
                    </Badge>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-2xl font-heading font-semibold mb-2">
                      {property.name}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {property.description}
                    </p>

                    <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Sleeps {property.sleeps}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>{property.bedrooms} Beds</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        <span>{property.bathrooms} Baths</span>
                      </div>
                    </div>

                    <Link to={`/booking?property=${property.id}`}>
                      <Button className="w-full gradient-secondary hover:opacity-90 transition-smooth">
                        Request This Villa
                      </Button>
                    </Link>
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

export default Properties;
