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
      activities: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          occurred_at: string
          owner_id: string | null
          payload: Json
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          occurred_at?: string
          owner_id?: string | null
          payload?: Json
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          occurred_at?: string
          owner_id?: string | null
          payload?: Json
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      fiches: {
        Row: {
          availability: string | null
          comment: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_role: string | null
          created_at: string
          damage_location: string | null
          damage_type: string | null
          id: string
          immobilized: boolean | null
          insurance_contract: string | null
          insurance_glass_covered: string | null
          insurance_name: string | null
          intervention_address: string | null
          intervention_place: string | null
          lead_id: string
          no_insurance: boolean
          owner_id: string
          updated_at: string
          vehicle_brand_model: string | null
          vehicle_plate: string | null
          vehicle_type: string | null
          vehicles: Json
        }
        Insert: {
          availability?: string | null
          comment?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_role?: string | null
          created_at?: string
          damage_location?: string | null
          damage_type?: string | null
          id?: string
          immobilized?: boolean | null
          insurance_contract?: string | null
          insurance_glass_covered?: string | null
          insurance_name?: string | null
          intervention_address?: string | null
          intervention_place?: string | null
          lead_id: string
          no_insurance?: boolean
          owner_id: string
          updated_at?: string
          vehicle_brand_model?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
          vehicles?: Json
        }
        Update: {
          availability?: string | null
          comment?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_role?: string | null
          created_at?: string
          damage_location?: string | null
          damage_type?: string | null
          id?: string
          immobilized?: boolean | null
          insurance_contract?: string | null
          insurance_glass_covered?: string | null
          insurance_name?: string | null
          intervention_address?: string | null
          intervention_place?: string | null
          lead_id?: string
          no_insurance?: boolean
          owner_id?: string
          updated_at?: string
          vehicle_brand_model?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
          vehicles?: Json
        }
        Relationships: [
          {
            foreignKeyName: "fiches_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_tags: {
        Row: {
          lead_id: string
          tag_id: string
        }
        Insert: {
          lead_id: string
          tag_id: string
        }
        Update: {
          lead_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_tags_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          city: string | null
          closed_date: string | null
          company: string | null
          contact_name: string | null
          country: string | null
          created_at: string
          created_by: string | null
          department: string | null
          email: string | null
          id: string
          metadata: Json
          name: string
          next_actions: Json
          notes: string | null
          owner_id: string | null
          phone: string | null
          pipeline_id: string | null
          probability: number | null
          region: string | null
          siret: string | null
          stage: string
          updated_at: string
          updated_by: string | null
          value: number | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          closed_date?: string | null
          company?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          email?: string | null
          id: string
          metadata?: Json
          name: string
          next_actions?: Json
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          pipeline_id?: string | null
          probability?: number | null
          region?: string | null
          siret?: string | null
          stage?: string
          updated_at?: string
          updated_by?: string | null
          value?: number | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          closed_date?: string | null
          company?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          email?: string | null
          id?: string
          metadata?: Json
          name?: string
          next_actions?: Json
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          pipeline_id?: string | null
          probability?: number | null
          region?: string | null
          siret?: string | null
          stage?: string
          updated_at?: string
          updated_by?: string | null
          value?: number | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          kind: string
          payload: Json
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          payload?: Json
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          payload?: Json
          read_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pipeline_members: {
        Row: {
          created_at: string
          pipeline_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          pipeline_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          pipeline_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_members_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          owner_id: string | null
          stages: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id: string
          name: string
          owner_id?: string | null
          stages?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          stages?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          owner_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          owner_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          owner_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_pipeline: { Args: { p_pipeline_id: string }; Returns: boolean }
      can_write_pipeline: { Args: { p_pipeline_id: string }; Returns: boolean }
      resolve_user_by_email: { Args: { p_email: string }; Returns: string }
      resolve_user_emails: {
        Args: { p_user_ids: string[] }
        Returns: {
          email: string
          id: string
        }[]
      }
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
