export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      candidates: {
        Row: {
          ai_summary: string | null
          answers: Json
          attachments: Json
          birth_date: string | null
          city: string | null
          created_at: string | null
          email: string
          form_id: string | null
          full_name: string
          id: string
          notes: string | null
          organization_id: string
          phone: string | null
          school: string | null
          stage: string
        }
        Insert: {
          ai_summary?: string | null
          answers?: Json
          attachments?: Json
          birth_date?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          form_id?: string | null
          full_name: string
          id?: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          school?: string | null
          stage?: string
        }
        Update: {
          ai_summary?: string | null
          answers?: Json
          attachments?: Json
          birth_date?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          form_id?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          school?: string | null
          stage?: string
        }
        Relationships: []
      }
      candidate_events: {
        Row: {
          actor_id: string | null
          candidate_id: string
          created_at: string | null
          description: string | null
          id: string
          organization_id: string
          type: string
        }
        Insert: {
          actor_id?: string | null
          candidate_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          organization_id: string
          type: string
        }
        Update: {
          actor_id?: string | null
          candidate_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          organization_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_events_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          }
        ]
      }
      forms: {
        Row: {
          created_at: string | null
          fields: Json
          id: string
          is_active: boolean
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string | null
          fields?: Json
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string | null
          fields?: Json
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      interviews: {
        Row: {
          candidate_id: string
          created_at: string | null
          duration_minutes: number
          id: string
          interviewer_id: string | null
          location: string | null
          meeting_url: string | null
          organization_id: string
          scheduled_at: string
          status: string
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          duration_minutes?: number
          id?: string
          interviewer_id?: string | null
          location?: string | null
          meeting_url?: string | null
          organization_id: string
          scheduled_at: string
          status?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          duration_minutes?: number
          id?: string
          interviewer_id?: string | null
          location?: string | null
          meeting_url?: string | null
          organization_id?: string
          scheduled_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      interview_evaluations: {
        Row: {
          created_at: string | null
          evaluator_id: string | null
          id: string
          interview_id: string
          notes: string | null
          organization_id: string
          scale: number | null
          tags: string[]
        }
        Insert: {
          created_at?: string | null
          evaluator_id?: string | null
          id?: string
          interview_id: string
          notes?: string | null
          organization_id: string
          scale?: number | null
          tags?: string[]
        }
        Update: {
          created_at?: string | null
          evaluator_id?: string | null
          id?: string
          interview_id?: string
          notes?: string | null
          organization_id?: string
          scale?: number | null
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "interview_evaluations_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          }
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          gender_policy: string
          id: string
          logo_url: string | null
          name: string
          religious_policy: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          gender_policy?: string
          id?: string
          logo_url?: string | null
          name: string
          religious_policy?: string
          slug: string
        }
        Update: {
          created_at?: string | null
          gender_policy?: string
          id?: string
          logo_url?: string | null
          name?: string
          religious_policy?: string
          slug?: string
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          order_index: number
          organization_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          order_index: number
          organization_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          order_index?: number
          organization_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          organization_id: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          organization_id?: string | null
          role?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organization_id: { Args: Record<string, never>; Returns: string }
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

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]

// ---- Types נוחים לשימוש בקוד ----

export type Organization = Tables<"organizations">
export type User = Tables<"users">
export type Form = Tables<"forms">
export type PipelineStage = Tables<"pipeline_stages">
export type Candidate = Tables<"candidates">
export type CandidateEvent = Tables<"candidate_events">
export type Interview = Tables<"interviews">
export type InterviewEvaluation = Tables<"interview_evaluations">

export type CandidateStage = "new" | "review" | "interview" | "accepted" | "rejected"

export type InterviewStatus = "scheduled" | "completed" | "cancelled" | "no_show"

export type UserRole = "admin" | "staff"

export type FormField = {
  id: string
  type: "text" | "textarea" | "select" | "multiselect" | "date" | "number" | "file" | "video" | "autocomplete"
  label: string
  required: boolean
  options?: string[]
  autocomplete_list?: "cities" | "schools" | "custom"
}

export type Attachment = {
  file_name: string
  file_url: string
  file_type: string
  uploaded_at: string
}
