"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ActivityIndicator } from "react-native"
import { BarCodeScanner } from "expo-barcode-scanner"
import { Ionicons } from "@expo/vector-icons"
import { validateQRToken, checkInChild, checkOutChild } from "../services/firebaseService"

export default function AdminScannerScreen({ navigation }: any) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)
  const [manualCode, setManualCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [scannerActive, setScannerActive] = useState(true)

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === "granted")
    }

    getBarCodeScannerPermissions()
  }, [])

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true)
    processQRCode(data)
  }

  const processQRCode = async (qrData: string) => {
    setLoading(true)

    try {
      const validation = await validateQRToken(qrData)

      if (!validation.valid || !validation.session || !validation.child) {
        Alert.alert("QR Code Inválido", "Este QR Code não é válido ou expirou")
        resetScanner()
        return
      }

      const { session, child } = validation

      // Show child information and action options
      Alert.alert(
        "QR Code Válido",
        `Criança: ${child.name}\nIdade: ${new Date().getFullYear() - child.birthDate.getFullYear()} anos\nTags: ${child.tags.join(" ")}\nStatus: ${session.isActive ? "Brincando" : "Aguardando entrada"}`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: session.isActive ? "Fazer Saída" : "Fazer Entrada",
            onPress: () => handleCheckInOut(session.id!, session.isActive),
          },
        ],
      )
    } catch (error) {
      console.error("Error processing QR code:", error)
      Alert.alert("Erro", "Não foi possível processar o QR Code")
    } finally {
      setLoading(false)
      resetScanner()
    }
  }

  const handleCheckInOut = async (sessionId: string, isCurrentlyActive: boolean) => {
    try {
      if (isCurrentlyActive) {
        await checkOutChild(sessionId)
        Alert.alert("Sucesso", "Saída registrada com sucesso!")
      } else {
        await checkInChild(sessionId)
        Alert.alert("Sucesso", "Entrada registrada com sucesso!")
      }
    } catch (error) {
      console.error("Error checking in/out:", error)
      Alert.alert("Erro", "Não foi possível registrar a operação")
    }
  }

  const resetScanner = () => {
    setScanned(false)
    setManualCode("")
  }

  const handleManualValidation = () => {
    if (!manualCode.trim()) {
      Alert.alert("Erro", "Digite o código QR")
      return
    }

    processQRCode(manualCode.trim())
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
        <Text style={styles.errorSubtext}>Permita o acesso à câmera nas configurações do app</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scanner QR Code</Text>
        <TouchableOpacity onPress={() => setScannerActive(!scannerActive)}>
          <Ionicons name={scannerActive ? "pause" : "play"} size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Scanner */}
      {scannerActive && (
        <View style={styles.scannerContainer}>
          <BarCodeScanner onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} style={styles.scanner} />

          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerText}>Posicione o QR Code dentro do quadro</Text>
          </View>
        </View>
      )}

      {/* Manual Input */}
      <View style={styles.manualSection}>
        <Text style={styles.manualTitle}>Ou digite o código manualmente:</Text>
        <View style={styles.manualInputContainer}>
          <TextInput
            style={styles.manualInput}
            placeholder="AJ-XXXXXXXXXXXXXXXX"
            value={manualCode}
            onChangeText={setManualCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.validateButton} onPress={handleManualValidation} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.validateButtonText}>Validar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Reset Button */}
      {scanned && (
        <TouchableOpacity style={styles.resetButton} onPress={resetScanner}>
          <Ionicons name="refresh" size={20} color="#3B82F6" />
          <Text style={styles.resetButtonText}>Escanear Novamente</Text>
        </TouchableOpacity>
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  scannerContainer: {
    flex: 1,
    position: "relative",
  },
  scanner: {
    flex: 1,
  },
  scannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#3B82F6",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  scannerText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  manualSection: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  manualTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  manualInputContainer: {
    flexDirection: "row",
    gap: 12,
  },
  manualInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "monospace",
  },
  validateButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },
  validateButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  resetButtonText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  errorText: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
})
