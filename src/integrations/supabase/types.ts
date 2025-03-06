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
      consultations: {
        Row: {
          consultation_fee: number
          created_at: string | null
          expert_id: string | null
          id: string
          notes: string | null
          patient_id: string | null
          payment_intent_id: string | null
          payment_status: string
          rating: number | null
          review: string | null
          scheduled_for: string
          status: string
          updated_at: string | null
        }
        Insert: {
          consultation_fee?: number
          created_at?: string | null
          expert_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          payment_intent_id?: string | null
          payment_status?: string
          rating?: number | null
          review?: string | null
          scheduled_for: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          consultation_fee?: number
          created_at?: string | null
          expert_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          payment_intent_id?: string | null
          payment_status?: string
          rating?: number | null
          review?: string | null
          scheduled_for?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      embryo_data: {
        Row: {
          ai_score: number | null
          consultation_id: string | null
          created_at: string | null
          expert_id: string | null
          grade: string | null
          id: string
          image_url: string | null
          notes: string | null
          patient_id: string | null
          text_description: string | null
        }
        Insert: {
          ai_score?: number | null
          consultation_id?: string | null
          created_at?: string | null
          expert_id?: string | null
          grade?: string | null
          id?: string
          image_url?: string | null
          notes?: string | null
          patient_id?: string | null
          text_description?: string | null
        }
        Update: {
          ai_score?: number | null
          consultation_id?: string | null
          created_at?: string | null
          expert_id?: string | null
          grade?: string | null
          id?: string
          image_url?: string | null
          notes?: string | null
          patient_id?: string | null
          text_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "embryo_data_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_profiles: {
        Row: {
          availability: Json
          bio: string
          consultation_fee: number
          created_at: string | null
          id: string
          profile_image: string | null
          qualifications: string[]
          rating: number | null
          specialization: string
          total_reviews: number | null
          updated_at: string | null
          user_id: string | null
          years_of_experience: number
        }
        Insert: {
          availability: Json
          bio: string
          consultation_fee: number
          created_at?: string | null
          id?: string
          profile_image?: string | null
          qualifications: string[]
          rating?: number | null
          specialization: string
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          years_of_experience: number
        }
        Update: {
          availability?: Json
          bio?: string
          consultation_fee?: number
          created_at?: string | null
          id?: string
          profile_image?: string | null
          qualifications?: string[]
          rating?: number | null
          specialization?: string
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          years_of_experience?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          cycle_length: number | null
          date_of_birth: string | null
          fertility_goals: string | null
          first_name: string | null
          id: string
          last_name: string | null
          last_period_date: string | null
          medical_conditions: string[] | null
          medications: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cycle_length?: number | null
          date_of_birth?: string | null
          fertility_goals?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          last_period_date?: string | null
          medical_conditions?: string[] | null
          medications?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cycle_length?: number | null
          date_of_birth?: string | null
          fertility_goals?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_period_date?: string | null
          medical_conditions?: string[] | null
          medications?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
