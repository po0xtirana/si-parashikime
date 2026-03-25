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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bets: {
        Row: {
          amount: number
          created_at: string
          id: string
          is_public: boolean
          market_id: string
          odds_at_time_of_bet: number
          payout: number | null
          prediction: boolean
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          is_public?: boolean
          market_id: string
          odds_at_time_of_bet: number
          payout?: number | null
          prediction: boolean
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          is_public?: boolean
          market_id?: string
          odds_at_time_of_bet?: number
          payout?: number | null
          prediction?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bets_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          article_url: string | null
          category: Database["public"]["Enums"]["market_category"]
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string
          id: string
          image_url: string | null
          seed_no: number
          seed_yes: number
          status: Database["public"]["Enums"]["market_status"]
          title: string
          total_no: number
          total_yes: number
          updated_at: string
          winning_outcome: boolean | null
        }
        Insert: {
          article_url?: string | null
          category?: Database["public"]["Enums"]["market_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time: string
          id?: string
          image_url?: string | null
          seed_no?: number
          seed_yes?: number
          status?: Database["public"]["Enums"]["market_status"]
          title: string
          total_no?: number
          total_yes?: number
          updated_at?: string
          winning_outcome?: boolean | null
        }
        Update: {
          article_url?: string | null
          category?: Database["public"]["Enums"]["market_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string
          id?: string
          image_url?: string | null
          seed_no?: number
          seed_yes?: number
          status?: Database["public"]["Enums"]["market_status"]
          title?: string
          total_no?: number
          total_yes?: number
          updated_at?: string
          winning_outcome?: boolean | null
        }
        Relationships: []
      }
      price_history: {
        Row: {
          id: string
          market_id: string
          timestamp: string
          yes_probability: number
        }
        Insert: {
          id?: string
          market_id: string
          timestamp?: string
          yes_probability: number
        }
        Update: {
          id?: string
          market_id?: string
          timestamp?: string
          yes_probability?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_history_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accuracy_rate: number
          balance: number
          correct_predictions: number
          created_at: string
          id: string
          is_verified: boolean
          last_daily_claim: string | null
          total_predictions: number
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          accuracy_rate?: number
          balance?: number
          correct_predictions?: number
          created_at?: string
          id?: string
          is_verified?: boolean
          last_daily_claim?: string | null
          total_predictions?: number
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          accuracy_rate?: number
          balance?: number
          correct_predictions?: number
          created_at?: string
          id?: string
          is_verified?: boolean
          last_daily_claim?: string | null
          total_predictions?: number
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_daily_credits: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      place_bet: {
        Args: { p_amount: number; p_is_public?: boolean; p_market_id: string; p_prediction: boolean }
        Returns: Json
      }
      resolve_market: {
        Args: { p_market_id: string; p_winning_outcome: boolean }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
      market_category:
        | "Politics"
        | "Sports"
        | "Economy"
        | "Entertainment"
        | "Technology"
        | "Other"
      market_status: "open" | "locked" | "resolved"
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
      app_role: ["admin", "editor", "user"],
      market_category: [
        "Politics",
        "Sports",
        "Economy",
        "Entertainment",
        "Technology",
        "Other",
      ],
      market_status: ["open", "locked", "resolved"],
    },
  },
} as const
