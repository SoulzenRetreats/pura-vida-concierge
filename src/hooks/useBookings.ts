import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database, TablesUpdate } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

export type BookingWithProperty = Database["public"]["Tables"]["bookings"]["Row"] & {
  properties: { name: string; location: string } | null;
  assigned_to: string | null;
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
        .select("*, properties(name, location), assigned_to")
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

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: TablesUpdate<"bookings"> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("bookings")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-counts"] });
      queryClient.invalidateQueries({ queryKey: ["booking-detail"] });
    },
  });
}

export function useClaimBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: result, error } = await supabase
        .from("bookings")
        .update({ assigned_to: user.id })
        .eq("id", bookingId)
        .is("assigned_to", null)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-counts"] });
      queryClient.invalidateQueries({ queryKey: ["booking-detail"] });
    },
  });
}
