export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      },
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      comments_coursecomment: {
        Row: {
          comment_id: string
          content: string
          course_id: string
          hidden: boolean
          parent_comment_id: string | null
          post_date: string
          title: string
        }
        Insert: {
          comment_id: string
          content: string
          course_id: string
          hidden: boolean
          parent_comment_id?: string | null
          post_date: string
          title: string
        }
        Update: {
          comment_id?: string
          content?: string
          course_id?: string
          hidden?: boolean
          parent_comment_id?: string | null
          post_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_coursecomment_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_course"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "comments_coursecomment_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments_coursecomment"
            referencedColumns: ["comment_id"]
          },
        ]
      }
      courses_course: {
        Row: {
          course_code: string
          course_id: string
        }
        Insert: {
          course_code: string
          course_id: string
        }
        Update: {
          course_code?: string
          course_id?: string
        }
        Relationships: []
      }
      courses_coursecommonname: {
        Row: {
          course_id: string
          course_name: string
          course_name_id: string
          language: string
        }
        Insert: {
          course_id: string
          course_name: string
          course_name_id: string
          language: string
        }
        Update: {
          course_id?: string
          course_name?: string
          course_name_id?: string
          language?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_coursecommonname_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_course"
            referencedColumns: ["course_id"]
          },
        ]
      }
      courses_coursegroup: {
        Row: {
          course_group_id: string
          course_group_name: string
          course_instance_id: string
        }
        Insert: {
          course_group_id: string
          course_group_name: string
          course_instance_id: string
        }
        Update: {
          course_group_id?: string
          course_group_name?: string
          course_instance_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_coursegroup_course_instance_id_fkey"
            columns: ["course_instance_id"]
            isOneToOne: false
            referencedRelation: "courses_courseinstance"
            referencedColumns: ["course_instance_id"]
          },
        ]
      }
      courses_coursegroupteacher: {
        Row: {
          course_group_id: string
          teacher_id: string
          teacher_name: string
        }
        Insert: {
          course_group_id: string
          teacher_id: string
          teacher_name: string
        }
        Update: {
          course_group_id?: string
          teacher_id?: string
          teacher_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_coursegroupteacher_course_group_id_fkey"
            columns: ["course_group_id"]
            isOneToOne: false
            referencedRelation: "courses_coursegroup"
            referencedColumns: ["course_group_id"]
          },
        ]
      }
      courses_courseinstance: {
        Row: {
          course_id: string
          course_instance_id: string
          semester: string
          year: number
        }
        Insert: {
          course_id: string
          course_instance_id: string
          semester: string
          year: number
        }
        Update: {
          course_id?: string
          course_instance_id?: string
          semester?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "courses_courseinstance_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_course"
            referencedColumns: ["course_id"]
          },
        ]
      }
      courses_courseinstancename: {
        Row: {
          course_instance_id: string
          course_name: string
          course_name_id: string
          language: string
        }
        Insert: {
          course_instance_id: string
          course_name: string
          course_name_id: string
          language: string
        }
        Update: {
          course_instance_id?: string
          course_name?: string
          course_name_id?: string
          language?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_courseinstancename_course_instance_id_fkey"
            columns: ["course_instance_id"]
            isOneToOne: false
            referencedRelation: "courses_courseinstance"
            referencedColumns: ["course_instance_id"]
          },
        ]
      }
      grades_exam: {
        Row: {
          course_group_id: string
          exam_id: string
          failures_count: number
          moed: number
          students_count: number
        }
        Insert: {
          course_group_id: string
          exam_id: string
          failures_count: number
          moed: number
          students_count: number
        }
        Update: {
          course_group_id?: string
          exam_id?: string
          failures_count?: number
          moed?: number
          students_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "grades_exam_course_group_id_fkey"
            columns: ["course_group_id"]
            isOneToOne: false
            referencedRelation: "courses_coursegroup"
            referencedColumns: ["course_group_id"]
          },
        ]
      }
      grades_examgraderange: {
        Row: {
          exam_grade_range_id: string
          exam_id: string
          highest_grade: number
          lowest_grade: number
          students_in_range: number
        }
        Insert: {
          exam_grade_range_id: string
          exam_id: string
          highest_grade: number
          lowest_grade: number
          students_in_range: number
        }
        Update: {
          exam_grade_range_id?: string
          exam_id?: string
          highest_grade?: number
          lowest_grade?: number
          students_in_range?: number
        }
        Relationships: [
          {
            foreignKeyName: "grades_examgraderange_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "grades_exam"
            referencedColumns: ["exam_id"]
          },
        ]
      }
      grades_examstatistics: {
        Row: {
          exam_id: string
          exam_statistics_id: string
          mean: number | null
          median: number | null
          standard_deviation: number | null
        }
        Insert: {
          exam_id: string
          exam_statistics_id: string
          mean?: number | null
          median?: number | null
          standard_deviation?: number | null
        }
        Update: {
          exam_id?: string
          exam_statistics_id?: string
          mean?: number | null
          median?: number | null
          standard_deviation?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "grades_examstatistics_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "grades_exam"
            referencedColumns: ["exam_id"]
          },
        ]
      }
      ratings_courserating: {
        Row: {
          course_id: string
          course_rating_id: string
          summed_votes: number
          total_votes: number
        }
        Insert: {
          course_id: string
          course_rating_id: string
          summed_votes: number
          total_votes: number
        }
        Update: {
          course_id?: string
          course_rating_id?: string
          summed_votes?: number
          total_votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "ratings_courserating_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_course"
            referencedColumns: ["course_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
