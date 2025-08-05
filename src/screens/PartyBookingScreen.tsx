"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Picker } from "@react-native-picker/picker"
import { createPartyBooking } from "../services/supabaseService"

interface PartyBookingScreenProps {
  navigation: any
}

export default function PartyBookingScreen({ navigation }: PartyBookingScreenProps) {
  const [childName, setChildName] = useState("")
  const [date, setDate] = useState(new Date())
  const [time, setTime] = useState("14:00")
  const [guests, setGuests] = useState("")
  const [packageType, setPackageType] = useState("")
  const [notes, setNotes] = useState("")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!childName || !guests || !packageType) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios")
      return
    }

    setLoading(true)

    try {
      await createPartyBooking({
        childName: childName.trim(),
        date,
        time,
        guests: Number.parseInt(guests),
        packageType,
        notes: notes.trim(),
      })

      Alert.alert("Sucesso", "Solicitação enviada! Entraremos em contato via WhatsApp para confirmação.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ])
    } catch (error) {
      console.error("Error creating party booking:", error)
      Alert.alert("Erro", "Não foi possível enviar a solicitação")
    } finally {
      setLoading(false)
    }
  }

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios")
    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agendar Festa</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="gift" size={20} color="#8B5CF6" />
            <Text style={styles.infoTitle}>Festa Inesquecível!</Text>
          </View>
          <Text style={styles.infoText}>
            Comemore o aniversário do seu filho com segurança e diversão no Air Jump Monte Carmo.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Solicitar Agendamento</Text>
          <Text style={styles.formSubtitle}>Preencha os dados e nossa equipe entrará em contato</Text>

          {/* Nome do Aniversariante */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Aniversariante *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da criança"
              value={childName}
              onChangeText={setChildName}
              autoCapitalize="words"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Data da Festa */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data da Festa *</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.dateText}>{date.toLocaleDateString("pt-BR")}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          {/* Horário */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Horário *</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={time} onValueChange={(itemValue) => setTime(itemValue)} style={styles.picker}>
                <Picker.Item label="14:00" value="14:00" />
                <Picker.Item label="15:00" value="15:00" />
                <Picker.Item label="16:00" value="16:00" />
                <Picker.Item label="17:00" value="17:00" />
                <Picker.Item label="18:00" value="18:00" />
              </Picker>
            </View>
          </View>

          {/* Número de Convidados */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número de Convidados *</Text>
            <TextInput
              style={styles.input}
              placeholder="Quantas crianças?"
              value={guests}
              onChangeText={setGuests}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Tipo de Pacote */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Pacote *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={packageType}
                onValueChange={(itemValue) => setPackageType(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Selecione o pacote" value="" />
                <Picker.Item label="Básico - 1h de diversão" value="basic" />
                <Picker.Item label="Padrão - 1h30 + lanche" value="standard" />
                <Picker.Item label="Premium - 2h + lanche + decoração" value="premium" />
                <Picker.Item label="Deluxe - 2h30 + lanche + decoração + animação" value="deluxe" />
              </Picker>
            </View>
          </View>

          {/* Observações */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tema da festa, alergias, pedidos especiais..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Packages Info */}
          <View style={styles.packagesCard}>
            <Text style={styles.packagesTitle}>Nossos Pacotes</Text>
            <View style={styles.packagesList}>
              <View style={[styles.packageItem, { borderLeftColor: "#3B82F6" }]}>
                <Text style={styles.packageName}>Básico - R$ 299</Text>
                <Text style={styles.packageDescription}>1h de diversão para até 10 crianças</Text>
              </View>
              <View style={[styles.packageItem, { borderLeftColor: "#10B981" }]}>
                <Text style={styles.packageName}>Padrão - R$ 449</Text>
                <Text style={styles.packageDescription}>1h30 + lanche simples para até 15 crianças</Text>
              </View>
              <View style={[styles.packageItem, { borderLeftColor: "#8B5CF6" }]}>
                <Text style={styles.packageName}>Premium - R$ 649</Text>
                <Text style={styles.packageDescription}>2h + lanche + decoração para até 20 crianças</Text>
              </View>
              <View style={[styles.packageItem, { borderLeftColor: "#F59E0B" }]}>
                <Text style={styles.packageName}>Deluxe - R$ 899</Text>
                <Text style={styles.packageDescription}>2h30 + lanche + decoração + animação para até 25 crianças</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>{loading ? "Enviando Solicitação..." : "Solicitar Agendamento"}</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Após o envio, nossa equipe entrará em contato via WhatsApp para confirmação e detalhes do pagamento.
          </Text>
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
  infoCard: {
    backgroundColor: "#F3E8FF",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#8B5CF6",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C3AED",
    marginLeft: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#7C3AED",
    lineHeight: 16,
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
    color: "#1f2937",
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "white",
  },
  picker: {
    height: 50,
  },
  packagesCard: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  packagesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  packagesList: {
    gap: 12,
  },
  packageItem: {
    borderLeftWidth: 4,
    paddingLeft: 12,
  },
  packageName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  packageDescription: {
    fontSize: 12,
    color: "#6b7280",
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
})
