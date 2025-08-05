"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { BarCodeScanner } from "expo-barcode-scanner"
import { Ionicons } from "@expo/vector-icons"
import { childrenService, visitService } from "../services/supabaseService"
import { decodeQRCode } from "../utils/qrUtils"

export default function AdminScannerScreen({ navigation }: any) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === "granted")
    }

    getBarCodeScannerPermissions()
  }, [])

  const handleBarCodeScanned = async ({ type, data }: any) => {
    if (scanned || processing) return

    setScanned(true)
    setProcessing(true)

    try {
      // Decode QR code
      const qrData = decodeQRCode(data)

      if (!qrData) {
        Alert.alert("Erro", "QR Code inválido")
        return
      }

      if (qrData.expired) {
        Alert.alert("Erro", "QR Code expirado. Solicite um novo código.")
        return
      }

      // Find child by QR code
      const child = await childrenService.getChildByQR(data)

      if (!child) {
        Alert.alert("Erro", "Criança não encontrada")
        return
      }

      // Check if child has an active visit
      const activeVisit = await visitService.getActiveVisit(child.id)

      if (activeVisit) {
        // Check out
        const success = await visitService.checkOut(activeVisit.id)

        if (success) {
          Alert.alert(
            "Saída Registrada!",
            `${child.name} saiu do parque.\n\nHorário de saída: ${new Date().toLocaleTimeString("pt-BR")}`,
            [{ text: "OK", onPress: () => setScanned(false) }],
          )
        } else {
          Alert.alert("Erro", "Não foi possível registrar a saída")
        }
      } else {
        // Check in
        const visit = await visitService.checkIn(child.id)

        if (visit) {
          // Update visit count
          await childrenService.updateVisits(child.id, child.visits + 1)

          Alert.alert(
            "Entrada Registrada!",
            `${child.name} entrou no parque.\n\nIdade: ${child.age} anos\nVisitas: ${child.visits + 1}\nHorário: ${new Date().toLocaleTimeString("pt-BR")}`,
            [{ text: "OK", onPress: () => setScanned(false) }],
          )
        } else {
          Alert.alert("Erro", "Não foi possível registrar a entrada")
        }
      }
    } catch (error) {
      console.error("Error processing QR code:", error)
      Alert.alert("Erro", "Erro ao processar QR Code")
    } finally {
      setProcessing(false)
      setTimeout(() => setScanned(false), 2000)
    }
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Solicitando permissão da câmera...</Text>
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Sem acesso à câmera</Text>
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
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Scanner QR Code</Text>
        <View style={styles.placeholder} />
      </View>

      <BarCodeScanner onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} style={styles.scanner} />

      <View style={styles.overlay}>
        <View style={styles.scanArea} />
        <Text style={styles.instructionText}>{processing ? "Processando..." : "Aponte a câmera para o QR Code"}</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={() => setScanned(false)} disabled={processing}>
          <Ionicons name="refresh" size={24} color="#3B82F6" />
          <Text style={styles.resetText}>Escanear Novamente</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "rgba(0,0,0,0.5)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  placeholder: {
    width: 40,
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#3B82F6",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  instructionText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 12,
    borderRadius: 8,
  },
  footer: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  resetButton: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
  },
  resetText: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  errorText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#3B82F6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})
