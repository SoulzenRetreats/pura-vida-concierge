import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type RevenueSplit = Tables<"revenue_splits">;

export function useRevenueSplits() {
  return useQuery({
    queryKey: ["revenue-splits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenue_splits")
        .select(`
          *,
          bookings (
            id,
            customer_name,
            customer_email,
            check_in,
            check_out,
            status
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useRevenueSplitByBooking(bookingId: string | undefined) {
  return useQuery({
    queryKey: ["revenue-split", bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      
      const { data, error } = await supabase
        .from("revenue_splits")
        .select("*")
        .eq("booking_id", bookingId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!bookingId,
  });
}

export function useCreateRevenueSplit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TablesInsert<"revenue_splits">) => {
      const { data: result, error } = await supabase
        .from("revenue_splits")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenue-splits"] });
    },
  });
}

export function useUpdateRevenueSplit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: TablesUpdate<"revenue_splits"> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("revenue_splits")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenue-splits"] });
    },
  });
}

export function useCompletedBookingsForRevenue() {
  return useQuery({
    queryKey: ["completed-bookings-revenue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          customer_name,
          customer_email,
          check_in,
          check_out,
          status,
          revenue_splits (*)
        `)
        .eq("status", "completed")
        .order("check_out", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
