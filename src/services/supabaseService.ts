import { supabase } from "../lib/supabase"
import { generateQRToken, generateChildTags } from "../utils/qrUtils"
import type { Database } from "../lib/database.types"

type Tables = Database["public"]["Tables"]
type Child = Tables["children"]["Row"]
type QRSession = Tables["qr_sessions"]["Row"]
type LoyaltyProgram = Tables["loyalty_programs"]["Row"]
type PartyBooking = Tables["party_bookings"]["Row"]
type SupportTicket = Tables["support_tickets"]["Row"]
type EmergencyAlert = Tables["emergency_alerts"]["Row"]

// Auth Services
export const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone || null,
      },
    },
  })

  if (error) throw error
  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Profile Services
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) throw error
  return data
}

export const updateProfile = async (userId: string, updates: Partial<Tables["profiles"]["Update"]>) => {
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()

  if (error) throw error
  return data
}

// Children Services
export const addChild = async (childData: {
  name: string
  birthDate: Date
  medicalNotes?: string
  hasDisability: boolean
  photoUrl?: string
  disabilityDocumentUrl?: string
}) => {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  const tags = generateChildTags(childData.birthDate, childData.hasDisability)

  const { data, error } = await supabase
    .from("children")
    .insert({
      parent_id: user.id,
      name: childData.name,
      birth_date: childData.birthDate.toISOString().split("T")[0],
      medical_notes: childData.medicalNotes || null,
      has_disability: childData.hasDisability,
      photo_url: childData.photoUrl || null,
      disability_document_url: childData.disabilityDocumentUrl || null,
      tags,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getChildren = async (): Promise<Child[]> => {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export const getChild = async (childId: string): Promise<Child> => {
  const { data, error } = await supabase.from("children").select("*").eq("id", childId).single()

  if (error) throw error
  return data
}

export const updateChild = async (childId: string, updates: Partial<Tables["children"]["Update"]>) => {
  const { data, error } = await supabase.from("children").update(updates).eq("id", childId).select().single()

  if (error) throw error
  return data
}

export const deleteChild = async (childId: string) => {
  const { error } = await supabase.from("children").delete().eq("id", childId)

  if (error) throw error
}

// QR Session Services
export const generateQRSession = async (childId: string): Promise<QRSession> => {
  const token = generateQRToken(childId)
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours

  const { data, error } = await supabase
    .from("qr_sessions")
    .insert({
      child_id: childId,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const validateQRToken = async (
  token: string,
): Promise<{
  valid: boolean
  session?: QRSession
  child?: Child
}> => {
  const { data: session, error } = await supabase.from("qr_sessions").select("*").eq("token", token).single()

  if (error || !session) {
    return { valid: false }
  }

  // Check if expired
  if (new Date(session.expires_at) < new Date()) {
    return { valid: false }
  }

  // Get child data
  const child = await getChild(session.child_id)

  return { valid: true, session, child }
}

export const checkInChild = async (sessionId: string): Promise<void> => {
  const { error } = await supabase
    .from("qr_sessions")
    .update({
      is_active: true,
      entry_time: new Date().toISOString(),
    })
    .eq("id", sessionId)

  if (error) throw error
}

export const checkOutChild = async (sessionId: string): Promise<void> => {
  const { error } = await supabase
    .from("qr_sessions")
    .update({
      is_active: false,
      exit_time: new Date().toISOString(),
    })
    .eq("id", sessionId)

  if (error) throw error

  // Add loyalty seal
  await addLoyaltySeal()
}

export const getActiveQRSessions = async (): Promise<Array<{ session: QRSession; child: Child }>> => {
  const { data: sessions, error } = await supabase
    .from("qr_sessions")
    .select(`
      *,
      children (*)
    `)
    .eq("is_active", true)

  if (error) throw error

  return (sessions || []).map((session) => ({
    session: {
      id: session.id,
      child_id: session.child_id,
      token: session.token,
      is_active: session.is_active,
      entry_time: session.entry_time,
      exit_time: session.exit_time,
      expires_at: session.expires_at,
      created_at: session.created_at,
    },
    child: (session as any).children,
  }))
}

// Loyalty Program Services
export const getLoyaltyProgram = async (): Promise<LoyaltyProgram> => {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase.from("loyalty_programs").select("*").eq("parent_id", user.id).single()

  if (error && error.code === "PGRST116") {
    // No loyalty program found, create one
    const { data: newProgram, error: insertError } = await supabase
      .from("loyalty_programs")
      .insert({
        parent_id: user.id,
        seals: 0,
        free_entries: 0,
      })
      .select()
      .single()

    if (insertError) throw insertError
    return newProgram
  }

  if (error) throw error
  return data
}

export const addLoyaltySeal = async (): Promise<void> => {
  const loyalty = await getLoyaltyProgram()
  const newSeals = loyalty.seals + 1
  const newFreeEntries = loyalty.free_entries + Math.floor(newSeals / 10)

  const { error } = await supabase
    .from("loyalty_programs")
    .update({
      seals: newSeals % 10,
      free_entries: newFreeEntries,
      last_updated: new Date().toISOString(),
    })
    .eq("id", loyalty.id)

  if (error) throw error
}

// Party Booking Services
export const createPartyBooking = async (bookingData: {
  childName: string
  date: Date
  time: string
  guests: number
  packageType: string
  notes?: string
}) => {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("party_bookings")
    .insert({
      parent_id: user.id,
      child_name: bookingData.childName,
      date: bookingData.date.toISOString().split("T")[0],
      time: bookingData.time,
      guests: bookingData.guests,
      package_type: bookingData.packageType,
      notes: bookingData.notes || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getPartyBookings = async (): Promise<PartyBooking[]> => {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("party_bookings")
    .select("*")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

// Support Ticket Services
export const createSupportTicket = async (ticketData: {
  type: "doubt" | "suggestion" | "complaint"
  subject: string
  description: string
}) => {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      parent_id: user.id,
      type: ticketData.type,
      subject: ticketData.subject,
      description: ticketData.description,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getSupportTickets = async (): Promise<SupportTicket[]> => {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

// Emergency Alert Services
export const createEmergencyAlert = async (childId: string, type: string, message: string, operatorId: string) => {
  const { data, error } = await supabase
    .from("emergency_alerts")
    .insert({
      child_id: childId,
      type,
      message,
      operator_id: operatorId,
    })
    .select()
    .single()

  if (error) throw error

  // Here you would send push notification to parent
  // await sendPushNotification(childId, type, message);

  return data
}

// Admin Services
export const getDailyStats = async () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data: sessions, error } = await supabase
    .from("qr_sessions")
    .select("*")
    .gte("created_at", today.toISOString())
    .lt("created_at", tomorrow.toISOString())

  if (error) throw error

  const totalEntries = sessions?.length || 0
  const activeEntries = sessions?.filter((s) => s.is_active).length || 0
  const completedEntries = sessions?.filter((s) => s.exit_time).length || 0

  return {
    totalEntries,
    activeEntries,
    completedEntries,
  }
}

// Real-time subscriptions
export const subscribeToQRSessions = (callback: (payload: any) => void) => {
  return supabase
    .channel("qr_sessions_changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "qr_sessions" }, callback)
    .subscribe()
}

export const subscribeToEmergencyAlerts = (callback: (payload: any) => void) => {
  return supabase
    .channel("emergency_alerts_changes")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "emergency_alerts" }, callback)
    .subscribe()
}
