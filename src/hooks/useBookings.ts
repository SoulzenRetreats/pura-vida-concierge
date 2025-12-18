import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

export type BookingWithProperty = Database["public"]["Tables"]["bookings"]["Row"] & {
  properties: { name: string; location: string } | null;
};

interface UseBookingsOptions {
  statusFilter?: BookingStatus | "all";
  searchTerm?: string;
}

export function useBookings({ statusFilter = "all", searchTerm = "" }: UseBookingsOptions = {}) {
  return useQuery({
    queryKey: ["bookings", statusFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("bookings")
        .select("*, properties(name, location)")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

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

export function useBookingCounts() {
  return useQuery({
    queryKey: ["booking-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("status");

      if (error) throw error;

      const counts: Record<string, number> = {
        all: data.length,
        new_request: 0,
        in_review: 0,
        quote_sent: 0,
        confirmed: 0,
        completed: 0,
      };

      data.forEach((booking) => {
        if (booking.status) {
          counts[booking.status]++;
        }
      });

      return counts;
    },
  });
}
