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
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      attendance: {
        Row: {
          catechist_id: string | null
          id: string
          meeting_id: string | null
          notes: string | null
          scanned_at: string | null
          status: string | null
        }
        Insert: {
          catechist_id?: string | null
          id?: string
          meeting_id?: string | null
          notes?: string | null
          scanned_at?: string | null
          status?: string | null
        }
        Update: {
          catechist_id?: string | null
          id?: string
          meeting_id?: string | null
          notes?: string | null
          scanned_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_catechist_id_fkey"
            columns: ["catechist_id"]
            isOneToOne: false
            referencedRelation: "catechists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changed_at: string | null
          changed_by: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      caja_movimientos: {
        Row: {
          categoria: string
          concepto: string
          created_at: string | null
          fecha_movimiento: string | null
          id: string
          metodo_pago: string
          monto: number
          registrado_por: string | null
          tipo: string
        }
        Insert: {
          categoria: string
          concepto: string
          created_at?: string | null
          fecha_movimiento?: string | null
          id?: string
          metodo_pago: string
          monto: number
          registrado_por?: string | null
          tipo: string
        }
        Update: {
          categoria?: string
          concepto?: string
          created_at?: string | null
          fecha_movimiento?: string | null
          id?: string
          metodo_pago?: string
          monto?: number
          registrado_por?: string | null
          tipo?: string
        }
        Relationships: []
      }
      catechists: {
        Row: {
          code: string
          created_at: string | null
          dni: string | null
          full_name: string
          id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          dni?: string | null
          full_name: string
          id?: string
        }
        Update: {
          code?: string
          created_at?: string | null
          dni?: string | null
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      donations_info: {
        Row: {
          account_number: string | null
          bank_name: string
          cci: string | null
          created_at: string | null
          description: string | null
          id: string
          qr_image_url: string | null
          sort_order: number | null
          title: string
        }
        Insert: {
          account_number?: string | null
          bank_name: string
          cci?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          qr_image_url?: string | null
          sort_order?: number | null
          title: string
        }
        Update: {
          account_number?: string | null
          bank_name?: string
          cci?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          qr_image_url?: string | null
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          id: string
          image_url: string | null
          location: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          id?: string
          image_url?: string | null
          location?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          location?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      facebook_posts: {
        Row: {
          created_at: string
          description: string | null
          id: number
          image_url: string
          post_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          image_url: string
          post_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          image_url?: string
          post_url?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          category: string | null
          created_at: string
          id: string
          image_url: string
          sort_order: number
          title: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          title?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          title?: string | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category: string
          created_at: string
          id: string
          location: string
          name: string
          notes: string | null
          quantity: number
          status: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          location: string
          name: string
          notes?: string | null
          quantity?: number
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          notes?: string | null
          quantity?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_transactions: {
        Row: {
          created_at: string
          created_by: string
          id: string
          item_id: string
          notes: string | null
          quantity: number
          responsible_person: string
          type: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          item_id: string
          notes?: string | null
          quantity: number
          responsible_person: string
          type: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          item_id?: string
          notes?: string | null
          quantity?: number
          responsible_person?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string | null
          id: string
          scheduled_date: string
          scheduled_end_time: string
          scheduled_time: string
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          scheduled_date?: string
          scheduled_end_time?: string
          scheduled_time?: string
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          scheduled_date?: string
          scheduled_end_time?: string
          scheduled_time?: string
          title?: string
        }
        Relationships: []
      }
      ministries: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          leader: string | null
          name: string
          schedule: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          leader?: string | null
          name: string
          schedule?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          leader?: string | null
          name?: string
          schedule?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          category: string
          created_at: string
          day_label: string
          id: string
          notes: string | null
          sort_order: number
          time_label: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          day_label: string
          id?: string
          notes?: string | null
          sort_order?: number
          time_label: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          day_label?: string
          id?: string
          notes?: string | null
          sort_order?: number
          time_label?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      get_my_role: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "secretaria"
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
      app_role: ["admin", "editor", "secretaria"],
    },
  },
} as const
