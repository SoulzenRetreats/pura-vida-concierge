import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory rate limit store (resets on function cold start, but good for burst protection)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 5; // Max submissions per window
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour window

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
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    console.log(`Booking submission attempt from IP: ${clientIP}`);

    // Check rate limit
    const { allowed, remaining } = checkRateLimit(clientIP);
    
    if (!allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          error: "Too many booking requests. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED"
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0",
            "Retry-After": "3600"
          } 
        }
      );
    }

    const body = await req.json();
    
    // Extract all fields including new ones
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      checkIn, 
      checkOut, 
      guestCount,
      budgetRange,
      serviceDates,
      preferredTime,
      locationDetails,
      occasionType,
      dietaryPreferences,
      vibePreferences,
      surpriseElements,
      specialNotes, 
      propertyId, 
      selectedServices,
      honeypot
    } = body;

    // Bot detection via honeypot
    if (honeypot) {
      console.log(`Bot detected (honeypot triggered) from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ success: true, bookingId: "fake-id" }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Server-side validation
    if (!customerName || typeof customerName !== "string" || customerName.trim().length === 0 || customerName.length > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail || typeof customerEmail !== "string" || !emailRegex.test(customerEmail) || customerEmail.length > 255) {
      return new Response(
        JSON.stringify({ error: "Invalid email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!checkIn || !checkOut) {
      return new Response(
        JSON.stringify({ error: "Check-in and check-out dates are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!guestCount || typeof guestCount !== "number" || guestCount < 1 || guestCount > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid guest count" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate field lengths - reject oversized inputs with clear errors instead of silent truncation
    const trimmedBudgetRange = budgetRange?.trim() || "";
    if (trimmedBudgetRange.length > 100) {
      return new Response(
        JSON.stringify({ error: "Budget range must be under 100 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedServiceDates = serviceDates?.trim() || "";
    if (trimmedServiceDates.length > 200) {
      return new Response(
        JSON.stringify({ error: "Service dates must be under 200 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedLocationDetails = locationDetails?.trim() || "";
    if (trimmedLocationDetails.length > 500) {
      return new Response(
        JSON.stringify({ error: "Location details must be under 500 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedDietaryPreferences = dietaryPreferences?.trim() || "";
    if (trimmedDietaryPreferences.length > 500) {
      return new Response(
        JSON.stringify({ error: "Dietary preferences must be under 500 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedVibePreferences = vibePreferences?.trim() || "";
    if (trimmedVibePreferences.length > 200) {
      return new Response(
        JSON.stringify({ error: "Vibe preferences must be under 200 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedSurpriseElements = surpriseElements?.trim() || "";
    if (trimmedSurpriseElements.length > 500) {
      return new Response(
        JSON.stringify({ error: "Surprise elements must be under 500 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedSpecialNotes = specialNotes?.trim() || "";
    if (trimmedSpecialNotes.length > 1000) {
      return new Response(
        JSON.stringify({ error: "Special notes must be under 1000 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedOccasionType = occasionType?.trim() || "";
    if (trimmedOccasionType.length > 100) {
      return new Response(
        JSON.stringify({ error: "Occasion type must be under 100 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedPreferredTime = preferredTime?.trim() || "";
    if (trimmedPreferredTime.length > 100) {
      return new Response(
        JSON.stringify({ error: "Preferred time must be under 100 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedCustomerPhone = customerPhone?.trim() || "";
    if (trimmedCustomerPhone.length > 50) {
      return new Response(
        JSON.stringify({ error: "Phone number must be under 50 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for inserting
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create booking with validated fields (no silent truncation)
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        property_id: propertyId || null,
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim().toLowerCase(),
        customer_phone: trimmedCustomerPhone || null,
        check_in: checkIn,
        check_out: checkOut,
        guest_count: guestCount,
        budget_range: trimmedBudgetRange || null,
        service_dates: trimmedServiceDates || null,
        preferred_time: trimmedPreferredTime || null,
        location_details: trimmedLocationDetails || null,
        occasion_type: trimmedOccasionType || null,
        dietary_preferences: trimmedDietaryPreferences || null,
        vibe_preferences: trimmedVibePreferences || null,
        surprise_elements: trimmedSurpriseElements || null,
        special_notes: trimmedSpecialNotes || null,
        status: "new_request",
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      return new Response(
        JSON.stringify({ error: "Failed to create booking" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add selected services if any
    if (selectedServices && Array.isArray(selectedServices) && selectedServices.length > 0 && booking) {
      const { error: servicesError } = await supabase
        .from("booking_services")
        .insert(
          selectedServices.map((serviceId: string) => ({
            booking_id: booking.id,
            service_id: serviceId,
          }))
        );

      if (servicesError) {
        console.error("Error adding booking services:", servicesError);
        // Don't fail the whole request, booking is already created
      }
    }

    console.log(`Booking created successfully: ${booking.id} from IP: ${clientIP}`);

    // Send email notification (non-blocking)
    try {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (resendApiKey) {
        // Fetch service names for the email
        let serviceNamesList: string[] = [];
        if (selectedServices?.length > 0 && booking) {
          const { data: serviceRows } = await supabase
            .from("services")
            .select("name_en")
            .in("id", selectedServices);
          if (serviceRows) {
            serviceNamesList = serviceRows.map((s: { name_en: string }) => s.name_en);
          }
        }

        // Fetch notification email from app_settings or use fallback
        const { data: settingRow } = await supabase
          .from("app_settings")
          .select("value")
          .eq("key", "notification_email")
          .maybeSingle();
        const notificationEmail = (settingRow?.value as string) || null;

        if (notificationEmail) {
          const emailHtml = `
            <h2>New Trip Plan Request</h2>
            <p><strong>Name:</strong> ${customerName.trim()}</p>
            <p><strong>Email:</strong> ${customerEmail.trim().toLowerCase()}</p>
            ${trimmedCustomerPhone ? `<p><strong>Phone:</strong> ${trimmedCustomerPhone}</p>` : ""}
            <p><strong>Dates:</strong> ${checkIn} → ${checkOut}</p>
            <p><strong>Guests:</strong> ${guestCount}</p>
            ${serviceNamesList.length > 0 ? `<p><strong>Selected Experiences:</strong> ${serviceNamesList.join(", ")}</p>` : ""}
            ${trimmedSpecialNotes ? `<p><strong>Notes:</strong> ${trimmedSpecialNotes}</p>` : ""}
          `;

          const emailRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: "Pura Vida Concierge <notifications@pura-vida-concierge.lovable.app>",
              to: [notificationEmail],
              subject: `New Trip Plan Request — ${customerName.trim()}`,
              html: emailHtml,
            }),
          });

          if (!emailRes.ok) {
            console.error("Resend email failed:", await emailRes.text());
          } else {
            console.log("Notification email sent successfully");
          }
        } else {
          console.log("No notification_email configured in app_settings, skipping email");
        }
      }
    } catch (emailError) {
      console.error("Email notification error (non-blocking):", emailError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        bookingId: booking.id,
        rateLimit: { remaining }
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": remaining.toString()
        } 
      }
    );

  } catch (error) {
    console.error("Error processing booking:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
