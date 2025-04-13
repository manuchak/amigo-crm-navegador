export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      custodio_validations: {
        Row: {
          additional_notes: string | null
          age_requirement_met: boolean | null
          background_check_passed: boolean | null
          call_quality_score: number | null
          communication_score: number | null
          created_at: string
          has_firearm_license: boolean | null
          has_military_background: boolean | null
          has_security_experience: boolean | null
          has_vehicle: boolean | null
          id: string
          interview_passed: boolean | null
          lead_id: number
          rejection_reason: string | null
          reliability_score: number | null
          status: string
          updated_at: string
          validated_by: string | null
          validation_date: string
          validation_duration_seconds: number | null
        }
        Insert: {
          additional_notes?: string | null
          age_requirement_met?: boolean | null
          background_check_passed?: boolean | null
          call_quality_score?: number | null
          communication_score?: number | null
          created_at?: string
          has_firearm_license?: boolean | null
          has_military_background?: boolean | null
          has_security_experience?: boolean | null
          has_vehicle?: boolean | null
          id?: string
          interview_passed?: boolean | null
          lead_id: number
          rejection_reason?: string | null
          reliability_score?: number | null
          status?: string
          updated_at?: string
          validated_by?: string | null
          validation_date?: string
          validation_duration_seconds?: number | null
        }
        Update: {
          additional_notes?: string | null
          age_requirement_met?: boolean | null
          background_check_passed?: boolean | null
          call_quality_score?: number | null
          communication_score?: number | null
          created_at?: string
          has_firearm_license?: boolean | null
          has_military_background?: boolean | null
          has_security_experience?: boolean | null
          has_vehicle?: boolean | null
          id?: string
          interview_passed?: boolean | null
          lead_id?: number
          rejection_reason?: string | null
          reliability_score?: number | null
          status?: string
          updated_at?: string
          validated_by?: string | null
          validation_date?: string
          validation_duration_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "custodio_validations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          anovehiculo: string | null
          call_count: number
          created_at: string
          credencialsedena: string | null
          email: string | null
          empresa: string | null
          esarmado: string | null
          esmilitar: string | null
          estado: string | null
          experienciaseguridad: string | null
          fecha_creacion: string | null
          fuente: string | null
          id: number
          last_call_date: string | null
          modelovehiculo: string | null
          nombre: string | null
          original_id: number | null
          telefono: string | null
          tienevehiculo: string | null
          valor: number | null
        }
        Insert: {
          anovehiculo?: string | null
          call_count?: number
          created_at?: string
          credencialsedena?: string | null
          email?: string | null
          empresa?: string | null
          esarmado?: string | null
          esmilitar?: string | null
          estado?: string | null
          experienciaseguridad?: string | null
          fecha_creacion?: string | null
          fuente?: string | null
          id?: number
          last_call_date?: string | null
          modelovehiculo?: string | null
          nombre?: string | null
          original_id?: number | null
          telefono?: string | null
          tienevehiculo?: string | null
          valor?: number | null
        }
        Update: {
          anovehiculo?: string | null
          call_count?: number
          created_at?: string
          credencialsedena?: string | null
          email?: string | null
          empresa?: string | null
          esarmado?: string | null
          esmilitar?: string | null
          estado?: string | null
          experienciaseguridad?: string | null
          fecha_creacion?: string | null
          fuente?: string | null
          id?: number
          last_call_date?: string | null
          modelovehiculo?: string | null
          nombre?: string | null
          original_id?: number | null
          telefono?: string | null
          tienevehiculo?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string
          id: string
          last_login: string
          photo_url: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          email: string
          id: string
          last_login?: string
          photo_url?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          last_login?: string
          photo_url?: string | null
        }
        Relationships: []
      }
      secrets: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          channel: string
          created_at: string
          customer_email: string
          customer_id: string | null
          customer_name: string
          description: string
          id: string
          priority: string
          resolution_time_seconds: number | null
          resolved_at: string | null
          status: string
          subject: string
          ticket_number: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          channel?: string
          created_at?: string
          customer_email: string
          customer_id?: string | null
          customer_name: string
          description: string
          id?: string
          priority?: string
          resolution_time_seconds?: number | null
          resolved_at?: string | null
          status?: string
          subject: string
          ticket_number: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          channel?: string
          created_at?: string
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          description?: string
          id?: string
          priority?: string
          resolution_time_seconds?: number | null
          resolved_at?: string | null
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      table_name: {
        Row: {
          data: Json | null
          id: number
          inserted_at: string
          name: string | null
          updated_at: string
        }
        Insert: {
          data?: Json | null
          id?: number
          inserted_at?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          data?: Json | null
          id?: number
          inserted_at?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ticket_comments: {
        Row: {
          author_email: string
          author_name: string
          content: string
          created_at: string
          id: string
          is_internal: boolean
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          author_email: string
          author_name: string
          content: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          author_email?: string
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_history: {
        Row: {
          action: string
          created_at: string
          field_name: string
          id: string
          new_value: string | null
          previous_value: string | null
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          field_name: string
          id?: string
          new_value?: string | null
          previous_value?: string | null
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          field_name?: string
          id?: string
          new_value?: string | null
          previous_value?: string | null
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_history_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_satisfaction: {
        Row: {
          created_at: string
          feedback: string | null
          id: string
          rating: number
          ticket_id: string
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          id?: string
          rating: number
          ticket_id: string
        }
        Update: {
          created_at?: string
          feedback?: string | null
          id?: string
          rating?: number
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_satisfaction_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_tags: {
        Row: {
          created_at: string
          id: string
          tag_name: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tag_name: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tag_name?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_tags_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      validated_leads: {
        Row: {
          car_brand: string | null
          car_model: string | null
          car_year: number | null
          created_at: string
          custodio_name: string | null
          id: number
          security_exp: string | null
          sedena_id: string | null
        }
        Insert: {
          car_brand?: string | null
          car_model?: string | null
          car_year?: number | null
          created_at?: string
          custodio_name?: string | null
          id?: number
          security_exp?: string | null
          sedena_id?: string | null
        }
        Update: {
          car_brand?: string | null
          car_model?: string | null
          car_year?: number | null
          created_at?: string
          custodio_name?: string | null
          id?: number
          security_exp?: string | null
          sedena_id?: string | null
        }
        Relationships: []
      }
      vapi_call_logs: {
        Row: {
          assistant_id: string
          assistant_name: string | null
          assistant_phone_number: string | null
          call_type: string | null
          caller_phone_number: string | null
          conversation_id: string | null
          cost: number | null
          created_at: string | null
          customer_number: string | null
          direction: string | null
          duration: number | null
          end_time: string | null
          ended_reason: string | null
          id: string
          log_id: string
          metadata: Json | null
          organization_id: string
          phone_number: string | null
          recording_url: string | null
          start_time: string | null
          status: string | null
          success_evaluation: string | null
          transcript: Json | null
          updated_at: string | null
        }
        Insert: {
          assistant_id: string
          assistant_name?: string | null
          assistant_phone_number?: string | null
          call_type?: string | null
          caller_phone_number?: string | null
          conversation_id?: string | null
          cost?: number | null
          created_at?: string | null
          customer_number?: string | null
          direction?: string | null
          duration?: number | null
          end_time?: string | null
          ended_reason?: string | null
          id?: string
          log_id: string
          metadata?: Json | null
          organization_id: string
          phone_number?: string | null
          recording_url?: string | null
          start_time?: string | null
          status?: string | null
          success_evaluation?: string | null
          transcript?: Json | null
          updated_at?: string | null
        }
        Update: {
          assistant_id?: string
          assistant_name?: string | null
          assistant_phone_number?: string | null
          call_type?: string | null
          caller_phone_number?: string | null
          conversation_id?: string | null
          cost?: number | null
          created_at?: string | null
          customer_number?: string | null
          direction?: string | null
          duration?: number | null
          end_time?: string | null
          ended_reason?: string | null
          id?: string
          log_id?: string
          metadata?: Json | null
          organization_id?: string
          phone_number?: string | null
          recording_url?: string | null
          start_time?: string | null
          status?: string | null
          success_evaluation?: string | null
          transcript?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      custodio_validation_stats: {
        Row: {
          avg_call_quality: number | null
          avg_communication: number | null
          avg_duration: number | null
          avg_reliability: number | null
          status: string | null
          validation_count: number | null
          validation_day: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_qualified_leads_from_calls: {
        Args: Record<PropertyKey, never>
        Returns: {
          lead_id: number
          lead_name: string
          lead_phone: string
          call_count: number
          last_call_date: string
          transcript: Json
        }[]
      }
      get_user_role: {
        Args: { user_uid: string }
        Returns: string
      }
      has_role: {
        Args: { user_uid: string; required_role: string }
        Returns: boolean
      }
      update_user_role: {
        Args: { target_user_id: string; new_role: string }
        Returns: undefined
      }
      verify_user_email: {
        Args: { target_user_id: string }
        Returns: undefined
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
