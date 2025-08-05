import { Buffer } from "buffer"

export const generateQRCode = (childId: string, childName: string): string => {
  const timestamp = Date.now()
  const expirationTime = timestamp + 24 * 60 * 60 * 1000 // 24 hours

  const qrData = {
    childId,
    childName,
    timestamp,
    expirationTime,
    venue: "Air Jump Monte Carmo",
  }

  // Create a simple encoded string
  const encoded = Buffer.from(JSON.stringify(qrData)).toString("base64")
  return `AIRJUMP_${encoded}`
}

export const decodeQRCode = (qrCode: string): any | null => {
  try {
    if (!qrCode.startsWith("AIRJUMP_")) {
      return null
    }

    const encoded = qrCode.replace("AIRJUMP_", "")
    const decoded = Buffer.from(encoded, "base64").toString("utf-8")
    const qrData = JSON.parse(decoded)

    // Check if QR code is expired
    if (Date.now() > qrData.expirationTime) {
      return { ...qrData, expired: true }
    }

    return { ...qrData, expired: false }
  } catch (error) {
    console.error("Error decoding QR code:", error)
    return null
  }
}

export const isQRCodeValid = (qrCode: string): boolean => {
  const decoded = decodeQRCode(qrCode)
  return decoded && !decoded.expired
}
