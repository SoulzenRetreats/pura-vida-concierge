import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageCircle, Loader2 } from "lucide-react";
import { useProfileBySlug } from "@/hooks/useProfiles";

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const Success = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();

  const state = (location.state as any) || {};
  const serviceNames: string[] = state.serviceNames || [];
  const customerName: string = state.customerName || "";
  const checkIn: string = state.checkIn || "";
  const checkOut: string = state.checkOut || "";
  const guestCount: number = state.guestCount || 0;

  const { data: conciergeProfile, isLoading } = useProfileBySlug(slug || "");

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const formattedCheckIn = formatDate(checkIn);
  const formattedCheckOut = formatDate(checkOut);

  const whatsappMessage = conciergeProfile?.first_name
    ? `Hi ${conciergeProfile.first_name}! I just submitted a request on the site for my upcoming trip.\n\nHere are my details:\n\n*Name:* ${customerName}\n\n*Dates:* ${formattedCheckIn} to ${formattedCheckOut}\n\n*Travelers:* ${guestCount}\n\nI'm interested in booking the following:\n\n${serviceNames.map(s => `- ${s}`).join("\n")}\n\nLet me know what the next steps are to get this finalized!`
    : "";

  const whatsappUrl = conciergeProfile?.whatsapp_number
    ? `https://wa.me/${conciergeProfile.whatsapp_number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {t("success.headline")}
            </h1>
            <p className="text-muted-foreground text-lg font-body leading-relaxed">
              {t("success.subtext")}
            </p>
          </div>

          {serviceNames.length > 0 && (
            <div className="text-left bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="font-heading font-semibold text-sm text-foreground">
                {t("success.yourExperiences")}
              </p>
              <ul className="space-y-1">
                {serviceNames.map((name, i) => (
                  <li key={i} className="text-sm text-muted-foreground font-body flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : whatsappUrl && conciergeProfile?.first_name ? (
            <Button
              size="lg"
              className="w-full h-14 text-base gap-2 bg-[hsl(142,70%,40%)] hover:bg-[hsl(142,70%,35%)] text-white"
              onClick={() => window.open(whatsappUrl, "_blank")}
            >
              <MessageCircle className="h-5 w-5" />
              {t("success.messageOnWhatsApp", { name: conciergeProfile.first_name })}
            </Button>
          ) : (
            <p className="text-muted-foreground font-body">
              {t("success.fallback")}
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Success;
