import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cake, Heart, Users, Briefcase, Baby, Sparkles } from "lucide-react";

const TripTypes = () => {
  const tripTypes = [
    {
      icon: Cake,
      title: "Birthday Celebrations",
      description:
        "Make milestone birthdays unforgettable with private villas, gourmet dining, and curated experiences designed to wow your guests.",
      color: "bg-accent/10 text-accent",
    },
    {
      icon: Heart,
      title: "Anniversaries",
      description:
        "Celebrate love in paradise with romantic settings, couples' spa treatments, sunset cruises, and intimate dinners under the stars.",
      color: "bg-secondary/10 text-secondary",
    },
    {
      icon: Sparkles,
      title: "Special Celebrations",
      description:
        "From retirement parties to graduation trips, we create memorable experiences for life's most important moments.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Users,
      title: "Bachelor & Bachelorette Alternatives",
      description:
        "Skip the typical party destinations. Experience Costa Rica with adventure tours, beach clubs, private chefs, and unforgettable nights.",
      color: "bg-accent/10 text-accent",
    },
    {
      icon: Baby,
      title: "Family Trips",
      description:
        "Multi-generational vacations made easy with spacious villas, kid-friendly activities, and services that keep everyone happy.",
      color: "bg-secondary/10 text-secondary",
    },
    {
      icon: Briefcase,
      title: "Corporate Groups",
      description:
        "Team building and corporate retreats with premium accommodations, meeting spaces, and activities that inspire collaboration.",
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
            Every Occasion Deserves
            <br />
            <span className="text-primary">the Pura Vida Treatment</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Whether you're celebrating a milestone or just gathering loved ones,
            we'll create the perfect Costa Rica experience for your group.
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
            Let's Start Planning Your Perfect Trip
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Tell us about your group and what you're celebrating. We'll handle the rest.
          </p>
          <Link to="/booking">
            <Button
              size="lg"
              className="gradient-secondary hover:opacity-90 transition-smooth text-lg px-12 py-6 shadow-luxury"
            >
              Request a Customized Itinerary
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TripTypes;
