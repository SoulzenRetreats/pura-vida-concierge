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
  // Try various headers for client IP
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
    
    // Validate required fields
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      checkIn, 
      checkOut, 
      guestCount, 
      specialNotes, 
      propertyId, 
      selectedServices,
      honeypot // Honeypot field for bot detection
    } = body;

    // Bot detection via honeypot
    if (honeypot) {
      console.log(`Bot detected (honeypot triggered) from IP: ${clientIP}`);
      // Return success to not reveal bot detection, but don't process
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

    // Create Supabase client with service role for inserting
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        property_id: propertyId || null,
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim().toLowerCase(),
        customer_phone: customerPhone?.trim() || null,
        check_in: checkIn,
        check_out: checkOut,
        guest_count: guestCount,
        special_notes: specialNotes?.substring(0, 1000) || null,
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
