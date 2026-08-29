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
      beta_codes: {
        Row: {
          code: string
          created_at: string
          disabled: boolean
          expires_at: string | null
          id: string
          max_uses: number
          note: string
          tier: string
        }
        Insert: {
          code: string
          created_at?: string
          disabled?: boolean
          expires_at?: string | null
          id?: string
          max_uses?: number
          note?: string
          tier?: string
        }
        Update: {
          code?: string
          created_at?: string
          disabled?: boolean
          expires_at?: string | null
          id?: string
          max_uses?: number
          note?: string
          tier?: string
        }
        Relationships: []
      }
      beta_redemptions: {
        Row: {
          code: string
          created_at: string
          email: string
          id: string
          tier: string
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          id?: string
          tier?: string
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          id?: string
          tier?: string
        }
        Relationships: []
      }
      community_submissions: {
        Row: {
          created_at: string
          id: string
          photo_path: string
          reviewed_at: string | null
          share_code: string
          status: string
          story: string
          tagline: string
          tier: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo_path: string
          reviewed_at?: string | null
          share_code: string
          status?: string
          story?: string
          tagline?: string
          tier?: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          photo_path?: string
          reviewed_at?: string | null
          share_code?: string
          status?: string
          story?: string
          tagline?: string
          tier?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_picks: {
        Row: {
          id: string
          picked_at: string
          puzzle_id: string
        }
        Insert: {
          id?: string
          picked_at?: string
          puzzle_id: string
        }
        Update: {
          id?: string
          picked_at?: string
          puzzle_id?: string
        }
        Relationships: []
      }
      daily_subscribers: {
        Row: {
          created_at: string
          daily: boolean | null
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          daily?: boolean | null
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          daily?: boolean | null
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      pictaria_reports: {
        Row: {
          created_at: string
          id: string
          note: string
          share_code: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string
          share_code: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          share_code?: string
        }
        Relationships: []
      }
      pictarias: {
        Row: {
          created_at: string
          grid: number
          id: string
          photo_paths: string[]
          share_code: string
          story: string
          tagline: string
          tier: string
          title: string
        }
        Insert: {
          created_at?: string
          grid?: number
          id?: string
          photo_paths?: string[]
          share_code: string
          story?: string
          tagline?: string
          tier?: string
          title?: string
        }
        Update: {
          created_at?: string
          grid?: number
          id?: string
          photo_paths?: string[]
          share_code?: string
          story?: string
          tagline?: string
          tier?: string
          title?: string
        }
        Relationships: []
      }
      portal_businesses: {
        Row: {
          category: string
          company_name: string
          contact_person: string
          created_at: string
          email: string
          follow_up: string
          id: string
          marketing_ideas: string
          notes: string
          phone: string
          photo_path: string
          product_service: string
          share_code: string | null
          status: string
          story_ideas: string
          transcript: string
          updated_at: string
          website: string
        }
        Insert: {
          category?: string
          company_name?: string
          contact_person?: string
          created_at?: string
          email?: string
          follow_up?: string
          id?: string
          marketing_ideas?: string
          notes?: string
          phone?: string
          photo_path?: string
          product_service?: string
          share_code?: string | null
          status?: string
          story_ideas?: string
          transcript?: string
          updated_at?: string
          website?: string
        }
        Update: {
          category?: string
          company_name?: string
          contact_person?: string
          created_at?: string
          email?: string
          follow_up?: string
          id?: string
          marketing_ideas?: string
          notes?: string
          phone?: string
          photo_path?: string
          product_service?: string
          share_code?: string | null
          status?: string
          story_ideas?: string
          transcript?: string
          updated_at?: string
          website?: string
        }
        Relationships: []
      }
      push_job_state: {
        Row: {
          cron_token: string
          id: string
          last_medley_at: string | null
          last_run_at: string | null
          lease_until: string | null
          paused: boolean
          paused_reason: string | null
          updated_at: string
        }
        Insert: {
          cron_token?: string
          id: string
          last_medley_at?: string | null
          last_run_at?: string | null
          lease_until?: string | null
          paused?: boolean
          paused_reason?: string | null
          updated_at?: string
        }
        Update: {
          cron_token?: string
          id?: string
          last_medley_at?: string | null
          last_run_at?: string | null
          lease_until?: string | null
          paused?: boolean
          paused_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      push_medleys: {
        Row: {
          albums: string[]
          body: string
          created_at: string
          failed_count: number
          id: string
          sent_at: string | null
          sent_count: number
          title: string
          url: string
        }
        Insert: {
          albums?: string[]
          body: string
          created_at?: string
          failed_count?: number
          id?: string
          sent_at?: string | null
          sent_count?: number
          title: string
          url?: string
        }
        Update: {
          albums?: string[]
          body?: string
          created_at?: string
          failed_count?: number
          id?: string
          sent_at?: string | null
          sent_count?: number
          title?: string
          url?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          active: boolean
          auth: string
          created_at: string
          endpoint: string
          id: string
          last_sent_at: string | null
          p256dh: string
          user_agent: string | null
        }
        Insert: {
          active?: boolean
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          last_sent_at?: string | null
          p256dh: string
          user_agent?: string | null
        }
        Update: {
          active?: boolean
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          last_sent_at?: string | null
          p256dh?: string
          user_agent?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      trigger_push_medley: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
