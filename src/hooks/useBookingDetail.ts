import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

export type BookingDetail = Database["public"]["Tables"]["bookings"]["Row"] & {
  properties: { name: string; location: string } | null;
  booking_services: Array<{
    service_id: string;
    vendor_id: string | null;
    price: number | null;
    services: { name: string; category: string } | null;
    vendors: { name: string } | null;
  }>;
};

export function useBookingDetail(bookingId: string) {
  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          properties(name, location),
          booking_services(
            service_id,
            vendor_id,
            price,
            services(name, category),
            vendors(name)
          )
        `)
        .eq("id", bookingId)
        .maybeSingle();

      if (error) throw error;
      return data as BookingDetail | null;
    },
    enabled: !!bookingId,
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: BookingStatus }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", bookingId);

      if (error) throw error;
    },
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-counts"] });
    },
  });
}

export function useUpdateBookingNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, internalNotes }: { bookingId: string; internalNotes: string }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ internal_notes: internalNotes })
        .eq("id", bookingId);

      if (error) throw error;
    },
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
    },
  });
}

export function useAssignVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      serviceId,
      vendorId,
      price,
    }: {
      bookingId: string;
      serviceId: string;
      vendorId: string | null;
      price: number | null;
    }) => {
      const { error } = await supabase
        .from("booking_services")
        .upsert(
          { booking_id: bookingId, service_id: serviceId, vendor_id: vendorId, price },
          { onConflict: "booking_id,service_id" }
        );

      if (error) throw error;
    },
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
    },
  });
}
