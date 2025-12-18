import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRoleRow {
  user_id: string;
  email: string;
  created_at: string;
  role: AppRole | null;
  role_created_at: string | null;
}

export interface MergedUser {
  user_id: string;
  email: string;
  created_at: string;
  roles: AppRole[];
}

interface UserInvitation {
  id: string;
  email: string;
  role: AppRole;
  invited_by: string;
  notes: string | null;
  status: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}

// Single combined query for all users with their roles
export function useAllUsersWithRoles() {
  return useQuery({
    queryKey: ["all-users-with-roles"],
    queryFn: async () => {
      console.log("Fetching all users with roles...");
      const { data, error } = await supabase.rpc("get_all_users_with_roles");

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
      
      console.log("Raw RPC data:", data);
      
      // Process flat results into grouped MergedUser structure
      const userMap = new Map<string, MergedUser>();
      
      for (const row of (data as UserWithRoleRow[])) {
        if (!userMap.has(row.user_id)) {
          userMap.set(row.user_id, {
            user_id: row.user_id,
            email: row.email,
            created_at: row.created_at,
            roles: [],
          });
        }
        
        if (row.role) {
          userMap.get(row.user_id)!.roles.push(row.role);
        }
      }
      
      const users = Array.from(userMap.values());
      // Sort: users with roles first
      users.sort((a, b) => {
        if (a.roles.length > 0 && b.roles.length === 0) return -1;
        if (a.roles.length === 0 && b.roles.length > 0) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      console.log("Processed users:", users);
      return users;
    },
  });
}

export function useAddUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      console.log("Adding role:", { userId, role });
      const { data, error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role })
        .select()
        .single();

      if (error) {
        console.error("Error adding role:", error);
        throw error;
      }
      console.log("Role added successfully:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users-with-roles"] });
    },
  });
}

export function useRemoveUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      console.log("Removing role:", { userId, role });
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) {
        console.error("Error removing role:", error);
        throw error;
      }
      console.log("Role removed successfully");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users-with-roles"] });
    },
  });
}

// Invitation hooks
export function usePendingInvitations() {
  return useQuery({
    queryKey: ["pending-invitations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_invitations")
        .select("*")
        .in("status", ["pending", "expired"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserInvitation[];
    },
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      email, 
      role, 
      notes 
    }: { 
      email: string; 
      role: AppRole; 
      notes?: string 
    }) => {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session?.access_token) {
        throw new Error("Not authenticated");
      }

      const response = await supabase.functions.invoke("invite-user", {
        body: { email, role, notes },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to send invitation");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
    },
  });
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("user_invitations")
        .update({ status: "revoked" })
        .eq("id", invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
    },
  });
}
