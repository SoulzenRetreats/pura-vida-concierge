import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory rate limit store (resets on function cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

/** Validate a string field: return trimmed value or error response */
function validateStringField(
  value: string | undefined | null,
  fieldName: string,
  maxLength: number,
): { trimmed: string; error?: Response } {
  const trimmed = (value?.trim() || "");
  if (trimmed.length > maxLength) {
    return {
      trimmed,
      error: new Response(
        JSON.stringify({ error: `${fieldName} must be under ${maxLength} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      ),
    };
  }
  return { trimmed };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    const { allowed, remaining } = checkRateLimit(clientIP);

    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Too many booking requests. Please try again later.", code: "RATE_LIMIT_EXCEEDED" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "3600" } },
      );
    }

    const body = await req.json();
    const {
      customerName, customerEmail, customerPhone,
      checkIn, checkOut, guestCount,
      budgetRange, serviceDates, preferredTime, locationDetails,
      occasionType, dietaryPreferences, vibePreferences, surpriseElements,
      specialNotes, propertyId, selectedServices, honeypot,
      conciergeId,
    } = body;

    // Bot detection
    if (honeypot) {
      return new Response(JSON.stringify({ success: true, bookingId: "fake-id" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Required field validation
    if (!customerName || typeof customerName !== "string" || customerName.trim().length === 0 || customerName.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid name" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail || typeof customerEmail !== "string" || !emailRegex.test(customerEmail) || customerEmail.length > 255) {
      return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!checkIn || !checkOut) {
      return new Response(JSON.stringify({ error: "Check-in and check-out dates are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!guestCount || typeof guestCount !== "number" || guestCount < 1 || guestCount > 100) {
      return new Response(JSON.stringify({ error: "Invalid guest count" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Validate optional string fields
    const fields: [string | undefined | null, string, number][] = [
      [budgetRange, "Budget range", 100],
      [serviceDates, "Service dates", 200],
      [locationDetails, "Location details", 500],
      [dietaryPreferences, "Dietary preferences", 500],
      [vibePreferences, "Vibe preferences", 200],
      [surpriseElements, "Surprise elements", 500],
      [specialNotes, "Special notes", 1000],
      [occasionType, "Occasion type", 100],
      [preferredTime, "Preferred time", 100],
      [customerPhone, "Phone number", 50],
    ];

    const trimmed: Record<string, string> = {};
    for (const [val, name, max] of fields) {
      const result = validateStringField(val, name, max);
      if (result.error) return result.error;
      trimmed[name] = result.trimmed;
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up concierge profile for email routing
    let conciergeProfile: { contact_email: string | null; first_name: string | null; whatsapp_number: string | null } | null = null;
    if (conciergeId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("contact_email, first_name, whatsapp_number")
        .eq("id", conciergeId)
        .maybeSingle();
      conciergeProfile = profile;
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        property_id: propertyId || null,
        concierge_id: conciergeId || null,
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim().toLowerCase(),
        customer_phone: trimmed["Phone number"] || null,
        check_in: checkIn,
        check_out: checkOut,
        guest_count: guestCount,
        budget_range: trimmed["Budget range"] || null,
        service_dates: trimmed["Service dates"] || null,
        preferred_time: trimmed["Preferred time"] || null,
        location_details: trimmed["Location details"] || null,
        occasion_type: trimmed["Occasion type"] || null,
        dietary_preferences: trimmed["Dietary preferences"] || null,
        vibe_preferences: trimmed["Vibe preferences"] || null,
        surprise_elements: trimmed["Surprise elements"] || null,
        special_notes: trimmed["Special notes"] || null,
        status: "new_request",
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      return new Response(JSON.stringify({ error: "Failed to create booking" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Add selected services
    if (selectedServices?.length > 0 && booking) {
      const { error: servicesError } = await supabase
        .from("booking_services")
        .insert(selectedServices.map((serviceId: string) => ({ booking_id: booking.id, service_id: serviceId })));
      if (servicesError) console.error("Error adding booking services:", servicesError);
    }

    console.log(`Booking created: ${booking.id} from IP: ${clientIP}`);

    // Send email notifications (non-blocking)
    try {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (resendApiKey) {
        // Fetch service names
        let serviceNamesList: string[] = [];
        if (selectedServices?.length > 0) {
          const { data: serviceRows } = await supabase
            .from("services")
            .select("name_en")
            .in("id", selectedServices);
          if (serviceRows) serviceNamesList = serviceRows.map((s: { name_en: string }) => s.name_en);
        }

        // Determine notification email: concierge contact_email first, then app_settings fallback
        let notificationEmail: string | null = conciergeProfile?.contact_email || null;
        if (!notificationEmail) {
          const { data: settingRow } = await supabase
            .from("app_settings")
            .select("value")
            .eq("key", "notification_email")
            .maybeSingle();
          notificationEmail = (settingRow?.value as string) || null;
        }

        const conciergeName = conciergeProfile?.first_name || "Concierge";

        // 1) Internal notification to concierge
        if (notificationEmail) {
          const internalHtml = `
            <h2>New Trip Plan Request</h2>
            <p><strong>Name:</strong> ${customerName.trim()}</p>
            <p><strong>Email:</strong> ${customerEmail.trim().toLowerCase()}</p>
            ${trimmed["Phone number"] ? `<p><strong>Phone:</strong> ${trimmed["Phone number"]}</p>` : ""}
            <p><strong>Dates:</strong> ${checkIn} → ${checkOut}</p>
            <p><strong>Guests:</strong> ${guestCount}</p>
            ${serviceNamesList.length > 0 ? `<p><strong>Selected Experiences:</strong> ${serviceNamesList.join(", ")}</p>` : ""}
            ${trimmed["Special notes"] ? `<p><strong>Notes:</strong> ${trimmed["Special notes"]}</p>` : ""}
          `;

          const internalRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${resendApiKey}` },
            body: JSON.stringify({
              from: "Pura Vida Concierge <bookings@soulzenwellness.com>",
              to: [notificationEmail],
              subject: `New Trip Plan Request — ${customerName.trim()}`,
              html: internalHtml,
            }),
          });
          if (!internalRes.ok) console.error("Internal email failed:", await internalRes.text());
          else console.log("Internal notification sent to:", notificationEmail);
        }

        // 2) Customer confirmation email
        const replyTo = notificationEmail || "hello@soulzenwellness.com";
        const customerHtml = `
          <h2>We received your trip plan request!</h2>
          <p>Hi ${customerName.trim()},</p>
          <p>Thank you for reaching out to Pura Vida Concierge! We've received your request and ${conciergeName} will be in touch soon to start planning your perfect Costa Rica experience.</p>
          <p><strong>Your trip details:</strong></p>
          <ul>
            <li><strong>Dates:</strong> ${checkIn} → ${checkOut}</li>
            <li><strong>Guests:</strong> ${guestCount}</li>
            ${serviceNamesList.length > 0 ? `<li><strong>Selected Experiences:</strong> ${serviceNamesList.join(", ")}</li>` : ""}
          </ul>
          ${trimmed["Special notes"] ? `<p><strong>Your notes:</strong> ${trimmed["Special notes"]}</p>` : ""}
          <p>If you have any questions in the meantime, just reply to this email.</p>
          <p>Pura Vida! 🌴</p>
        `;

        const customerRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${resendApiKey}` },
          body: JSON.stringify({
            from: "Pura Vida Concierge <bookings@soulzenwellness.com>",
            to: [customerEmail.trim().toLowerCase()],
            reply_to: replyTo,
            subject: "We received your trip plan request! 🌴",
            html: customerHtml,
          }),
        });

        if (!customerRes.ok) {
          console.error("Customer email failed:", await customerRes.text());
        } else {
          console.log("Customer confirmation sent to:", customerEmail.trim().toLowerCase());
          // Update customer_email_sent_at
          await supabase
            .from("bookings")
            .update({ customer_email_sent_at: new Date().toISOString() })
            .eq("id", booking.id);
        }
      }
    } catch (emailError) {
      console.error("Email notification error (non-blocking):", emailError);
    }

    return new Response(
      JSON.stringify({ success: true, bookingId: booking.id, rateLimit: { remaining } }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json", "X-RateLimit-Remaining": remaining.toString() } },
    );
  } catch (error) {
    console.error("Error processing booking:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
