import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useTripPlan } from "@/contexts/TripPlanContext";

/**
 * Redirects to /:slug${targetPath}.
 * Uses the concierge slug from context, or falls back to the first profile with a slug.
 */
const SlugRedirect = ({ targetPath = "/experiences" }: { targetPath?: string }) => {
  const { conciergeSlug } = useTripPlan();
  const [defaultSlug, setDefaultSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(!conciergeSlug);

  useEffect(() => {
    if (conciergeSlug) return;
    supabase
      .from("profiles")
      .select("slug")
      .not("slug", "is", null)
      .limit(1)
      .then(({ data }) => {
        setDefaultSlug(data?.[0]?.slug ?? null);
        setLoading(false);
      });
  }, [conciergeSlug]);

  const slug = conciergeSlug || defaultSlug;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (slug) {
    return <Navigate to={`/${slug}${targetPath}`} replace />;
  }

  // No profiles with slugs exist yet — go home
  return <Navigate to="/" replace />;
};

export default SlugRedirect;
