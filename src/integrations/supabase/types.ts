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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      notifications: {
        Row: {
          created_at: string
          description: string | null
          id: string
          link: string | null
          read_at: string | null
          resolved_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          link?: string | null
          read_at?: string | null
          resolved_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          link?: string | null
          read_at?: string | null
          resolved_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      order_riders: {
        Row: {
          created_at: string
          id: string
          order_id: string
          rider_id: string
          status: Database["public"]["Enums"]["assignment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          rider_id: string
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          rider_id?: string
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_riders_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "riders"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_accounts: {
        Row: {
          account_name: string
          account_number: string
          bank_name: string
          created_at: string
          id: string
          is_primary: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          bank_name: string
          created_at?: string
          id?: string
          is_primary?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_name?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_info: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          personal_email: string | null
          personal_phone: string | null
          personal_phone_verified: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          personal_email?: string | null
          personal_phone?: string | null
          personal_phone_verified?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          personal_email?: string | null
          personal_phone?: string | null
          personal_phone_verified?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          currency: string
          features: Json
          id: string
          name: string
          price_monthly: number
          sort_order: number
          tagline: string | null
          tier: Database["public"]["Enums"]["plan_tier"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          name: string
          price_monthly?: number
          sort_order?: number
          tagline?: string | null
          tier: Database["public"]["Enums"]["plan_tier"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          name?: string
          price_monthly?: number
          sort_order?: number
          tagline?: string | null
          tier?: Database["public"]["Enums"]["plan_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      pre_order_settings: {
        Row: {
          created_at: string
          enabled: boolean
          end_time: string
          id: string
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          end_time?: string
          id?: string
          start_time?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          end_time?: string
          id?: string
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          business_address: string | null
          business_email_verified: boolean
          business_lat: number | null
          business_lng: number | null
          business_name: string | null
          business_registered: boolean | null
          created_at: string
          email: string | null
          id: string
          is_owner: boolean | null
          logo_url: string | null
          personal_phone_verified: boolean
          phone: string | null
          profile_completed: boolean
          setup_completed: boolean
          setup_step: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          business_address?: string | null
          business_email_verified?: boolean
          business_lat?: number | null
          business_lng?: number | null
          business_name?: string | null
          business_registered?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          is_owner?: boolean | null
          logo_url?: string | null
          personal_phone_verified?: boolean
          phone?: string | null
          profile_completed?: boolean
          setup_completed?: boolean
          setup_step?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          business_address?: string | null
          business_email_verified?: boolean
          business_lat?: number | null
          business_lng?: number | null
          business_name?: string | null
          business_registered?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          is_owner?: boolean | null
          logo_url?: string | null
          personal_phone_verified?: boolean
          phone?: string | null
          profile_completed?: boolean
          setup_completed?: boolean
          setup_step?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      riders: {
        Row: {
          available: boolean
          avatar_url: string | null
          created_at: string
          distance_km: number
          id: string
          name: string
          phone: string | null
          rating: number
        }
        Insert: {
          available?: boolean
          avatar_url?: string | null
          created_at?: string
          distance_km?: number
          id?: string
          name: string
          phone?: string | null
          rating?: number
        }
        Update: {
          available?: boolean
          avatar_url?: string | null
          created_at?: string
          distance_km?: number
          id?: string
          name?: string
          phone?: string | null
          rating?: number
        }
        Relationships: []
      }
      transactions: {
        Row: {
          commission_amount: number
          commission_rate: number
          created_at: string
          description: string | null
          gross_amount: number
          id: string
          net_amount: number
          order_id: string | null
          receiver: string | null
          reference: string
          sender: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          description?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          order_id?: string | null
          receiver?: string | null
          reference?: string
          sender?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          description?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          order_id?: string | null
          receiver?: string | null
          reference?: string
          sender?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          plan_id: string
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          plan_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          plan_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          available_balance: number
          created_at: string
          id: string
          lifetime_earnings: number
          pending_balance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available_balance?: number
          created_at?: string
          id?: string
          lifetime_earnings?: number
          pending_balance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available_balance?: number
          created_at?: string
          id?: string
          lifetime_earnings?: number
          pending_balance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      verify_transaction: {
        Args: { _reference: string }
        Returns: {
          business_name: string
          created_at: string
          net_amount: number
          reference: string
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
        }[]
      }
    }
    Enums: {
      assignment_status:
        | "requested"
        | "accepted"
        | "rejected"
        | "completed"
        | "cancelled"
      notification_type: "order" | "payment" | "profile" | "system"
      plan_tier: "standard" | "pro" | "premium"
      subscription_status: "active" | "pending" | "cancelled" | "expired"
      transaction_status: "pending" | "completed" | "failed"
      transaction_type: "sale" | "payout" | "refund" | "adjustment"
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
      assignment_status: [
        "requested",
        "accepted",
        "rejected",
        "completed",
        "cancelled",
      ],
      notification_type: ["order", "payment", "profile", "system"],
      plan_tier: ["standard", "pro", "premium"],
      subscription_status: ["active", "pending", "cancelled", "expired"],
      transaction_status: ["pending", "completed", "failed"],
      transaction_type: ["sale", "payout", "refund", "adjustment"],
    },
  },
} as const
