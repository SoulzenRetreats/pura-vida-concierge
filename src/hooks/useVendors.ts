import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Vendor = Database["public"]["Tables"]["vendors"]["Row"];
export type VendorInsert = Database["public"]["Tables"]["vendors"]["Insert"];
export type VendorUpdate = Database["public"]["Tables"]["vendors"]["Update"];

interface UseVendorsOptions {
  searchTerm?: string;
  serviceFilter?: string;
}

export function useVendors({ searchTerm = "", serviceFilter = "" }: UseVendorsOptions = {}) {
  return useQuery({
    queryKey: ["vendors", searchTerm, serviceFilter],
    queryFn: async () => {
      let query = supabase
        .from("vendors")
        .select("*")
        .order("name", { ascending: true });

      if (searchTerm.trim()) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      if (serviceFilter) {
        query = query.contains("service_types", [serviceFilter]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Vendor[];
    },
  });
}

export function useVendor(vendorId: string | null) {
  return useQuery({
    queryKey: ["vendor", vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("id", vendorId)
        .maybeSingle();

      if (error) throw error;
      return data as Vendor | null;
    },
    enabled: !!vendorId,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendor: VendorInsert) => {
      const { data, error } = await supabase
        .from("vendors")
        .insert(vendor)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...vendor }: VendorUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("vendors")
        .update(vendor)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorId: string) => {
      const { error } = await supabase
        .from("vendors")
        .delete()
        .eq("id", vendorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
}

export function useVendorsByService(serviceCategory: string | null) {
  return useQuery({
    queryKey: ["vendors-by-service", serviceCategory],
    queryFn: async () => {
      if (!serviceCategory) return [];
      const { data, error } = await supabase
        .from("vendors")
        .select("id, name")
        .contains("service_types", [serviceCategory])
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!serviceCategory,
  });
}
