import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cake, Heart, Users, Briefcase, Baby, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const TripTypes = () => {
  const { t } = useTranslation();
  
  const tripTypes = [
    {
      icon: Cake,
      title: t('tripTypes.types.birthdays.title'),
      description: t('tripTypes.types.birthdays.description'),
      color: "bg-accent/10 text-accent",
    },
    {
      icon: Heart,
      title: t('tripTypes.types.anniversaries.title'),
      description: t('tripTypes.types.anniversaries.description'),
      color: "bg-secondary/10 text-secondary",
    },
    {
      icon: Sparkles,
      title: t('tripTypes.types.celebrations.title'),
      description: t('tripTypes.types.celebrations.description'),
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Users,
      title: t('tripTypes.types.bachelor.title'),
      description: t('tripTypes.types.bachelor.description'),
      color: "bg-accent/10 text-accent",
    },
    {
      icon: Baby,
      title: t('tripTypes.types.family.title'),
      description: t('tripTypes.types.family.description'),
      color: "bg-secondary/10 text-secondary",
    },
    {
      icon: Briefcase,
      title: t('tripTypes.types.corporate.title'),
      description: t('tripTypes.types.corporate.description'),
      color: "bg-primary/10 text-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl sm:text-6xl font-heading font-bold mb-6">
            {t('tripTypes.hero.title')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t('tripTypes.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Trip Types Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tripTypes.map((trip, index) => (
              <Card
                key={index}
                className="hover:shadow-luxury transition-spring group"
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-20 h-20 mx-auto mb-6 rounded-full ${trip.color} flex items-center justify-center group-hover:scale-110 transition-spring`}
                  >
                    <trip.icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-heading font-semibold mb-4">
                    {trip.title}
                  </h3>
                  <p className="text-muted-foreground mb-6">{trip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary to-primary-light text-primary-foreground">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-6">
            {t('tripTypes.cta.title')}
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            {t('tripTypes.cta.subtitle')}
          </p>
          <Link to="/booking">
            <Button
              size="lg"
              className="gradient-secondary hover:opacity-90 transition-smooth text-lg px-12 py-6 shadow-luxury"
            >
              {t('tripTypes.cta.button')}
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TripTypes;
