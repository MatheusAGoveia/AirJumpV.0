"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "../lib/supabase"
import { childrenService } from "../services/supabaseService"
import { generateQRCode } from "../utils/qrUtils"

export default function AddChildScreen({ navigation }: any) {
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [emergencyContact, setEmergencyContact] = useState("")
  const [medicalInfo, setMedicalInfo] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAddChild = async () => {
    if (!name || !age || !emergencyContact) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios")
      return
    }

    const ageNumber = Number.parseInt(age)
    if (isNaN(ageNumber) || ageNumber < 1 || ageNumber > 17) {
      Alert.alert("Erro", "Idade deve ser entre 1 e 17 anos")
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuário não encontrado")

      const qrCode = generateQRCode(user.id + Date.now(), name)

      const childData = {
        parent_id: user.id,
        name: name.trim(),
        age: ageNumber,
        emergency_contact: emergencyContact.trim(),
        medical_info: medicalInfo.trim() || null,
        qr_code: qrCode,
        visits: 0,
      }

      const newChild = await childrenService.addChild(childData)

      if (newChild) {
        Alert.alert("Sucesso!", "Criança cadastrada com sucesso!", [
          {
            text: "Ver QR Code",
            onPress: () => navigation.navigate("QRCode", { childId: newChild.id }),
          },
          {
            text: "Voltar",
            onPress: () => navigation.goBack(),
          },
        ])

        // Clear form
        setName("")
        setAge("")
        setEmergencyContact("")
        setMedicalInfo("")
      } else {
        throw new Error("Erro ao cadastrar criança")
      }
    } catch (error: any) {
      Alert.alert("Erro", error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.title}>Adicionar Criança</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Digite o nome completo"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Idade *</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Digite a idade"
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contato de Emergência *</Text>
            <TextInput
              style={styles.input}
              value={emergencyContact}
              onChangeText={setEmergencyContact}
              placeholder="(11) 99999-9999"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Informações Médicas</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={medicalInfo}
              onChangeText={setMedicalInfo}
              placeholder="Alergias, medicamentos, condições especiais..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAddChild}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Cadastrando..." : "Cadastrar Criança"}</Text>
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>QR Code Automático</Text>
              <Text style={styles.infoDescription}>
                Um QR Code único será gerado automaticamente para esta criança, permitindo entrada e saída rápida no
                parque.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
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
  placeholder: {
    width: 40,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  button: {
    backgroundColor: "#3B82F6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 12,
    color: "#1e40af",
    lineHeight: 16,
  },
})
