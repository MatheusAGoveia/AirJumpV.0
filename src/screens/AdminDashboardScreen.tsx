"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, SafeAreaView, RefreshControl } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getActiveQRSessions, getDailyStats, createEmergencyAlert, signOut } from "../services/supabaseService"
import type { Database } from "../lib/database.types"

type Child = Database["public"]["Tables"]["children"]["Row"]
type QRSession = Database["public"]["Tables"]["qr_sessions"]["Row"]

interface AdminDashboardScreenProps {
  navigation: any
}

export default function AdminDashboardScreen({ navigation }: AdminDashboardScreenProps) {
  const [activeChildren, setActiveChildren] = useState<Array<{ session: QRSession; child: Child }>>([])
  const [stats, setStats] = useState({ totalEntries: 0, activeEntries: 0, completedEntries: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      const [activeSessions, dailyStats] = await Promise.all([getActiveQRSessions(), getDailyStats()])
      setActiveChildren(activeSessions)
      setStats(dailyStats)
    } catch (error) {
      console.error("Error loading admin data:", error)
      Alert.alert("Erro", "Não foi possível carregar os dados")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const handleEmergencyAlert = (childId: string, childName: string, type: string) => {
    Alert.alert(`Alerta de ${type}`, `Enviar alerta para os responsáveis de ${childName}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Enviar",
        onPress: async () => {
          try {
            await createEmergencyAlert(childId, type, `Alerta de ${type} para ${childName}`, "admin")
            Alert.alert("Sucesso", `Alerta de ${type} enviado para os responsáveis`)
          } catch (error) {
            console.error("Error sending alert:", error)
            Alert.alert("Erro", "Não foi possível enviar o alerta")
          }
        },
      },
    ])
  }

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja sair do painel administrativo?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: () => signOut() },
    ])
  }

  const renderActiveChild = (item: { session: QRSession; child: Child }) => {
    const { session, child } = item
    const entryTime = session.entry_time ? new Date(session.entry_time) : null
    const duration = entryTime ? Math.floor((Date.now() - entryTime.getTime()) / (1000 * 60)) : 0

    return (
      <View key={session.id} style={styles.childCard}>
        <View style={styles.childInfo}>
          <View style={styles.childAvatar}>
            <Text style={styles.childInitials}>
              {child.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)}
            </Text>
          </View>

          <View style={styles.childDetails}>
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
            <Text style={styles.childAge}>
              {new Date().getFullYear() - new Date(child.birth_date).getFullYear()} anos
            </Text>
            <Text style={styles.sessionInfo}>
              Entrada: {entryTime?.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} • {duration} min
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#EF4444" }]}
            onPress={() => handleEmergencyAlert(child.id, child.name, "Emergência Médica")}
            activeOpacity={0.8}
          >
            <Ionicons name="medical" size={16} color="white" />
            <Text style={styles.actionButtonText}>Emergência</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#F59E0B" }]}
            onPress={() => handleEmergencyAlert(child.id, child.name, "Fim da Sessão")}
            activeOpacity={0.8}
          >
            <Ionicons name="time" size={16} color="white" />
            <Text style={styles.actionButtonText}>Fim Sessão</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Painel Administrativo</Text>
          <Text style={styles.headerSubtitle}>Air Jump Monte Carmo</Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Sistema Online</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Entradas Hoje</Text>
              <Ionicons name="people" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{stats.totalEntries}</Text>
            <Text style={styles.statSubtext}>Total de entradas</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Brincando Agora</Text>
              <Ionicons name="play-circle" size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{stats.activeEntries}</Text>
            <Text style={styles.statSubtext}>Crianças ativas</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Finalizadas</Text>
              <Ionicons name="checkmark-circle" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.statValue}>{stats.completedEntries}</Text>
            <Text style={styles.statSubtext}>Sessões completas</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate("AdminScanner")}
              activeOpacity={0.8}
            >
              <Ionicons name="qr-code-outline" size={32} color="#3B82F6" />
              <Text style={styles.quickActionTitle}>Scanner QR</Text>
              <Text style={styles.quickActionSubtitle}>Validar entrada/saída</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction} activeOpacity={0.8}>
              <Ionicons name="calendar-outline" size={32} color="#8B5CF6" />
              <Text style={styles.quickActionTitle}>Festas</Text>
              <Text style={styles.quickActionSubtitle}>Agendamentos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction} activeOpacity={0.8}>
              <Ionicons name="chatbubble-outline" size={32} color="#10B981" />
              <Text style={styles.quickActionTitle}>Suporte</Text>
              <Text style={styles.quickActionSubtitle}>Chamados abertos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Children */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crianças Brincando Agora ({activeChildren.length})</Text>
          {activeChildren.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>Nenhuma criança brincando no momento</Text>
              <Text style={styles.emptyStateSubtext}>As crianças ativas aparecerão aqui</Text>
            </View>
          ) : (
            activeChildren.map(renderActiveChild)
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "#065F46",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    margin: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 10,
    color: "#9ca3af",
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: "row",
    gap: 8,
  },
  quickAction: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 8,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "white",
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 4,
  },
  childCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  childInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  childInitials: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  childDetails: {
    flex: 1,
  },
  childNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  childName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginRight: 8,
  },
  tagsContainer: {
    flexDirection: "row",
  },
  tag: {
    fontSize: 14,
    marginRight: 4,
  },
  childAge: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  sessionInfo: {
    fontSize: 12,
    color: "#6b7280",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
})
