import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Service = Tables<"services"> & {
  vendor_name?: string | null;
};
export type ServiceInsert = TablesInsert<"services">;
export type ServiceUpdate = TablesUpdate<"services">;

interface UseServicesOptions {
  searchTerm?: string;
  categoryFilter?: string;
}

export function useServices({ searchTerm = "", categoryFilter = "" }: UseServicesOptions = {}) {
  return useQuery({
    queryKey: ["services", searchTerm, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from("services")
        .select(`
          *,
          vendors:default_vendor_id (name)
        `)
        .order("name", { ascending: true });

      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      if (categoryFilter && categoryFilter !== "all") {
        query = query.eq("category", categoryFilter as "adventure" | "celebrations" | "chef" | "luxury_items" | "other" | "spa" | "tours" | "transportation");
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform to include vendor_name at top level
      return (data || []).map((service) => ({
        ...service,
        vendor_name: (service.vendors as { name: string } | null)?.name || null,
      })) as Service[];
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
