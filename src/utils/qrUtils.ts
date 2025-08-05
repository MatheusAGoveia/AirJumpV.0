import CryptoJS from "crypto-js"

export const generateQRToken = (childId: string): string => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const data = `${childId}-${timestamp}-${randomString}`

  // Encrypt the data
  const encrypted = CryptoJS.AES.encrypt(data, "air-jump-secret-key").toString()

  // Create a shorter, URL-safe token
  const token = CryptoJS.SHA256(encrypted).toString().substring(0, 16)

  return `AJ-${token.toUpperCase()}`
}

export const validateQRTokenFormat = (token: string): boolean => {
  const qrRegex = /^AJ-[A-F0-9]{16}$/
  return qrRegex.test(token)
}

export const calculateAge = (birthDate: Date): number => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

export const generateChildTags = (birthDate: Date, hasDisability: boolean): string[] => {
  const age = calculateAge(birthDate)
  const tags: string[] = []

  if (hasDisability) tags.push("⚠️")
  if (age < 5) tags.push("🥸")
  if (age < 18) tags.push("👦")

  return tags
}
