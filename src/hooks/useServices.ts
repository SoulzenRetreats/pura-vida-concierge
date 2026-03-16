import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Service = Tables<"services">;
export type ServiceInsert = TablesInsert<"services">;
export type ServiceUpdate = TablesUpdate<"services">;

interface UseServicesOptions {
  searchTerm?: string;
  categoryFilter?: string;
  conciergeFilter?: string;
}

export function useServices({ searchTerm = "", categoryFilter = "", conciergeFilter = "" }: UseServicesOptions = {}) {
  return useQuery({
    queryKey: ["services", searchTerm, categoryFilter, conciergeFilter],
    queryFn: async () => {
      let query = supabase
        .from("services")
        .select("*")
        .order("name", { ascending: true });

      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      if (categoryFilter && categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      if (conciergeFilter && conciergeFilter !== "all") {
        if (conciergeFilter === "unassigned") {
          query = query.is("concierge_id", null);
        } else {
          query = query.eq("concierge_id", conciergeFilter);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []) as Service[];
    },
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (service: ServiceInsert) => {
      const { data, error } = await supabase
        .from("services")
        .insert(service)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ServiceUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("services")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useBulkUpdateConcierge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceIds, conciergeId }: { serviceIds: string[]; conciergeId: string | null }) => {
      const { error } = await supabase
        .from("services")
        .update({ concierge_id: conciergeId })
        .in("id", serviceIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}
