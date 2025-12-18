import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Sparkles, Users, MapPin, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-main.jpg";

const Home = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Luxury Costa Rica Villa"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 gradient-hero" />
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {t('home.hero.title')}
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            {t('home.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <Link to="/booking">
              <Button
                size="lg"
                className="gradient-secondary hover:opacity-90 transition-smooth text-lg px-8 py-6 shadow-luxury"
              >
                {t('nav.planMyTrip')}
              </Button>
            </Link>
            <Link to="/properties">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 transition-smooth text-lg px-8 py-6"
              >
                {t('home.hero.viewProperties')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <h2 className="text-4xl sm:text-5xl font-heading font-bold text-center mb-16">
            {t('home.features.title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-spring">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">
                {t('home.features.villas.title')}
              </h3>
              <p className="text-muted-foreground">
                {t('home.features.villas.description')}
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-spring">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">
                {t('home.features.experiences.title')}
              </h3>
              <p className="text-muted-foreground">
                {t('home.features.experiences.description')}
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-spring">
                <MapPin className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">
                {t('home.features.locations.title')}
              </h3>
              <p className="text-muted-foreground">
                {t('home.features.locations.description')}
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-spring">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">
                {t('home.features.service.title')}
              </h3>
              <p className="text-muted-foreground">
                {t('home.features.service.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary to-primary-light text-primary-foreground">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            {t('home.cta.subtitle')}
          </p>
          <Link to="/booking">
            <Button
              size="lg"
              className="gradient-secondary hover:opacity-90 transition-smooth text-base sm:text-lg px-6 sm:px-12 py-4 sm:py-6 shadow-luxury w-full sm:w-auto"
            >
              {t('home.cta.button')}
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
