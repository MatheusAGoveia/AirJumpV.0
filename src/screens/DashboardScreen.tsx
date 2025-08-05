"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "../lib/supabase"
import { childrenService, profileService } from "../services/supabaseService"
import type { Database } from "../lib/database.types"

type Child = Database["public"]["Tables"]["children"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export default function DashboardScreen({ navigation }: any) {
  const [children, setChildren] = useState<Child[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const [profileData, childrenData] = await Promise.all([
        profileService.getProfile(user.id),
        childrenService.getChildren(user.id),
      ])

      setProfile(profileData)
      setChildren(childrenData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut()
        },
      },
    ])
  }

  const getLoyaltyLevel = (totalVisits: number) => {
    if (totalVisits >= 50) return { level: "Diamante", color: "#8B5CF6", icon: "diamond" }
    if (totalVisits >= 30) return { level: "Ouro", color: "#F59E0B", icon: "trophy" }
    if (totalVisits >= 15) return { level: "Prata", color: "#6B7280", icon: "medal" }
    return { level: "Bronze", color: "#CD7F32", icon: "ribbon" }
  }

  const totalVisits = children.reduce((sum, child) => sum + child.visits, 0)
  const loyalty = getLoyaltyLevel(totalVisits)

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {profile?.full_name || "Usuário"}!</Text>
          <Text style={styles.subGreeting}>Bem-vindo ao Air Jump</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Loyalty Program */}
      <View style={styles.loyaltyCard}>
        <View style={styles.loyaltyHeader}>
          <Ionicons name={loyalty.icon as any} size={24} color={loyalty.color} />
          <Text style={styles.loyaltyTitle}>Programa de Fidelidade</Text>
        </View>
        <Text style={[styles.loyaltyLevel, { color: loyalty.color }]}>Nível {loyalty.level}</Text>
        <Text style={styles.loyaltyVisits}>{totalVisits} visitas totais</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(((totalVisits % 15) / 15) * 100, 100)}%`,
                backgroundColor: loyalty.color,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{15 - (totalVisits % 15)} visitas para o próximo nível</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("AddChild")}>
            <Ionicons name="person-add" size={32} color="#3B82F6" />
            <Text style={styles.actionText}>Adicionar Criança</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("Party")}>
            <Ionicons name="calendar" size={32} color="#10B981" />
            <Text style={styles.actionText}>Agendar Festa</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("Support")}>
            <Ionicons name="chatbubble" size={32} color="#F59E0B" />
            <Text style={styles.actionText}>Suporte</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("Admin")}>
            <Ionicons name="settings" size={32} color="#8B5CF6" />
            <Text style={styles.actionText}>Admin</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Children List */}
      <View style={styles.childrenSection}>
        <Text style={styles.sectionTitle}>Minhas Crianças</Text>
        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Nenhuma criança cadastrada</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddChild")}>
              <Text style={styles.addButtonText}>Adicionar Primeira Criança</Text>
            </TouchableOpacity>
          </View>
        ) : (
          children.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={styles.childCard}
              onPress={() => navigation.navigate("QRCode", { childId: child.id })}
            >
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childAge}>{child.age} anos</Text>
                <Text style={styles.childVisits}>{child.visits} visitas</Text>
              </View>
              <View style={styles.childActions}>
                <Ionicons name="qr-code" size={24} color="#3B82F6" />
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))
        )}
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },
  subGreeting: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 4,
  },
  signOutButton: {
    padding: 8,
  },
  loyaltyCard: {
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
  loyaltyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  loyaltyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    color: "#1e293b",
  },
  loyaltyLevel: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  loyaltyVisits: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#64748b",
  },
  quickActions: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 8,
    textAlign: "center",
  },
  childrenSection: {
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
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  childCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  childAge: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  childVisits: {
    fontSize: 12,
    color: "#3B82F6",
    marginTop: 4,
  },
  childActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
})
