import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type BookingWithProperty = Database["public"]["Tables"]["bookings"]["Row"] & {
  properties: { name: string; location: string } | null;
};

interface UseBookingsOptions {
  searchTerm?: string;
}

export function useBookings({ searchTerm = "" }: UseBookingsOptions = {}) {
  return useQuery({
    queryKey: ["bookings", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("bookings")
        .select("*, properties(name, location)")
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
