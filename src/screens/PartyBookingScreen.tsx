"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Picker } from "@react-native-picker/picker"
import DateTimePicker from "@react-native-community/datetimepicker"
import { supabase } from "../lib/supabase"
import { partyService } from "../services/supabaseService"

const PARTY_PACKAGES = [
  { id: "basic", name: "Básico", price: 299, description: "2h de diversão + decoração simples" },
  { id: "premium", name: "Premium", price: 499, description: "3h de diversão + decoração + lanche" },
  { id: "deluxe", name: "Deluxe", price: 699, description: "4h de diversão + decoração + lanche + animação" },
]

export default function PartyBookingScreen({ navigation }: any) {
  const [childName, setChildName] = useState("")
  const [selectedPackage, setSelectedPackage] = useState("basic")
  const [guests, setGuests] = useState("10")
  const [date, setDate] = useState(new Date())
  const [time, setTime] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [loading, setLoading] = useState(false)

  const selectedPackageData = PARTY_PACKAGES.find((p) => p.id === selectedPackage)
  const guestCount = Number.parseInt(guests) || 0
  const totalPrice = selectedPackageData ? selectedPackageData.price + guestCount * 15 : 0

  const handleBookParty = async () => {
    if (!childName.trim()) {
      Alert.alert("Erro", "Por favor, digite o nome da criança")
      return
    }

    if (guestCount < 5 || guestCount > 50) {
      Alert.alert("Erro", "Número de convidados deve ser entre 5 e 50")
      return
    }

    const selectedDate = new Date(date)
    const selectedTime = new Date(time)

    // Check if date is in the future
    const now = new Date()
    if (selectedDate < now) {
      Alert.alert("Erro", "Por favor, selecione uma data futura")
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuário não encontrado")

      const partyData = {
        parent_id: user.id,
        child_name: childName.trim(),
        date: selectedDate.toISOString().split("T")[0],
        time: selectedTime.toTimeString().split(" ")[0],
        package: selectedPackage,
        guests: guestCount,
        status: "pending" as const,
        total_price: totalPrice,
      }

      const newParty = await partyService.bookParty(partyData)

      if (newParty) {
        Alert.alert(
          "Festa Agendada!",
          `Sua festa foi agendada com sucesso!\n\nData: ${selectedDate.toLocaleDateString()}\nHorário: ${selectedTime.toLocaleTimeString()}\nTotal: R$ ${totalPrice}`,
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ],
        )

        // Clear form
        setChildName("")
        setSelectedPackage("basic")
        setGuests("10")
        setDate(new Date())
        setTime(new Date())
      } else {
        throw new Error("Erro ao agendar festa")
      }
    } catch (error: any) {
      Alert.alert("Erro", error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Agendar Festa</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome da Criança</Text>
          <TextInput
            style={styles.input}
            value={childName}
            onChangeText={setChildName}
            placeholder="Digite o nome da criança aniversariante"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pacote da Festa</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedPackage} onValueChange={setSelectedPackage} style={styles.picker}>
              {PARTY_PACKAGES.map((pkg) => (
                <Picker.Item key={pkg.id} label={`${pkg.name} - R$ ${pkg.price}`} value={pkg.id} />
              ))}
            </Picker>
          </View>
          {selectedPackageData && <Text style={styles.packageDescription}>{selectedPackageData.description}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Número de Convidados</Text>
          <TextInput
            style={styles.input}
            value={guests}
            onChangeText={setGuests}
            placeholder="Quantos convidados?"
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={styles.guestsNote}>Mínimo 5, máximo 50 convidados (R$ 15 por convidado adicional)</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data da Festa</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>{date.toLocaleDateString("pt-BR")}</Text>
            <Ionicons name="calendar-outline" size={20} color="#64748b" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === "ios")
                if (selectedDate) setDate(selectedDate)
              }}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Horário</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.dateText}>
              {time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </Text>
            <Ionicons name="time-outline" size={20} color="#64748b" />
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(Platform.OS === "ios")
                if (selectedTime) setTime(selectedTime)
              }}
            />
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo do Pedido</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pacote {selectedPackageData?.name}:</Text>
            <Text style={styles.summaryValue}>R$ {selectedPackageData?.price}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{guestCount} convidados:</Text>
            <Text style={styles.summaryValue}>R$ {guestCount * 15}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotalLabel}>Total:</Text>
            <Text style={styles.summaryTotalValue}>R$ {totalPrice}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleBookParty}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Agendando..." : "Agendar Festa"}</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Informações Importantes</Text>
            <Text style={styles.infoDescription}>
              • Confirmação em até 24 horas{"\n"}• Pagamento no dia da festa{"\n"}• Cancelamento até 48h antes{"\n"}•
              Horários disponíveis: 14h às 18h
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
  packageDescription: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    fontStyle: "italic",
  },
  guestsNote: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#1e293b",
  },
  summaryCard: {
    backgroundColor: "#f1f5f9",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  summaryValue: {
    fontSize: 14,
    color: "#1e293b",
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    marginTop: 8,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
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
