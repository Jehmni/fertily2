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
      appointments: {
        Row: {
          appointment_date: string
          created_at: string
          description: string | null
          id: string
          reminder_sent: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          created_at?: string
          description?: string | null
          id?: string
          reminder_sent?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          created_at?: string
          description?: string | null
          id?: string
          reminder_sent?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          created_at: string
          id: string
          message: string
          response: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          response: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          response?: string
          user_id?: string
        }
        Relationships: []
      }
      community_notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string | null
          read: boolean | null
          sender_id: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id?: string | null
          read?: boolean | null
          sender_id: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string | null
          read?: boolean | null
          sender_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          anonymous: boolean | null
          anonymous_alias: string | null
          category: string
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          anonymous?: boolean | null
          anonymous_alias?: string | null
          category: string
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          anonymous?: boolean | null
          anonymous_alias?: string | null
          category?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cycle_tracking: {
        Row: {
          created_at: string
          cycle_end_date: string | null
          cycle_start_date: string
          id: string
          notes: string | null
          symptoms: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          cycle_end_date?: string | null
          cycle_start_date: string
          id?: string
          notes?: string | null
          symptoms?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          cycle_end_date?: string | null
          cycle_start_date?: string
          id?: string
          notes?: string | null
          symptoms?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      educational_resources: {
        Row: {
          category: string
          content: string
          content_url: string | null
          created_at: string
          id: string
          resource_type: string | null
          subcategory: string | null
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          category: string
          content: string
          content_url?: string | null
          created_at?: string
          id?: string
          resource_type?: string | null
          subcategory?: string | null
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          category?: string
          content?: string
          content_url?: string | null
          created_at?: string
          id?: string
          resource_type?: string | null
          subcategory?: string | null
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: []
      }
      fertility_insights: {
        Row: {
          created_at: string
          id: string
          insight_data: Json
          insight_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          insight_data: Json
          insight_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          insight_data?: Json
          insight_type?: string
          user_id?: string
        }
        Relationships: []
      }
      ivf_medical_data: {
        Row: {
          age: number
          alcohol_consumption: string | null
          amh_level: number | null
          antral_follicle_count: number | null
          bmi: number | null
          created_at: string
          embryo_quality: string | null
          estradiol_level: number | null
          fsh_level: number | null
          id: string
          lh_level: number | null
          medical_history: Json | null
          previous_ivf_cycles: number | null
          previous_ivf_outcomes: Json | null
          smoking_status: boolean | null
          sperm_quality: Json | null
          updated_at: string
          user_id: string
          uterine_conditions: string[] | null
        }
        Insert: {
          age: number
          alcohol_consumption?: string | null
          amh_level?: number | null
          antral_follicle_count?: number | null
          bmi?: number | null
          created_at?: string
          embryo_quality?: string | null
          estradiol_level?: number | null
          fsh_level?: number | null
          id?: string
          lh_level?: number | null
          medical_history?: Json | null
          previous_ivf_cycles?: number | null
          previous_ivf_outcomes?: Json | null
          smoking_status?: boolean | null
          sperm_quality?: Json | null
          updated_at?: string
          user_id: string
          uterine_conditions?: string[] | null
        }
        Update: {
          age?: number
          alcohol_consumption?: string | null
          amh_level?: number | null
          antral_follicle_count?: number | null
          bmi?: number | null
          created_at?: string
          embryo_quality?: string | null
          estradiol_level?: number | null
          fsh_level?: number | null
          id?: string
          lh_level?: number | null
          medical_history?: Json | null
          previous_ivf_cycles?: number | null
          previous_ivf_outcomes?: Json | null
          smoking_status?: boolean | null
          sperm_quality?: Json | null
          updated_at?: string
          user_id?: string
          uterine_conditions?: string[] | null
        }
        Relationships: []
      }
      ivf_predictions: {
        Row: {
          created_at: string
          id: string
          key_factors: Json | null
          medical_data_id: string
          recommendations: string[] | null
          success_probability: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_factors?: Json | null
          medical_data_id: string
          recommendations?: string[] | null
          success_probability?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key_factors?: Json | null
          medical_data_id?: string
          recommendations?: string[] | null
          success_probability?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ivf_predictions_medical_data_id_fkey"
            columns: ["medical_data_id"]
            isOneToOne: false
            referencedRelation: "ivf_medical_data"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          anonymous: boolean | null
          anonymous_alias: string | null
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          anonymous?: boolean | null
          anonymous_alias?: string | null
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          anonymous?: boolean | null
          anonymous_alias?: string | null
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          cycle_length: number | null
          date_of_birth: string | null
          fertility_goals: string | null
          first_name: string | null
          id: string
          last_name: string | null
          last_period_date: string | null
          medical_conditions: string[] | null
          medications: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cycle_length?: number | null
          date_of_birth?: string | null
          fertility_goals?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          last_period_date?: string | null
          medical_conditions?: string[] | null
          medications?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cycle_length?: number | null
          date_of_birth?: string | null
          fertility_goals?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_period_date?: string | null
          medical_conditions?: string[] | null
          medications?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_educational_resources_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "educational_resources"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_anonymous_alias: {
        Args: {
          user_id: string
        }
        Returns: string
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
