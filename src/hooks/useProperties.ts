import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Property = Tables<"properties"> & {
  vendor_name?: string | null;
};
export type PropertyInsert = TablesInsert<"properties">;
export type PropertyUpdate = TablesUpdate<"properties">;

interface UsePropertiesOptions {
  searchTerm?: string;
  locationFilter?: string;
}

export function useProperties({ searchTerm = "", locationFilter = "" }: UsePropertiesOptions = {}) {
  return useQuery({
    queryKey: ["properties", searchTerm, locationFilter],
    queryFn: async () => {
      let query = supabase
        .from("properties")
        .select(`
          *,
          vendors:vendor_id (name)
        `)
        .order("name", { ascending: true });

      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      if (locationFilter && locationFilter !== "all") {
        query = query.eq("location", locationFilter as "jaco" | "la_fortuna");
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform to include vendor_name at top level
      return (data || []).map((property) => ({
        ...property,
        vendor_name: (property.vendors as { name: string } | null)?.name || null,
      })) as Property[];
    },
  });
}

export function useProperty(propertyId: string | null) {
  return useQuery({
    queryKey: ["property", propertyId],
    queryFn: async () => {
      if (!propertyId) return null;

      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          vendors:vendor_id (name)
        `)
        .eq("id", propertyId)
        .single();

      if (error) throw error;

      return {
        ...data,
        vendor_name: (data.vendors as { name: string } | null)?.name || null,
      } as Property;
    },
    enabled: !!propertyId,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (property: PropertyInsert) => {
      const { data, error } = await supabase
        .from("properties")
        .insert(property)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: PropertyUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("properties")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
