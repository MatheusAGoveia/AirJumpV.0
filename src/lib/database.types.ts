export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      children: {
        Row: {
          id: string
          parent_id: string
          name: string
          birth_date: string
          photo_url: string | null
          medical_notes: string | null
          has_disability: boolean
          disability_document_url: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          name: string
          birth_date: string
          photo_url?: string | null
          medical_notes?: string | null
          has_disability?: boolean
          disability_document_url?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          name?: string
          birth_date?: string
          photo_url?: string | null
          medical_notes?: string | null
          has_disability?: boolean
          disability_document_url?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      qr_sessions: {
        Row: {
          id: string
          child_id: string
          token: string
          is_active: boolean
          entry_time: string | null
          exit_time: string | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          token: string
          is_active?: boolean
          entry_time?: string | null
          exit_time?: string | null
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          token?: string
          is_active?: boolean
          entry_time?: string | null
          exit_time?: string | null
          expires_at?: string
          created_at?: string
        }
      }
      loyalty_programs: {
        Row: {
          id: string
          parent_id: string
          seals: number
          free_entries: number
          last_updated: string
        }
        Insert: {
          id?: string
          parent_id: string
          seals?: number
          free_entries?: number
          last_updated?: string
        }
        Update: {
          id?: string
          parent_id?: string
          seals?: number
          free_entries?: number
          last_updated?: string
        }
      }
      party_bookings: {
        Row: {
          id: string
          parent_id: string
          child_name: string
          date: string
          time: string
          guests: number
          package_type: string
          notes: string | null
          status: "pending" | "confirmed" | "cancelled"
          created_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          child_name: string
          date: string
          time: string
          guests: number
          package_type: string
          notes?: string | null
          status?: "pending" | "confirmed" | "cancelled"
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          child_name?: string
          date?: string
          time?: string
          guests?: number
          package_type?: string
          notes?: string | null
          status?: "pending" | "confirmed" | "cancelled"
          created_at?: string
        }
      }
      support_tickets: {
        Row: {
          id: string
          parent_id: string
          type: "doubt" | "suggestion" | "complaint"
          subject: string
          description: string
          status: "open" | "in_progress" | "closed"
          created_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          type: "doubt" | "suggestion" | "complaint"
          subject: string
          description: string
          status?: "open" | "in_progress" | "closed"
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          type?: "doubt" | "suggestion" | "complaint"
          subject?: string
          description?: string
          status?: "open" | "in_progress" | "closed"
          created_at?: string
        }
      }
      emergency_alerts: {
        Row: {
          id: string
          child_id: string
          type: string
          message: string
          operator_id: string
          status: "active" | "resolved"
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          child_id: string
          type: string
          message: string
          operator_id: string
          status?: "active" | "resolved"
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          child_id?: string
          type?: string
          message?: string
          operator_id?: string
          status?: "active" | "resolved"
          created_at?: string
          resolved_at?: string | null
        }
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
  }
}
