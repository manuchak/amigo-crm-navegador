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
      car_brands: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      car_models: {
        Row: {
          brand_id: number
          created_at: string
          id: number
          name: string
        }
        Insert: {
          brand_id: number
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          brand_id?: number
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_models_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "car_brands"
            referencedColumns: ["id"]
          },
        ]
      }
      custodio_excel_data: {
        Row: {
          calificacion_promedio: number | null
          confiabilidad: number | null
          created_at: string
          estado: string | null
          fecha_cita: string | null
          id: number
          ingresos: number | null
          meses_activo: number | null
          nombre_custodio: string | null
          tiempo_respuesta: number | null
          trabajos_completados: number | null
          valor_vida_cliente: number | null
        }
        Insert: {
          calificacion_promedio?: number | null
          confiabilidad?: number | null
          created_at?: string
          estado?: string | null
          fecha_cita?: string | null
          id?: number
          ingresos?: number | null
          meses_activo?: number | null
          nombre_custodio?: string | null
          tiempo_respuesta?: number | null
          trabajos_completados?: number | null
          valor_vida_cliente?: number | null
        }
        Update: {
          calificacion_promedio?: number | null
          confiabilidad?: number | null
          created_at?: string
          estado?: string | null
          fecha_cita?: string | null
          id?: number
          ingresos?: number | null
          meses_activo?: number | null
          nombre_custodio?: string | null
          tiempo_respuesta?: number | null
          trabajos_completados?: number | null
          valor_vida_cliente?: number | null
        }
        Relationships: []
      }
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
          lifetime_id: string | null
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
          lifetime_id?: string | null
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
          lifetime_id?: string | null
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
          {
            foreignKeyName: "custodio_validations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["lead_id"]
          },
        ]
      }
      driver_behavior_scores: {
        Row: {
          client: string
          created_at: string
          distance: number | null
          distance_text: string | null
          driver_group: string
          driver_name: string
          duration_interval: unknown | null
          duration_text: string | null
          end_date: string
          id: number
          penalty_points: number
          score: number
          start_date: string
          trips_count: number
          updated_at: string
        }
        Insert: {
          client: string
          created_at?: string
          distance?: number | null
          distance_text?: string | null
          driver_group: string
          driver_name: string
          duration_interval?: unknown | null
          duration_text?: string | null
          end_date: string
          id?: number
          penalty_points: number
          score: number
          start_date: string
          trips_count: number
          updated_at?: string
        }
        Update: {
          client?: string
          created_at?: string
          distance?: number | null
          distance_text?: string | null
          driver_group?: string
          driver_name?: string
          duration_interval?: unknown | null
          duration_text?: string | null
          end_date?: string
          id?: number
          penalty_points?: number
          score?: number
          start_date?: string
          trips_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      gps_installations: {
        Row: {
          created_at: string
          date: string
          email: string | null
          id: string
          install_address: Json
          installer_id: number
          notes: string | null
          owner_name: string
          status: string | null
          time: string
          timezone: string
          updated_at: string
          user_id: string | null
          vehicles: Json
        }
        Insert: {
          created_at?: string
          date: string
          email?: string | null
          id?: string
          install_address: Json
          installer_id: number
          notes?: string | null
          owner_name: string
          status?: string | null
          time: string
          timezone?: string
          updated_at?: string
          user_id?: string | null
          vehicles: Json
        }
        Update: {
          created_at?: string
          date?: string
          email?: string | null
          id?: string
          install_address?: Json
          installer_id?: number
          notes?: string | null
          owner_name?: string
          status?: string | null
          time?: string
          timezone?: string
          updated_at?: string
          user_id?: string | null
          vehicles?: Json
        }
        Relationships: [
          {
            foreignKeyName: "gps_installations_installer_id_fkey"
            columns: ["installer_id"]
            isOneToOne: false
            referencedRelation: "gps_installers"
            referencedColumns: ["id"]
          },
        ]
      }
      gps_installers: {
        Row: {
          certificaciones: string | null
          comentarios: string | null
          created_at: string
          direccion_personal: string | null
          direccion_personal_city: string | null
          direccion_personal_colonia: string | null
          direccion_personal_number: string | null
          direccion_personal_postal_code: string | null
          direccion_personal_references: string | null
          direccion_personal_state: string | null
          direccion_personal_street: string | null
          email: string | null
          foto_instalador: string | null
          id: number
          nombre: string
          rfc: string | null
          taller: boolean | null
          taller_direccion: string | null
          taller_direccion_city: string | null
          taller_direccion_colonia: string | null
          taller_direccion_number: string | null
          taller_direccion_postal_code: string | null
          taller_direccion_references: string | null
          taller_direccion_state: string | null
          taller_direccion_street: string | null
          taller_features: Json
          taller_images: Json | null
          telefono: string | null
          updated_at: string
        }
        Insert: {
          certificaciones?: string | null
          comentarios?: string | null
          created_at?: string
          direccion_personal?: string | null
          direccion_personal_city?: string | null
          direccion_personal_colonia?: string | null
          direccion_personal_number?: string | null
          direccion_personal_postal_code?: string | null
          direccion_personal_references?: string | null
          direccion_personal_state?: string | null
          direccion_personal_street?: string | null
          email?: string | null
          foto_instalador?: string | null
          id?: number
          nombre: string
          rfc?: string | null
          taller?: boolean | null
          taller_direccion?: string | null
          taller_direccion_city?: string | null
          taller_direccion_colonia?: string | null
          taller_direccion_number?: string | null
          taller_direccion_postal_code?: string | null
          taller_direccion_references?: string | null
          taller_direccion_state?: string | null
          taller_direccion_street?: string | null
          taller_features?: Json
          taller_images?: Json | null
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          certificaciones?: string | null
          comentarios?: string | null
          created_at?: string
          direccion_personal?: string | null
          direccion_personal_city?: string | null
          direccion_personal_colonia?: string | null
          direccion_personal_number?: string | null
          direccion_personal_postal_code?: string | null
          direccion_personal_references?: string | null
          direccion_personal_state?: string | null
          direccion_personal_street?: string | null
          email?: string | null
          foto_instalador?: string | null
          id?: number
          nombre?: string
          rfc?: string | null
          taller?: boolean | null
          taller_direccion?: string | null
          taller_direccion_city?: string | null
          taller_direccion_colonia?: string | null
          taller_direccion_number?: string | null
          taller_direccion_postal_code?: string | null
          taller_direccion_references?: string | null
          taller_direccion_state?: string | null
          taller_direccion_street?: string | null
          taller_features?: Json
          taller_images?: Json | null
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      import_progress: {
        Row: {
          created_at: string
          id: string
          message: string | null
          processed: number
          status: string
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          message?: string | null
          processed?: number
          status: string
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          processed?: number
          status?: string
          total?: number
          updated_at?: string
        }
        Relationships: []
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
      role_permissions: {
        Row: {
          allowed: boolean
          created_at: string | null
          id: number
          permission_id: string
          permission_type: string
          role: string
          updated_at: string | null
        }
        Insert: {
          allowed?: boolean
          created_at?: string | null
          id?: never
          permission_id: string
          permission_type: string
          role: string
          updated_at?: string | null
        }
        Update: {
          allowed?: boolean
          created_at?: string | null
          id?: never
          permission_id?: string
          permission_type?: string
          role?: string
          updated_at?: string | null
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
      servicios_custodia: {
        Row: {
          armado: boolean | null
          auto: string | null
          cantidad_transportes: number | null
          casetas: number | null
          cobro_cliente: number | null
          comentarios_adicionales: string | null
          contacto_emergencia: string | null
          costo_custodio: number | null
          creado_por: string | null
          creado_via: string | null
          created_at: string | null
          destino: string | null
          duracion_servicio: unknown | null
          estado: string | null
          fecha_contratacion: string | null
          fecha_hora_asignacion: string | null
          fecha_hora_cita: string | null
          fecha_primer_servicio: string | null
          folio_cliente: string | null
          gadget: string | null
          gadget_solicitado: string | null
          gm_transport_id: string | null
          hora_arribo: string | null
          hora_finalizacion: string | null
          hora_inicio_custodia: string | null
          hora_presentacion: string | null
          id: number
          id_cotizacion: string | null
          id_custodio: string | null
          id_servicio: string | null
          km_extras: number | null
          km_recorridos: number | null
          km_teorico: number | null
          local_foraneo: string | null
          nombre_armado: string | null
          nombre_cliente: string | null
          nombre_custodio: string | null
          nombre_operador_adicional: string | null
          nombre_operador_transporte: string | null
          origen: string | null
          placa: string | null
          placa_carga: string | null
          placa_carga_adicional: string | null
          presentacion: string | null
          proveedor: string | null
          ruta: string | null
          telefono: string | null
          telefono_armado: string | null
          telefono_emergencia: string | null
          telefono_operador: string | null
          telefono_operador_adicional: string | null
          tiempo_estimado: unknown | null
          tiempo_punto_origen: unknown | null
          tiempo_retraso: unknown | null
          tipo_carga: string | null
          tipo_carga_adicional: string | null
          tipo_gadget: string | null
          tipo_servicio: string | null
          tipo_unidad: string | null
          tipo_unidad_adicional: string | null
          updated_time: string | null
        }
        Insert: {
          armado?: boolean | null
          auto?: string | null
          cantidad_transportes?: number | null
          casetas?: number | null
          cobro_cliente?: number | null
          comentarios_adicionales?: string | null
          contacto_emergencia?: string | null
          costo_custodio?: number | null
          creado_por?: string | null
          creado_via?: string | null
          created_at?: string | null
          destino?: string | null
          duracion_servicio?: unknown | null
          estado?: string | null
          fecha_contratacion?: string | null
          fecha_hora_asignacion?: string | null
          fecha_hora_cita?: string | null
          fecha_primer_servicio?: string | null
          folio_cliente?: string | null
          gadget?: string | null
          gadget_solicitado?: string | null
          gm_transport_id?: string | null
          hora_arribo?: string | null
          hora_finalizacion?: string | null
          hora_inicio_custodia?: string | null
          hora_presentacion?: string | null
          id?: number
          id_cotizacion?: string | null
          id_custodio?: string | null
          id_servicio?: string | null
          km_extras?: number | null
          km_recorridos?: number | null
          km_teorico?: number | null
          local_foraneo?: string | null
          nombre_armado?: string | null
          nombre_cliente?: string | null
          nombre_custodio?: string | null
          nombre_operador_adicional?: string | null
          nombre_operador_transporte?: string | null
          origen?: string | null
          placa?: string | null
          placa_carga?: string | null
          placa_carga_adicional?: string | null
          presentacion?: string | null
          proveedor?: string | null
          ruta?: string | null
          telefono?: string | null
          telefono_armado?: string | null
          telefono_emergencia?: string | null
          telefono_operador?: string | null
          telefono_operador_adicional?: string | null
          tiempo_estimado?: unknown | null
          tiempo_punto_origen?: unknown | null
          tiempo_retraso?: unknown | null
          tipo_carga?: string | null
          tipo_carga_adicional?: string | null
          tipo_gadget?: string | null
          tipo_servicio?: string | null
          tipo_unidad?: string | null
          tipo_unidad_adicional?: string | null
          updated_time?: string | null
        }
        Update: {
          armado?: boolean | null
          auto?: string | null
          cantidad_transportes?: number | null
          casetas?: number | null
          cobro_cliente?: number | null
          comentarios_adicionales?: string | null
          contacto_emergencia?: string | null
          costo_custodio?: number | null
          creado_por?: string | null
          creado_via?: string | null
          created_at?: string | null
          destino?: string | null
          duracion_servicio?: unknown | null
          estado?: string | null
          fecha_contratacion?: string | null
          fecha_hora_asignacion?: string | null
          fecha_hora_cita?: string | null
          fecha_primer_servicio?: string | null
          folio_cliente?: string | null
          gadget?: string | null
          gadget_solicitado?: string | null
          gm_transport_id?: string | null
          hora_arribo?: string | null
          hora_finalizacion?: string | null
          hora_inicio_custodia?: string | null
          hora_presentacion?: string | null
          id?: number
          id_cotizacion?: string | null
          id_custodio?: string | null
          id_servicio?: string | null
          km_extras?: number | null
          km_recorridos?: number | null
          km_teorico?: number | null
          local_foraneo?: string | null
          nombre_armado?: string | null
          nombre_cliente?: string | null
          nombre_custodio?: string | null
          nombre_operador_adicional?: string | null
          nombre_operador_transporte?: string | null
          origen?: string | null
          placa?: string | null
          placa_carga?: string | null
          placa_carga_adicional?: string | null
          presentacion?: string | null
          proveedor?: string | null
          ruta?: string | null
          telefono?: string | null
          telefono_armado?: string | null
          telefono_emergencia?: string | null
          telefono_operador?: string | null
          telefono_operador_adicional?: string | null
          tiempo_estimado?: unknown | null
          tiempo_punto_origen?: unknown | null
          tiempo_retraso?: unknown | null
          tipo_carga?: string | null
          tipo_carga_adicional?: string | null
          tipo_gadget?: string | null
          tipo_servicio?: string | null
          tipo_unidad?: string | null
          tipo_unidad_adicional?: string | null
          updated_time?: string | null
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
          call_id: string | null
          car_brand: string | null
          car_model: string | null
          car_year: number | null
          created_at: string
          custodio_name: string | null
          id: number
          phone_number: number | null
          phone_number_intl: string | null
          security_exp: string | null
          sedena_id: string | null
          vapi_call_data: Json | null
        }
        Insert: {
          call_id?: string | null
          car_brand?: string | null
          car_model?: string | null
          car_year?: number | null
          created_at?: string
          custodio_name?: string | null
          id?: number
          phone_number?: number | null
          phone_number_intl?: string | null
          security_exp?: string | null
          sedena_id?: string | null
          vapi_call_data?: Json | null
        }
        Update: {
          call_id?: string | null
          car_brand?: string | null
          car_model?: string | null
          car_year?: number | null
          created_at?: string
          custodio_name?: string | null
          id?: number
          phone_number?: number | null
          phone_number_intl?: string | null
          security_exp?: string | null
          sedena_id?: string | null
          vapi_call_data?: Json | null
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
      prospects: {
        Row: {
          call_count: number | null
          call_duration: number | null
          call_log_id: string | null
          call_start_time: string | null
          call_status: string | null
          car_brand: string | null
          car_model: string | null
          car_year: number | null
          custodio_name: string | null
          last_call_date: string | null
          lead_created_at: string | null
          lead_email: string | null
          lead_id: number | null
          lead_name: string | null
          lead_phone: string | null
          lead_source: string | null
          lead_status: string | null
          phone_number_intl: string | null
          recording_url: string | null
          security_exp: string | null
          sedena_id: string | null
          transcript: Json | null
          validated_lead_id: number | null
          validation_date: string | null
          vapi_log_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calcular_kpi_cliente: {
        Args: { p_cliente: string; fecha_inicio: string; fecha_fin: string }
        Returns: {
          nombre_cliente: string
          total_servicios: number
          km_totales: number
          costo_total: number
          duracion_promedio: unknown
          servicios_por_dia: number
        }[]
      }
      deduplicate_leads: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      deduplicate_servicios_custodia: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_all_prospects: {
        Args: Record<PropertyKey, never>
        Returns: {
          lead_id: number
          lead_name: string
          lead_phone: string
          lead_email: string
          lead_status: string
          lead_created_at: string
          lead_source: string
          call_count: number
          last_call_date: string
          validated_lead_id: number
          custodio_name: string
          car_brand: string
          car_model: string
          car_year: number
          security_exp: string
          sedena_id: string
          phone_number_intl: string
          validation_date: string
          call_log_id: string
          vapi_log_id: string
          call_status: string
          call_duration: number
          call_start_time: string
          recording_url: string
          transcript: Json
        }[]
      }
      get_prospect_by_id: {
        Args: { p_lead_id: number }
        Returns: {
          lead_id: number
          lead_name: string
          lead_phone: string
          lead_email: string
          lead_status: string
          lead_created_at: string
          lead_source: string
          call_count: number
          last_call_date: string
          validated_lead_id: number
          custodio_name: string
          car_brand: string
          car_model: string
          car_year: number
          security_exp: string
          sedena_id: string
          phone_number_intl: string
          validation_date: string
          call_log_id: string
          vapi_log_id: string
          call_status: string
          call_duration: number
          call_start_time: string
          recording_url: string
          transcript: Json
        }[]
      }
      get_prospects_by_status: {
        Args: { p_status: string }
        Returns: {
          lead_id: number
          lead_name: string
          lead_phone: string
          lead_email: string
          lead_status: string
          lead_created_at: string
          lead_source: string
          call_count: number
          last_call_date: string
          validated_lead_id: number
          custodio_name: string
          car_brand: string
          car_model: string
          car_year: number
          security_exp: string
          sedena_id: string
          phone_number_intl: string
          validation_date: string
          call_log_id: string
          vapi_log_id: string
          call_status: string
          call_duration: number
          call_start_time: string
          recording_url: string
          transcript: Json
        }[]
      }
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
      import_servicios_custodia_data: {
        Args: { file_content: string }
        Returns: Json
      }
      invoke_deduplicate_function: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      obtener_alertas_clientes: {
        Args: {
          mes_actual_inicio: string
          mes_actual_fin: string
          mes_anterior_inicio: string
          mes_anterior_fin: string
          umbral_variacion: number
        }
        Returns: {
          nombre: string
          servicios_actual: number
          servicios_anterior: number
          variacion: number
          kmpromedio: number
          costopromedio: number
        }[]
      }
      obtener_metricas_generales: {
        Args: {
          fecha_inicio: string
          fecha_fin: string
          mes_actual_inicio: string
          mes_actual_fin: string
          mes_anterior_inicio: string
          mes_anterior_fin: string
          semana_actual_inicio: string
          semana_actual_fin: string
          semana_anterior_inicio: string
          semana_anterior_fin: string
        }
        Returns: {
          total_servicios: number
          km_totales: number
          servicios_mes_actual: number
          servicios_mes_anterior: number
          servicios_semana_actual: number
          servicios_semana_anterior: number
          km_promedio_mes_actual: number
          km_promedio_mes_anterior: number
          clientes_activos: number
          clientes_nuevos: number
        }[]
      }
      obtener_servicios_por_cliente: {
        Args: { fecha_inicio: string; fecha_fin: string }
        Returns: {
          nombre_cliente: string
          totalservicios: number
          kmpromedio: number
          costopromedio: number
        }[]
      }
      obtener_servicios_por_tipo: {
        Args: { fecha_inicio: string; fecha_fin: string }
        Returns: {
          tipo: string
          count: number
        }[]
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
