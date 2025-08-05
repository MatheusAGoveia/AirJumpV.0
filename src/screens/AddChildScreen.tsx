"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { addChild } from "../services/firebaseService"

export default function AddChildScreen({ navigation }: any) {
  const [name, setName] = useState("")
  const [birthDate, setBirthDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [medicalNotes, setMedicalNotes] = useState("")
  const [hasDisability, setHasDisability] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Erro", "Nome é obrigatório")
      return
    }

    setLoading(true)

    try {
      await addChild({
        name: name.trim(),
        birthDate,
        medicalNotes: medicalNotes.trim(),
        hasDisability,
        parentId: "", // Will be set in the service
      })

      Alert.alert("Sucesso", "Criança cadastrada com sucesso!", [{ text: "OK", onPress: () => navigation.goBack() }])
    } catch (error) {
      console.error("Error adding child:", error)
      Alert.alert("Erro", "Não foi possível cadastrar a criança")
    } finally {
      setLoading(false)
    }
  }

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios")
    if (selectedDate) {
      setBirthDate(selectedDate)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastrar Criança</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.formTitle}>Informações da Criança</Text>
          <Text style={styles.formSubtitle}>Preencha os dados para garantir a segurança e diversão</Text>

          {/* Nome */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome completo da criança"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Data de Nascimento */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de Nascimento *</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.dateText}>{birthDate.toLocaleDateString("pt-BR")}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={birthDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Observações Médicas */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Observações Médicas</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Alergias, medicamentos, condições especiais..."
              value={medicalNotes}
              onChangeText={setMedicalNotes}
              multiline
              numberOfLines={3}
            />
            <Text style={styles.helperText}>Informações importantes para a segurança da criança</Text>
          </View>

          {/* Criança com Deficiência */}
          <View style={styles.switchGroup}>
            <View style={styles.switchHeader}>
              <Text style={styles.switchLabel}>Criança com deficiência</Text>
              <Switch
                value={hasDisability}
                onValueChange={setHasDisability}
                trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                thumbColor={hasDisability ? "#FFFFFF" : "#FFFFFF"}
              />
            </View>

            {hasDisability && (
              <View style={styles.disabilityInfo}>
                <Text style={styles.disabilityTitle}>⚠️ Benefícios da Legislação Estadual:</Text>
                <View style={styles.benefitsList}>
                  <Text style={styles.benefitItem}>• 1ª e 2ª criança com deficiência: entrada gratuita</Text>
                  <Text style={styles.benefitItem}>• 3ª criança em diante: 50% de desconto</Text>
                  <Text style={styles.benefitItem}>• Responsável deve permanecer na loja</Text>
                </View>

                <TouchableOpacity style={styles.documentUpload}>
                  <Ionicons name="cloud-upload-outline" size={24} color="#3B82F6" />
                  <Text style={styles.documentUploadText}>Upload do documento comprobatório</Text>
                  <Text style={styles.documentUploadSubtext}>Laudo médico ou documento oficial</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Tags Automáticas */}
          <View style={styles.tagsInfo}>
            <Text style={styles.tagsTitle}>Tags Automáticas:</Text>
            <View style={styles.tagsList}>
              <Text style={styles.tagItem}>⚠️ Deficiência (se aplicável)</Text>
              <Text style={styles.tagItem}>🥸 Menor de 5 anos (calculado automaticamente)</Text>
              <Text style={styles.tagItem}>👦 Cliente menor de idade (calculado automaticamente)</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>{loading ? "Cadastrando..." : "Cadastrar Criança"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
  },
  form: {
    backgroundColor: "white",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "white",
  },
  dateText: {
    fontSize: 16,
    color: "#1f2937",
    marginLeft: 8,
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  switchGroup: {
    marginBottom: 20,
  },
  switchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  disabilityInfo: {
    backgroundColor: "#EBF8FF",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  disabilityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 8,
  },
  benefitsList: {
    marginBottom: 16,
  },
  benefitItem: {
    fontSize: 12,
    color: "#1E40AF",
    marginBottom: 4,
  },
  documentUpload: {
    alignItems: "center",
    padding: 16,
    borderWidth: 2,
    borderColor: "#BFDBFE",
    borderStyle: "dashed",
    borderRadius: 8,
    backgroundColor: "white",
  },
  documentUploadText: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "600",
    marginTop: 4,
  },
  documentUploadSubtext: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
  },
  tagsInfo: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  tagsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  tagsList: {
    gap: 4,
  },
  tagItem: {
    fontSize: 12,
    color: "#6B7280",
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
