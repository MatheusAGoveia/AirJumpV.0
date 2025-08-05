import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { auth, db } from "../../App"
import { generateQRToken } from "../utils/qrUtils"

export interface Child {
  id?: string
  name: string
  birthDate: Date
  photo?: string
  medicalNotes?: string
  hasDisability: boolean
  disabilityDocument?: string
  parentId: string
  tags: string[]
  createdAt: Date
}

export interface QRSession {
  id?: string
  childId: string
  token: string
  isActive: boolean
  entryTime?: Date
  exitTime?: Date
  expiresAt: Date
  createdAt: Date
}

export interface LoyaltyProgram {
  id?: string
  parentId: string
  seals: number
  freeEntries: number
  lastUpdated: Date
}

export interface PartyBooking {
  id?: string
  parentId: string
  childName: string
  date: Date
  time: string
  guests: number
  packageType: string
  notes?: string
  status: "pending" | "confirmed" | "cancelled"
  createdAt: Date
}

export interface SupportTicket {
  id?: string
  parentId: string
  type: "doubt" | "suggestion" | "complaint"
  subject: string
  description: string
  status: "open" | "in_progress" | "closed"
  createdAt: Date
}

export interface EmergencyAlert {
  id?: string
  childId: string
  type: string
  message: string
  operatorId: string
  status: "active" | "resolved"
  createdAt: Date
  resolvedAt?: Date
}

// Children Services
export const addChild = async (childData: Omit<Child, "id" | "createdAt" | "tags">): Promise<string> => {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  const birthDate = new Date(childData.birthDate)
  const age = new Date().getFullYear() - birthDate.getFullYear()

  const tags: string[] = []
  if (childData.hasDisability) tags.push("⚠️")
  if (age < 5) tags.push("🥸")
  if (age < 18) tags.push("👦")

  const child: Omit<Child, "id"> = {
    ...childData,
    parentId: user.uid,
    tags,
    createdAt: new Date(),
  }

  const docRef = await addDoc(collection(db, "children"), {
    ...child,
    birthDate: Timestamp.fromDate(child.birthDate),
    createdAt: serverTimestamp(),
  })

  return docRef.id
}

export const getChildren = async (): Promise<Child[]> => {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  const q = query(collection(db, "children"), where("parentId", "==", user.uid), orderBy("createdAt", "desc"))

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    birthDate: doc.data().birthDate.toDate(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Child[]
}

// QR Session Services
export const generateQRSession = async (childId: string): Promise<QRSession> => {
  const token = generateQRToken(childId)
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours

  const session: Omit<QRSession, "id"> = {
    childId,
    token,
    isActive: false,
    expiresAt,
    createdAt: new Date(),
  }

  const docRef = await addDoc(collection(db, "qrSessions"), {
    ...session,
    expiresAt: Timestamp.fromDate(session.expiresAt),
    createdAt: serverTimestamp(),
  })

  return { id: docRef.id, ...session }
}

export const validateQRToken = async (
  token: string,
): Promise<{ valid: boolean; session?: QRSession; child?: Child }> => {
  const q = query(collection(db, "qrSessions"), where("token", "==", token))

  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    return { valid: false }
  }

  const sessionDoc = querySnapshot.docs[0]
  const sessionData = sessionDoc.data()

  const session: QRSession = {
    id: sessionDoc.id,
    ...sessionData,
    expiresAt: sessionData.expiresAt.toDate(),
    createdAt: sessionData.createdAt.toDate(),
    entryTime: sessionData.entryTime?.toDate(),
    exitTime: sessionData.exitTime?.toDate(),
  } as QRSession

  // Check if expired
  if (session.expiresAt < new Date()) {
    return { valid: false }
  }

  // Get child data
  const childDoc = await getDoc(doc(db, "children", session.childId))
  const child = childDoc.exists()
    ? ({
        id: childDoc.id,
        ...childDoc.data(),
        birthDate: childDoc.data().birthDate.toDate(),
        createdAt: childDoc.data().createdAt.toDate(),
      } as Child)
    : undefined

  return { valid: true, session, child }
}

export const checkInChild = async (sessionId: string): Promise<void> => {
  await updateDoc(doc(db, "qrSessions", sessionId), {
    isActive: true,
    entryTime: serverTimestamp(),
  })
}

export const checkOutChild = async (sessionId: string): Promise<void> => {
  await updateDoc(doc(db, "qrSessions", sessionId), {
    isActive: false,
    exitTime: serverTimestamp(),
  })

  // Add loyalty seal
  await addLoyaltySeal()
}

// Loyalty Program Services
export const getLoyaltyProgram = async (): Promise<LoyaltyProgram> => {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  const q = query(collection(db, "loyaltyPrograms"), where("parentId", "==", user.uid))

  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    // Create new loyalty program
    const newProgram: Omit<LoyaltyProgram, "id"> = {
      parentId: user.uid,
      seals: 0,
      freeEntries: 0,
      lastUpdated: new Date(),
    }

    const docRef = await addDoc(collection(db, "loyaltyPrograms"), {
      ...newProgram,
      lastUpdated: serverTimestamp(),
    })

    return { id: docRef.id, ...newProgram }
  }

  const doc = querySnapshot.docs[0]
  return {
    id: doc.id,
    ...doc.data(),
    lastUpdated: doc.data().lastUpdated.toDate(),
  } as LoyaltyProgram
}

export const addLoyaltySeal = async (): Promise<void> => {
  const loyalty = await getLoyaltyProgram()
  const newSeals = loyalty.seals + 1
  const newFreeEntries = loyalty.freeEntries + Math.floor(newSeals / 10)

  await updateDoc(doc(db, "loyaltyPrograms", loyalty.id!), {
    seals: newSeals % 10,
    freeEntries: newFreeEntries,
    lastUpdated: serverTimestamp(),
  })
}

// Party Booking Services
export const createPartyBooking = async (
  bookingData: Omit<PartyBooking, "id" | "parentId" | "status" | "createdAt">,
): Promise<string> => {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  const booking: Omit<PartyBooking, "id"> = {
    ...bookingData,
    parentId: user.uid,
    status: "pending",
    createdAt: new Date(),
  }

  const docRef = await addDoc(collection(db, "partyBookings"), {
    ...booking,
    date: Timestamp.fromDate(booking.date),
    createdAt: serverTimestamp(),
  })

  return docRef.id
}

// Support Ticket Services
export const createSupportTicket = async (
  ticketData: Omit<SupportTicket, "id" | "parentId" | "status" | "createdAt">,
): Promise<string> => {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  const ticket: Omit<SupportTicket, "id"> = {
    ...ticketData,
    parentId: user.uid,
    status: "open",
    createdAt: new Date(),
  }

  const docRef = await addDoc(collection(db, "supportTickets"), {
    ...ticket,
    createdAt: serverTimestamp(),
  })

  return docRef.id
}

// Emergency Alert Services
export const createEmergencyAlert = async (
  childId: string,
  type: string,
  message: string,
  operatorId: string,
): Promise<string> => {
  const alert: Omit<EmergencyAlert, "id"> = {
    childId,
    type,
    message,
    operatorId,
    status: "active",
    createdAt: new Date(),
  }

  const docRef = await addDoc(collection(db, "emergencyAlerts"), {
    ...alert,
    createdAt: serverTimestamp(),
  })

  // Here you would send push notification to parent
  // await sendPushNotification(childId, type, message);

  return docRef.id
}

// Admin Services
export const getActiveChildren = async (): Promise<Array<{ session: QRSession; child: Child }>> => {
  const q = query(collection(db, "qrSessions"), where("isActive", "==", true))

  const querySnapshot = await getDocs(q)
  const activeSessions = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    expiresAt: doc.data().expiresAt.toDate(),
    createdAt: doc.data().createdAt.toDate(),
    entryTime: doc.data().entryTime?.toDate(),
    exitTime: doc.data().exitTime?.toDate(),
  })) as QRSession[]

  const activeChildren = await Promise.all(
    activeSessions.map(async (session) => {
      const childDoc = await getDoc(doc(db, "children", session.childId))
      const child = {
        id: childDoc.id,
        ...childDoc.data(),
        birthDate: childDoc.data()?.birthDate.toDate(),
        createdAt: childDoc.data()?.createdAt.toDate(),
      } as Child

      return { session, child }
    }),
  )

  return activeChildren
}

export const getDailyStats = async () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const q = query(
    collection(db, "qrSessions"),
    where("createdAt", ">=", Timestamp.fromDate(today)),
    where("createdAt", "<", Timestamp.fromDate(tomorrow)),
  )

  const querySnapshot = await getDocs(q)
  const sessions = querySnapshot.docs.map((doc) => doc.data())

  const totalEntries = sessions.length
  const paidEntries = sessions.filter((s) => !s.isFree).length
  const freeEntries = sessions.filter((s) => s.isFree).length
  const disabilityEntries = sessions.filter((s) => s.hasDisability).length

  return {
    totalEntries,
    paidEntries,
    freeEntries,
    disabilityEntries,
  }
}
