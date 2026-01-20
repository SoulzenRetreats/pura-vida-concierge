import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import i18n from "@/lib/i18n";

export interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_es: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryInsert {
  slug: string;
  name_en: string;
  name_es: string;
  icon?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface CategoryUpdate {
  id: string;
  slug?: string;
  name_en?: string;
  name_es?: string;
  icon?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

// Helper function to get localized category name
export function getCategoryName(category: Category | undefined, language?: string): string {
  if (!category) return "";
  const lang = language || i18n.language || "en";
  return lang === "es" ? category.name_es : category.name_en;
}

// Helper function to get category name by slug
export function getCategoryNameBySlug(
  categories: Category[] | undefined,
  slug: string,
  language?: string
): string {
  if (!categories) return slug;
  const category = categories.find((c) => c.slug === slug);
  return category ? getCategoryName(category, language) : slug;
}

// Fetch active categories (for public use - filters, dropdowns)
export function useCategories() {
  return useQuery({
    queryKey: ["categories", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
  });
}

// Fetch all categories (for admin management)
export function useAllCategories() {
  return useQuery({
    queryKey: ["categories", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
  });
}

// Create a new category
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: CategoryInsert) => {
      const { data, error } = await supabase
        .from("categories")
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

// Update a category
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: CategoryUpdate) => {
      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

// Delete a category
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

// Check if a category has services assigned
export function useCategoryServiceCount(categorySlug: string | null) {
  return useQuery({
    queryKey: ["category-service-count", categorySlug],
    queryFn: async () => {
      if (!categorySlug) return 0;

      const { count, error } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("category", categorySlug);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!categorySlug,
  });
}
