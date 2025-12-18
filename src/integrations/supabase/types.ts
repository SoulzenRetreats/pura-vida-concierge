export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      booking_services: {
        Row: {
          booking_id: string
          price: number | null
          service_id: string
          vendor_id: string | null
        }
        Insert: {
          booking_id: string
          price?: number | null
          service_id: string
          vendor_id?: string | null
        }
        Update: {
          booking_id?: string
          price?: number | null
          service_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_services_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_services_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          assigned_to: string | null
          budget_range: string | null
          check_in: string
          check_out: string
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          dietary_preferences: string | null
          guest_count: number
          id: string
          internal_notes: string | null
          location_details: string | null
          occasion_type: string | null
          preferred_time: string | null
          property_id: string | null
          service_dates: string | null
          special_notes: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          surprise_elements: string | null
          updated_at: string | null
          vibe_preferences: string | null
        }
        Insert: {
          assigned_to?: string | null
          budget_range?: string | null
          check_in: string
          check_out: string
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          dietary_preferences?: string | null
          guest_count: number
          id?: string
          internal_notes?: string | null
          location_details?: string | null
          occasion_type?: string | null
          preferred_time?: string | null
          property_id?: string | null
          service_dates?: string | null
          special_notes?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          surprise_elements?: string | null
          updated_at?: string | null
          vibe_preferences?: string | null
        }
        Update: {
          assigned_to?: string | null
          budget_range?: string | null
          check_in?: string
          check_out?: string
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          dietary_preferences?: string | null
          guest_count?: number
          id?: string
          internal_notes?: string | null
          location_details?: string | null
          occasion_type?: string | null
          preferred_time?: string | null
          property_id?: string | null
          service_dates?: string | null
          special_notes?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          surprise_elements?: string | null
          updated_at?: string | null
          vibe_preferences?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          amenities: string[] | null
          bathrooms: number
          bedrooms: number
          blackout_dates: unknown[] | null
          created_at: string | null
          description: string
          id: string
          location: Database["public"]["Enums"]["location_type"]
          name: string
          photos: string[] | null
          sleeps: number
          updated_at: string | null
        }
        Insert: {
          amenities?: string[] | null
          bathrooms: number
          bedrooms: number
          blackout_dates?: unknown[] | null
          created_at?: string | null
          description: string
          id?: string
          location: Database["public"]["Enums"]["location_type"]
          name: string
          photos?: string[] | null
          sleeps: number
          updated_at?: string | null
        }
        Update: {
          amenities?: string[] | null
          bathrooms?: number
          bedrooms?: number
          blackout_dates?: unknown[] | null
          created_at?: string | null
          description?: string
          id?: string
          location?: Database["public"]["Enums"]["location_type"]
          name?: string
          photos?: string[] | null
          sleeps?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      property_services: {
        Row: {
          property_id: string
          service_id: string
        }
        Insert: {
          property_id: string
          service_id: string
        }
        Update: {
          property_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_services_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_splits: {
        Row: {
          booking_id: string
          calculated_at: string | null
          concierge_share_amount: number | null
          concierge_share_percentage: number | null
          created_at: string | null
          id: string
          notes: string | null
          total_charged: number | null
          updated_at: string | null
          vendor_cost: number | null
        }
        Insert: {
          booking_id: string
          calculated_at?: string | null
          concierge_share_amount?: number | null
          concierge_share_percentage?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          total_charged?: number | null
          updated_at?: string | null
          vendor_cost?: number | null
        }
        Update: {
          booking_id?: string
          calculated_at?: string | null
          concierge_share_amount?: number | null
          concierge_share_percentage?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          total_charged?: number | null
          updated_at?: string | null
          vendor_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_splits_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: Database["public"]["Enums"]["service_category"]
          created_at: string | null
          description: string
          id: string
          name: string
          photos: string[] | null
          price_range: string | null
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string | null
          description: string
          id?: string
          name: string
          photos?: string[] | null
          price_range?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string | null
          description?: string
          id?: string
          name?: string
          photos?: string[] | null
          price_range?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string
          notes: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by: string
          notes?: string | null
          role: Database["public"]["Enums"]["app_role"]
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string
          notes?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          contact_info: string | null
          created_at: string | null
          id: string
          internal_notes: string | null
          name: string
          service_types: string[] | null
          updated_at: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string | null
          id?: string
          internal_notes?: string | null
          name: string
          service_types?: string[] | null
          updated_at?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string | null
          id?: string
          internal_notes?: string | null
          name?: string
          service_types?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_users_with_roles: {
        Args: never
        Returns: {
          email: string
          role: Database["public"]["Enums"]["app_role"]
          role_created_at: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff"
      booking_status:
        | "new_request"
        | "in_review"
        | "quote_sent"
        | "confirmed"
        | "completed"
      location_type: "jaco" | "la_fortuna"
      service_category:
        | "chef"
        | "transportation"
        | "adventure"
        | "spa"
        | "tours"
        | "celebrations"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff"],
      booking_status: [
        "new_request",
        "in_review",
        "quote_sent",
        "confirmed",
        "completed",
      ],
      location_type: ["jaco", "la_fortuna"],
      service_category: [
        "chef",
        "transportation",
        "adventure",
        "spa",
        "tours",
        "celebrations",
        "other",
      ],
    },
  },
} as const
