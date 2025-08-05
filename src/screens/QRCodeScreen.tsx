"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert, Share } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import QRCode from "react-native-qrcode-svg"
import { childrenService } from "../services/supabaseService"
import type { Database } from "../lib/database.types"

type Child = Database["public"]["Tables"]["children"]["Row"]

export default function QRCodeScreen({ route, navigation }: any) {
  const { childId } = route.params
  const [child, setChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChild()
  }, [])

  const loadChild = async () => {
    try {
      const children = await childrenService.getChildren("")
      const foundChild = children.find((c) => c.id === childId)
      setChild(foundChild || null)
    } catch (error) {
      console.error("Error loading child:", error)
      Alert.alert("Erro", "Não foi possível carregar os dados da criança")
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!child) return

    try {
      await Share.share({
        message: `QR Code para ${child.name} - Air Jump Monte Carmo\nCódigo: ${child.qr_code}`,
        title: "QR Code - Air Jump",
      })
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    )
  }

  if (!child) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Criança não encontrada</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>QR Code</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.childInfo}>
          <Text style={styles.childName}>{child.name}</Text>
          <Text style={styles.childAge}>{child.age} anos</Text>
          <Text style={styles.childVisits}>{child.visits} visitas</Text>
        </View>

        <View style={styles.qrContainer}>
          <QRCode value={child.qr_code} size={200} backgroundColor="white" color="black" />
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Como usar:</Text>
          <Text style={styles.instructionsText}>• Apresente este QR Code na entrada do parque</Text>
          <Text style={styles.instructionsText}>• O código é válido por 24 horas</Text>
          <Text style={styles.instructionsText}>• Mantenha o celular com bateria</Text>
        </View>

        <View style={styles.emergencyInfo}>
          <Ionicons name="medical" size={20} color="#ef4444" />
          <View style={styles.emergencyText}>
            <Text style={styles.emergencyTitle}>Contato de Emergência:</Text>
            <Text style={styles.emergencyContact}>{child.emergency_contact}</Text>
            {child.medical_info && <Text style={styles.medicalInfo}>{child.medical_info}</Text>}
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#ef4444",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  childInfo: {
    alignItems: "center",
    marginBottom: 40,
  },
  childName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },
  childAge: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 4,
  },
  childVisits: {
    fontSize: 14,
    color: "#3B82F6",
    marginTop: 8,
  },
  qrContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 40,
  },
  instructions: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "100%",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  emergencyInfo: {
    backgroundColor: "#fef2f2",
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
  },
  emergencyText: {
    flex: 1,
    marginLeft: 12,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: 4,
  },
  emergencyContact: {
    fontSize: 14,
    color: "#dc2626",
    marginBottom: 4,
  },
  medicalInfo: {
    fontSize: 12,
    color: "#dc2626",
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#3B82F6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})
