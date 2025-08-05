"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { adminService } from "../services/supabaseService"

export default function AdminDashboardScreen({ navigation }: any) {
  const [stats, setStats] = useState({
    totalChildren: 0,
    activeVisits: 0,
    todayVisits: 0,
    pendingParties: 0,
    openTickets: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [children, visits, parties, tickets] = await Promise.all([
        adminService.getAllChildren(),
        adminService.getAllVisits(),
        adminService.getAllParties(),
        adminService.getAllTickets(),
      ])

      const today = new Date().toISOString().split("T")[0]
      const todayVisits = visits.filter((v) => v.entry_time.startsWith(today))
      const activeVisits = visits.filter((v) => !v.exit_time)
      const pendingParties = parties.filter((p) => p.status === "pending")
      const openTickets = tickets.filter((t) => t.status === "open")

      setStats({
        totalChildren: children.length,
        activeVisits: activeVisits.length,
        todayVisits: todayVisits.length,
        pendingParties: pendingParties.length,
        openTickets: openTickets.length,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
      Alert.alert("Erro", "Não foi possível carregar as estatísticas")
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon, color, onPress }: any) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStats} />}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Painel Administrativo</Text>
        <TouchableOpacity style={styles.scannerButton} onPress={() => navigation.navigate("AdminScanner")}>
          <Ionicons name="qr-code-outline" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Crianças Cadastradas"
          value={stats.totalChildren}
          icon="people"
          color="#3B82F6"
          onPress={() => {}}
        />
        <StatCard title="Visitas Ativas" value={stats.activeVisits} icon="enter" color="#10B981" onPress={() => {}} />
        <StatCard title="Visitas Hoje" value={stats.todayVisits} icon="calendar" color="#F59E0B" onPress={() => {}} />
        <StatCard
          title="Festas Pendentes"
          value={stats.pendingParties}
          icon="gift"
          color="#8B5CF6"
          onPress={() => {}}
        />
        <StatCard
          title="Tickets Abertos"
          value={stats.openTickets}
          icon="chatbubble"
          color="#EF4444"
          onPress={() => {}}
        />
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("AdminScanner")}>
          <Ionicons name="qr-code" size={24} color="#3B82F6" />
          <Text style={styles.actionText}>Scanner QR Code</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="people" size={24} color="#10B981" />
          <Text style={styles.actionText}>Gerenciar Crianças</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="calendar" size={24} color="#F59E0B" />
          <Text style={styles.actionText}>Gerenciar Festas</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble" size={24} color="#8B5CF6" />
          <Text style={styles.actionText}>Tickets de Suporte</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="stats-chart" size={24} color="#EF4444" />
          <Text style={styles.actionText}>Relatórios</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.emergencySection}>
        <Text style={styles.sectionTitle}>Sistema de Emergência</Text>
        <TouchableOpacity style={styles.emergencyButton}>
          <Ionicons name="warning" size={24} color="#fff" />
          <Text style={styles.emergencyText}>Ativar Alerta de Emergência</Text>
        </TouchableOpacity>
        <Text style={styles.emergencyNote}>
          Use apenas em situações de emergência real. Todos os responsáveis serão notificados imediatamente.
        </Text>
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
  scannerButton: {
    padding: 8,
  },
  statsGrid: {
    padding: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },
  statTitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  quickActions: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginLeft: 12,
  },
  emergencySection: {
    margin: 20,
    marginBottom: 40,
  },
  emergencyButton: {
    backgroundColor: "#EF4444",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emergencyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  emergencyNote: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 16,
  },
})
