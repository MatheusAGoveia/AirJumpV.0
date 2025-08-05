export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: "parent" | "admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: "parent" | "admin"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: "parent" | "admin"
          created_at?: string
          updated_at?: string
        }
      }
      children: {
        Row: {
          id: string
          parent_id: string
          name: string
          age: number
          emergency_contact: string
          medical_info: string | null
          qr_code: string
          visits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          name: string
          age: number
          emergency_contact: string
          medical_info?: string | null
          qr_code: string
          visits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          name?: string
          age?: number
          emergency_contact?: string
          medical_info?: string | null
          qr_code?: string
          visits?: number
          created_at?: string
          updated_at?: string
        }
      }
      visits: {
        Row: {
          id: string
          child_id: string
          entry_time: string
          exit_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          entry_time: string
          exit_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          entry_time?: string
          exit_time?: string | null
          created_at?: string
        }
      }
      parties: {
        Row: {
          id: string
          parent_id: string
          child_name: string
          date: string
          time: string
          package: string
          guests: number
          status: "pending" | "confirmed" | "cancelled"
          total_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          child_name: string
          date: string
          time: string
          package: string
          guests: number
          status?: "pending" | "confirmed" | "cancelled"
          total_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          child_name?: string
          date?: string
          time?: string
          package?: string
          guests?: number
          status?: "pending" | "confirmed" | "cancelled"
          total_price?: number
          created_at?: string
          updated_at?: string
        }
      }
      support_tickets: {
        Row: {
          id: string
          parent_id: string
          subject: string
          message: string
          status: "open" | "in_progress" | "resolved"
          priority: "low" | "medium" | "high"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          subject: string
          message: string
          status?: "open" | "in_progress" | "resolved"
          priority?: "low" | "medium" | "high"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          subject?: string
          message?: string
          status?: "open" | "in_progress" | "resolved"
          priority?: "low" | "medium" | "high"
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
