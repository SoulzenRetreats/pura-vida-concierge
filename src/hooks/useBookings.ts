import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type BookingWithProperty = Database["public"]["Tables"]["bookings"]["Row"] & {
  properties: { name: string; location: string } | null;
  booking_services: {
    service_id: string;
    services: { name: string } | null;
  }[];
};

interface UseBookingsOptions {
  searchTerm?: string;
}

export function useNotificationRecipient() {
  return useQuery({
    queryKey: ["notification-recipient"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_notification_recipient");
      if (error) throw error;
      const row = (data as { email: string; first_name: string; whatsapp_number: string }[])?.[0];
      return row ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBookings({ searchTerm = "" }: UseBookingsOptions = {}) {
  return useQuery({
    queryKey: ["bookings", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("bookings")
        .select("*, properties(name, location), booking_services(service_id, services(name))")
        .order("created_at", { ascending: false });

      if (searchTerm.trim()) {
        query = query.or(
          `customer_name.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as BookingWithProperty[];
    },
  });
}
