import { supabase } from "../lib/supabase"
import type { Database } from "../lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Child = Database["public"]["Tables"]["children"]["Row"]
type Visit = Database["public"]["Tables"]["visits"]["Row"]
type Party = Database["public"]["Tables"]["parties"]["Row"]
type SupportTicket = Database["public"]["Tables"]["support_tickets"]["Row"]

// Profile Services
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching profile:", error)
      return null
    }
    return data
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
    const { error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) {
      console.error("Error updating profile:", error)
      return false
    }
    return true
  },
}

// Children Services
export const childrenService = {
  async getChildren(parentId: string): Promise<Child[]> {
    const { data, error } = await supabase
      .from("children")
      .select("*")
      .eq("parent_id", parentId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching children:", error)
      return []
    }
    return data || []
  },

  async addChild(childData: Omit<Child, "id" | "created_at" | "updated_at" | "visits">): Promise<Child | null> {
    const { data, error } = await supabase.from("children").insert([childData]).select().single()

    if (error) {
      console.error("Error adding child:", error)
      return null
    }
    return data
  },

  async getChildByQR(qrCode: string): Promise<Child | null> {
    const { data, error } = await supabase.from("children").select("*").eq("qr_code", qrCode).single()

    if (error) {
      console.error("Error fetching child by QR:", error)
      return null
    }
    return data
  },

  async updateVisits(childId: string, visits: number): Promise<boolean> {
    const { error } = await supabase
      .from("children")
      .update({ visits, updated_at: new Date().toISOString() })
      .eq("id", childId)

    if (error) {
      console.error("Error updating visits:", error)
      return false
    }
    return true
  },
}

// Visit Services
export const visitService = {
  async checkIn(childId: string): Promise<Visit | null> {
    const { data, error } = await supabase
      .from("visits")
      .insert([
        {
          child_id: childId,
          entry_time: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error checking in:", error)
      return null
    }
    return data
  },

  async checkOut(visitId: string): Promise<boolean> {
    const { error } = await supabase.from("visits").update({ exit_time: new Date().toISOString() }).eq("id", visitId)

    if (error) {
      console.error("Error checking out:", error)
      return false
    }
    return true
  },

  async getActiveVisit(childId: string): Promise<Visit | null> {
    const { data, error } = await supabase
      .from("visits")
      .select("*")
      .eq("child_id", childId)
      .is("exit_time", null)
      .order("entry_time", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      return null
    }
    return data
  },
}

// Party Services
export const partyService = {
  async getParties(parentId: string): Promise<Party[]> {
    const { data, error } = await supabase
      .from("parties")
      .select("*")
      .eq("parent_id", parentId)
      .order("date", { ascending: true })

    if (error) {
      console.error("Error fetching parties:", error)
      return []
    }
    return data || []
  },

  async bookParty(partyData: Omit<Party, "id" | "created_at" | "updated_at">): Promise<Party | null> {
    const { data, error } = await supabase.from("parties").insert([partyData]).select().single()

    if (error) {
      console.error("Error booking party:", error)
      return null
    }
    return data
  },
}

// Support Services
export const supportService = {
  async getTickets(parentId: string): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("parent_id", parentId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching tickets:", error)
      return []
    }
    return data || []
  },

  async createTicket(
    ticketData: Omit<SupportTicket, "id" | "created_at" | "updated_at">,
  ): Promise<SupportTicket | null> {
    const { data, error } = await supabase.from("support_tickets").insert([ticketData]).select().single()

    if (error) {
      console.error("Error creating ticket:", error)
      return null
    }
    return data
  },
}

// Admin Services
export const adminService = {
  async getAllChildren(): Promise<Child[]> {
    const { data, error } = await supabase
      .from("children")
      .select(`
        *,
        profiles!children_parent_id_fkey(full_name, email, phone)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching all children:", error)
      return []
    }
    return data || []
  },

  async getAllVisits(): Promise<any[]> {
    const { data, error } = await supabase
      .from("visits")
      .select(`
        *,
        children(name, age),
        children!inner(profiles!children_parent_id_fkey(full_name, phone))
      `)
      .order("entry_time", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Error fetching visits:", error)
      return []
    }
    return data || []
  },

  async getAllParties(): Promise<any[]> {
    const { data, error } = await supabase
      .from("parties")
      .select(`
        *,
        profiles!parties_parent_id_fkey(full_name, email, phone)
      `)
      .order("date", { ascending: true })

    if (error) {
      console.error("Error fetching parties:", error)
      return []
    }
    return data || []
  },

  async getAllTickets(): Promise<any[]> {
    const { data, error } = await supabase
      .from("support_tickets")
      .select(`
        *,
        profiles!support_tickets_parent_id_fkey(full_name, email, phone)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching tickets:", error)
      return []
    }
    return data || []
  },
}
