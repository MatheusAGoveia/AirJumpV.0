"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Picker } from "@react-native-picker/picker"
import * as Linking from "expo-linking"
import { createSupportTicket } from "../services/supabaseService"

interface SupportScreenProps {
  navigation: any
}

export default function SupportScreen({ navigation }: SupportScreenProps) {
  const [ticketType, setTicketType] = useState<"doubt" | "suggestion" | "complaint" | "">("")
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!ticketType || !subject || !description) {
      Alert.alert("Erro", "Preencha todos os campos")
      return
    }

    setLoading(true)

    try {
      await createSupportTicket({
        type: ticketType as "doubt" | "suggestion" | "complaint",
        subject: subject.trim(),
        description: description.trim(),
      })

      Alert.alert("Sucesso", "Chamado enviado com sucesso! Nossa equipe entrará em contato em breve.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ])
    } catch (error) {
      console.error("Error creating support ticket:", error)
      Alert.alert("Erro", "Não foi possível enviar o chamado")
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsApp = () => {
    const phoneNumber = "5511999999999"
    const message = "Olá! Gostaria de falar sobre o Air Jump Monte Carmo."
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url)
        } else {
          Alert.alert("Erro", "WhatsApp não está instalado")
        }
      })
      .catch((err) => console.error("Error opening WhatsApp:", err))
  }

  const handleCall = () => {
    const phoneNumber = "tel:+551133333333"
    Linking.openURL(phoneNumber)
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fale Conosco</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={[styles.quickActionCard, { borderColor: "#3B82F6" }]} activeOpacity={0.8}>
            <Ionicons name="help-circle" size={24} color="#3B82F6" />
            <Text style={[styles.quickActionText, { color: "#3B82F6" }]}>Dúvida</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickActionCard, { borderColor: "#10B981" }]} activeOpacity={0.8}>
            <Ionicons name="bulb" size={24} color="#10B981" />
            <Text style={[styles.quickActionText, { color: "#10B981" }]}>Sugestão</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickActionCard, { borderColor: "#EF4444" }]} activeOpacity={0.8}>
            <Ionicons name="warning" size={24} color="#EF4444" />
            <Text style={[styles.quickActionText, { color: "#EF4444" }]}>Reclamação</Text>
          </TouchableOpacity>
        </View>

        {/* Support Form */}
        <View style={styles.form}>
          <View style={styles.formHeader}>
            <Ionicons name="chatbubble" size={20} color="#3B82F6" />
            <Text style={styles.formTitle}>Abrir Chamado</Text>
          </View>
          <Text style={styles.formSubtitle}>Nossa equipe está pronta para ajudar você</Text>

          {/* Tipo do Chamado */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo do Chamado *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={ticketType}
                onValueChange={(itemValue) => setTicketType(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Selecione o tipo" value="" />
                <Picker.Item label="Dúvida" value="doubt" />
                <Picker.Item label="Sugestão" value="suggestion" />
                <Picker.Item label="Reclamação" value="complaint" />
              </Picker>
            </View>
          </View>

          {/* Assunto */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Assunto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Resumo do seu chamado"
              value={subject}
              onChangeText={setSubject}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Descrição */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva detalhadamente sua dúvida, sugestão ou reclamação..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>{loading ? "Enviando Chamado..." : "Enviar Chamado"}</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>Você receberá uma resposta via app e WhatsApp em até 24 horas.</Text>
        </View>

        {/* Direct Contact */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contato Direto</Text>

          <TouchableOpacity style={styles.contactItem} onPress={handleWhatsApp} activeOpacity={0.8}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>WhatsApp</Text>
              <Text style={styles.contactValue}>(11) 99999-9999</Text>
            </View>
            <View style={[styles.contactButton, { backgroundColor: "#10B981" }]}>
              <Text style={styles.contactButtonText}>Conversar</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={handleCall} activeOpacity={0.8}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Telefone</Text>
              <Text style={styles.contactValue}>(11) 3333-3333</Text>
            </View>
            <View style={[styles.contactButton, { backgroundColor: "white", borderWidth: 1, borderColor: "#3B82F6" }]}>
              <Text style={[styles.contactButtonText, { color: "#3B82F6" }]}>Ligar</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 16,
    gap: 8,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
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
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginLeft: 8,
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
    color: "#1f2937",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "white",
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  disclaimer: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 16,
  },
  contactCard: {
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
  contactTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  contactValue: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  contactButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
})
