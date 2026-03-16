import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  first_name: string | null;
  whatsapp_number: string | null;
  slug: string | null;
  contact_email: string | null;
}

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, whatsapp_number, slug, contact_email")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
  });
}

export function useProfileBySlug(slug: string) {
  return useQuery({
    queryKey: ["profile-by-slug", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, whatsapp_number, slug, contact_email")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      firstName,
      whatsappNumber,
      slug,
      contactEmail,
    }: {
      userId: string;
      firstName: string | null;
      whatsappNumber: string | null;
      slug?: string | null;
      contactEmail?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          first_name: firstName,
          whatsapp_number: whatsappNumber,
          slug: slug ?? null,
          contact_email: contactEmail ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["profile", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["all-users-with-roles"] });
      queryClient.invalidateQueries({ queryKey: ["profile-by-slug"] });
    },
  });
}

export function useConciergeContact() {
  return useQuery({
    queryKey: ["concierge-contact"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_concierge_contact");
      if (error) throw error;
      return (data as { first_name: string; whatsapp_number: string }[])?.[0] ?? null;
    },
  });
}

/** Fetch all profiles that have admin/staff roles (for concierge assignment dropdowns) */
export function useConciergeProfiles() {
  return useQuery({
    queryKey: ["concierge-profiles"],
    queryFn: async () => {
      // Get users with roles first
      const { data: usersWithRoles, error: rolesError } = await supabase.rpc("get_all_users_with_roles");
      if (rolesError) throw rolesError;

      // Get unique user IDs that have admin or staff roles
      const roleUserIds = [...new Set(
        (usersWithRoles || [])
          .filter((u: any) => u.role === "admin" || u.role === "staff")
          .map((u: any) => u.user_id)
      )];

      if (roleUserIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, slug, contact_email")
        .in("id", roleUserIds);

      if (profilesError) throw profilesError;

      // Merge email from usersWithRoles
      return (profiles || []).map((p: any) => {
        const userRecord = (usersWithRoles || []).find((u: any) => u.user_id === p.id);
        return { ...p, email: userRecord?.email ?? null };
      });
    },
  });
}
