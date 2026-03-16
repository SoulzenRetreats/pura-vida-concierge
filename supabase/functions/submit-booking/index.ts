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
        // Extract variables for the email template
        const customerNotes = trimmed["Special notes"] || "";
        const cleanPhone = (trimmed["Phone number"] || "").replace(/[^0-9]/g, "");
        const conciergeName = conciergeProfile?.first_name || "Team";

        // Fetch service names (bilingual)
        let servicesList: { name: string }[] = [];
        if (selectedServices?.length > 0) {
          const { data: serviceRows } = await supabase
            .from("services")
            .select("name_en, name_es")
            .in("id", selectedServices);
          if (serviceRows) {
            servicesList = serviceRows.map((s: { name_en: string; name_es: string | null }) => ({
              name: `${s.name_en} / ${s.name_es || s.name_en}`,
            }));
          }
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

        // Internal notification to concierge
        if (notificationEmail) {
          const internalHtml = `<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#f4f1ec;font-family:'Outfit',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f1ec;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2d5016 0%,#4a7c28 50%,#6b9b3a 100%);padding:40px 40px 30px;text-align:center;">
              <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;font-weight:600;color:#ffffff;margin:0 0 8px;">Pura Vida Concierge</h1>
              <p style="font-family:'Outfit',Arial,sans-serif;font-size:14px;font-weight:400;color:rgba(255,255,255,0.85);margin:0;letter-spacing:1px;">New Lead &nbsp;|&nbsp; Nuevo Contacto</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">

              <!-- Traveler Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="border-bottom:2px solid #2d5016;padding-bottom:12px;margin-bottom:20px;">
                    <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-weight:600;color:#2d5016;margin:0;">Traveler Details &nbsp;/ Detalles del Viajero</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;font-size:13px;font-weight:500;color:#6b7280;width:140px;vertical-align:top;">Name / Nombre:</td>
                        <td style="padding:8px 0;font-size:15px;font-weight:500;color:#1f2937;">${customerName.trim()}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;font-size:13px;font-weight:500;color:#6b7280;width:140px;vertical-align:top;">Email / Correo:</td>
                        <td style="padding:8px 0;font-size:15px;color:#1f2937;"><a href="mailto:${customerEmail.trim().toLowerCase()}" style="color:#2d5016;text-decoration:none;">${customerEmail.trim().toLowerCase()}</a></td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;font-size:13px;font-weight:500;color:#6b7280;width:140px;vertical-align:top;">Phone / Teléfono:</td>
                        <td style="padding:8px 0;font-size:15px;color:#1f2937;">${trimmed["Phone number"] || "—"}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Requested Experiences -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="border-bottom:2px solid #2d5016;padding-bottom:12px;">
                    <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-weight:600;color:#2d5016;margin:0;">Requested Experiences &nbsp;/ Experiencias Solicitadas</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:20px;">
                    ${servicesList.length > 0
                      ? servicesList.map(service => `
                        <div style="padding:10px 16px;margin-bottom:8px;background-color:#f0f7e6;border-radius:8px;border-left:3px solid #4a7c28;">
                          <span style="font-size:14px;color:#2d5016;font-weight:500;">✓ ${service.name}</span>
                        </div>
                      `).join("")
                      : `<p style="font-size:14px;color:#6b7280;font-style:italic;">No experiences selected. / Sin experiencias seleccionadas.</p>`
                    }
                  </td>
                </tr>
              </table>

              <!-- Notes -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="border-bottom:2px solid #2d5016;padding-bottom:12px;">
                    <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-weight:600;color:#2d5016;margin:0;">Notes &nbsp;|&nbsp; Notas</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:20px;">
                    <div style="padding:16px;background-color:#fafaf8;border-radius:8px;border:1px solid #e5e7eb;">
                      <p style="font-size:14px;color:#374151;line-height:1.6;margin:0;">${customerNotes ? customerNotes : "No additional notes. / Sin notas adicionales."}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- WhatsApp CTA -->
              ${cleanPhone ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-top:8px;">
                    <a href="https://wa.me/${cleanPhone}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#25d366,#128c7e);color:#ffffff;font-family:'Outfit',Arial,sans-serif;font-size:15px;font-weight:500;padding:14px 32px;border-radius:50px;text-decoration:none;letter-spacing:0.5px;">Message on WhatsApp &nbsp;|&nbsp; Enviar Mensaje</a>
                  </td>
                </tr>
              </table>
              ` : ""}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="font-size:12px;color:#9ca3af;margin:0;">Pura Vida Concierge — Costa Rica</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

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
