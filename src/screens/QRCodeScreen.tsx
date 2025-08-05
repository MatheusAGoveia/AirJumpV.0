"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import QRCode from "react-native-qrcode-svg"
import { generateQRSession, getDoc, doc, type QRSession, type Child } from "../services/firebaseService"
import { db } from "../../App"

export default function QRCodeScreen({ route, navigation }: any) {
  const { childId } = route.params
  const [child, setChild] = useState<Child | null>(null)
  const [qrSession, setQrSession] = useState<QRSession | null>(null)
  const [timeLeft, setTimeLeft] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChildData()
    generateQR()
  }, [])

  useEffect(() => {
    if (qrSession) {
      const timer = setInterval(updateTimer, 1000)
      return () => clearInterval(timer)
    }
  }, [qrSession])

  const loadChildData = async () => {
    try {
      const childDoc = await getDoc(doc(db, "children", childId))
      if (childDoc.exists()) {
        setChild({
          id: childDoc.id,
          ...childDoc.data(),
          birthDate: childDoc.data().birthDate.toDate(),
          createdAt: childDoc.data().createdAt.toDate(),
        } as Child)
      }
    } catch (error) {
      console.error("Error loading child:", error)
      Alert.alert("Erro", "Não foi possível carregar os dados da criança")
    }
  }

  const generateQR = async () => {
    try {
      setLoading(true)
      const session = await generateQRSession(childId)
      setQrSession(session)
    } catch (error) {
      console.error("Error generating QR:", error)
      Alert.alert("Erro", "Não foi possível gerar o QR Code")
    } finally {
      setLoading(false)
    }
  }

  const updateTimer = () => {
    if (!qrSession) return

    const now = new Date()
    const diff = qrSession.expiresAt.getTime() - now.getTime()

    if (diff <= 0) {
      setTimeLeft("Expirado")
      return
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
  }

  const renderSafetyAlert = () => {
    if (!child) return null

    const alerts = []

    if (child.tags.includes("🥸")) {
      alerts.push({
        icon: "warning",
        color: "#F59E0B",
        title: "Atenção - Menor de 5 anos",
        message: "Esta criança deve estar acompanhada por um responsável maior de 18 anos durante toda a permanência.",
      })
    }

    if (child.hasDisability) {
      alerts.push({
        icon: "medical",
        color: "#EF4444",
        title: "Criança com Deficiência",
        message:
          "O responsável deve permanecer na loja durante toda a sessão. Entrada gratuita conforme legislação estadual.",
      })
    }

    return alerts.map((alert, index) => (
      <View key={index} style={[styles.alertCard, { borderLeftColor: alert.color }]}>
        <View style={styles.alertHeader}>
          <Ionicons name={alert.icon as any} size={20} color={alert.color} />
          <Text style={[styles.alertTitle, { color: alert.color }]}>{alert.title}</Text>
        </View>
        <Text style={styles.alertMessage}>{alert.message}</Text>
      </View>
    ))
  }

  if (loading || !child || !qrSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Gerando QR Code...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Code de Entrada</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Child Info */}
        <View style={styles.childCard}>
          <View style={styles.childAvatar}>
            <Text style={styles.childInitials}>
              {child.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)}
            </Text>
          </View>

          <View style={styles.childInfo}>
            <View style={styles.childNameRow}>
              <Text style={styles.childName}>{child.name}</Text>
              <View style={styles.tagsContainer}>
                {child.tags.map((tag, index) => (
                  <Text key={index} style={styles.tag}>
                    {tag}
                  </Text>
                ))}
              </View>
            </View>
            <Text style={styles.childAge}>{new Date().getFullYear() - child.birthDate.getFullYear()} anos</Text>
            {child.medicalNotes && <Text style={styles.medicalNotes}>⚕️ {child.medicalNotes}</Text>}
          </View>
        </View>

        {/* QR Code */}
        <View style={styles.qrCard}>
          <Text style={styles.qrTitle}>QR Code Dinâmico</Text>
          <Text style={styles.qrSubtitle}>Apresente este código na entrada</Text>

          <View style={styles.qrContainer}>
            <QRCode value={qrSession.token} size={200} backgroundColor="white" color="black" />
          </View>

          <View style={styles.qrInfo}>
            <Text style={styles.qrToken}>{qrSession.token}</Text>
            <View style={styles.timerContainer}>
              <Ionicons name="time" size={16} color="#6B7280" />
              <Text style={styles.timerText}>Expira em: {timeLeft}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.refreshButton} onPress={generateQR}>
            <Ionicons name="refresh" size={16} color="#3B82F6" />
            <Text style={styles.refreshButtonText}>Renovar QR Code</Text>
          </TouchableOpacity>
        </View>

        {/* Safety Alerts */}
        {renderSafetyAlert()}

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Como usar</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>Apresente este QR Code na recepção</Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>Nossa equipe validará as informações de segurança</Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>O tempo de sessão será iniciado automaticamente</Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>4</Text>
              </View>
              <Text style={styles.instructionText}>Use o mesmo QR Code para a retirada segura</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  childCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  childAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  childInitials: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  childInfo: {
    flex: 1,
  },
  childNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  childName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginRight: 8,
  },
  tagsContainer: {
    flexDirection: "row",
  },
  tag: {
    fontSize: 16,
    marginRight: 4,
  },
  childAge: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  medicalNotes: {
    fontSize: 12,
    color: "#F59E0B",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  qrCard: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  qrSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    marginBottom: 16,
  },
  qrInfo: {
    alignItems: "center",
    marginBottom: 16,
  },
  qrToken: {
    fontSize: 12,
    fontFamily: "monospace",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 6,
  },
  refreshButtonText: {
    color: "#3B82F6",
    fontSize: 14,
    marginLeft: 4,
  },
  alertCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  alertMessage: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  instructionsCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  instructionNumberText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1D4ED8",
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
})
