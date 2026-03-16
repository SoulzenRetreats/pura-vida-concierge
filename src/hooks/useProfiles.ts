import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  first_name: string | null;
  whatsapp_number: string | null;
}

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, whatsapp_number")
        .eq("id", userId)
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
    }: {
      userId: string;
      firstName: string | null;
      whatsappNumber: string | null;
    }) => {
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          first_name: firstName,
          whatsapp_number: whatsappNumber,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["profile", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["all-users-with-roles"] });
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
