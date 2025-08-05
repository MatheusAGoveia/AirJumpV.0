"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Picker } from "@react-native-picker/picker"
import { supabase } from "../lib/supabase"
import { supportService } from "../services/supabaseService"
import type { Database } from "../lib/database.types"

type SupportTicket = Database["public"]["Tables"]["support_tickets"]["Row"]

const PRIORITY_OPTIONS = [
  { value: "low", label: "Baixa", color: "#10B981" },
  { value: "medium", label: "Média", color: "#F59E0B" },
  { value: "high", label: "Alta", color: "#EF4444" },
]

export default function SupportScreen({ navigation }: any) {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const ticketsData = await supportService.getTickets(user.id)
      setTickets(ticketsData)
    } catch (error) {
      console.error("Error loading tickets:", error)
    }
  }

  const handleCreateTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos")
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuário não encontrado")

      const ticketData = {
        parent_id: user.id,
        subject: subject.trim(),
        message: message.trim(),
        priority,
        status: "open" as const,
      }

      const newTicket = await supportService.createTicket(ticketData)

      if (newTicket) {
        Alert.alert("Sucesso!", "Ticket criado com sucesso! Nossa equipe entrará em contato em breve.")
        setSubject("")
        setMessage("")
        setPriority("medium")
        setShowForm(false)
        loadTickets()
      } else {
        throw new Error("Erro ao criar ticket")
      }
    } catch (error: any) {
      Alert.alert("Erro", error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCall = () => {
    Linking.openURL("tel:+5511999999999")
  }

  const handleWhatsApp = () => {
    Linking.openURL("https://wa.me/5511999999999?text=Olá! Preciso de ajuda com o Air Jump.")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "#EF4444"
      case "in_progress":
        return "#F59E0B"
      case "resolved":
        return "#10B981"
      default:
        return "#64748b"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "Aberto"
      case "in_progress":
        return "Em Andamento"
      case "resolved":
        return "Resolvido"
      default:
        return status
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Suporte</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(!showForm)}>
          <Ionicons name={showForm ? "close" : "add"} size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Quick Contact */}
      <View style={styles.quickContact}>
        <Text style={styles.sectionTitle}>Contato Rápido</Text>
        <View style={styles.contactButtons}>
          <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
            <Ionicons name="call" size={24} color="#10B981" />
            <Text style={styles.contactText}>Ligar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            <Text style={styles.contactText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* New Ticket Form */}
      {showForm && (
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Novo Ticket</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Assunto</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="Descreva brevemente o problema"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prioridade</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={priority} onValueChange={setPriority} style={styles.picker}>
                {PRIORITY_OPTIONS.map((option) => (
                  <Picker.Item key={option.value} label={option.label} value={option.value} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mensagem</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Descreva detalhadamente o problema ou dúvida..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateTicket}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Criando..." : "Criar Ticket"}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tickets List */}
      <View style={styles.ticketsList}>
        <Text style={styles.sectionTitle}>Meus Tickets</Text>
        {tickets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Nenhum ticket encontrado</Text>
            <Text style={styles.emptySubtext}>Crie um ticket para receber suporte da nossa equipe</Text>
          </View>
        ) : (
          tickets.map((ticket) => (
            <View key={ticket.id} style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketSubject}>{ticket.subject}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(ticket.status)}</Text>
                </View>
              </View>
              <Text style={styles.ticketMessage} numberOfLines={2}>
                {ticket.message}
              </Text>
              <View style={styles.ticketFooter}>
                <View
                  style={[
                    styles.priorityBadge,
                    {
                      backgroundColor: PRIORITY_OPTIONS.find((p) => p.value === ticket.priority)?.color + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      {
                        color: PRIORITY_OPTIONS.find((p) => p.value === ticket.priority)?.color,
                      },
                    ]}
                  >
                    {PRIORITY_OPTIONS.find((p) => p.value === ticket.priority)?.label}
                  </Text>
                </View>
                <Text style={styles.ticketDate}>{new Date(ticket.created_at).toLocaleDateString("pt-BR")}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* FAQ */}
      <View style={styles.faq}>
        <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Como funciona o QR Code?</Text>
          <Text style={styles.faqAnswer}>
            Cada criança recebe um QR Code único que deve ser apresentado na entrada. O código é válido por 24 horas e
            permite entrada e saída rápida.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Posso cancelar uma festa?</Text>
          <Text style={styles.faqAnswer}>
            Sim, cancelamentos podem ser feitos até 48 horas antes da data agendada sem cobrança de taxa.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Como funciona o programa de fidelidade?</Text>
          <Text style={styles.faqAnswer}>
            A cada visita, a criança acumula pontos. Ao atingir certos níveis, recebe benefícios como descontos e
            brindes especiais.
          </Text>
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
  addButton: {
    padding: 8,
  },
  quickContact: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  contactButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  contactButton: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 8,
  },
  form: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: "#3B82F6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  ticketsList: {
    margin: 20,
  },
  emptyState: {
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "center",
  },
  ticketCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  ticketMessage: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
    lineHeight: 20,
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  ticketDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  faq: {
    margin: 20,
    marginBottom: 40,
  },
  faqItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
})
