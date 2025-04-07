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
      [_ in never]: never
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
