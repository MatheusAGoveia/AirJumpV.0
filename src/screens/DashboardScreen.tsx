"use client"

import { useState, useCallback } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import { signOut } from "../services/supabaseService"
import { getChildren, getLoyaltyProgram } from "../services/supabaseService"
import { calculateAge } from "../utils/qrUtils"
import { supabase } from "../lib/supabase"
import type { Database } from "../lib/database.types"

type Child = Database["public"]["Tables"]["children"]["Row"]
type LoyaltyProgram = Database["public"]["Tables"]["loyalty_programs"]["Row"]

interface DashboardScreenProps {
  navigation: any
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [children, setChildren] = useState<Child[]>([])
  const [loyalty, setLoyalty] = useState<LoyaltyProgram | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [user, setUser] = useState<any>(null)

  const loadData = async () => {
    try {
      const [childrenData, loyaltyData] = await Promise.all([getChildren(), getLoyaltyProgram()])
      setChildren(childrenData)
      setLoyalty(loyaltyData)
    } catch (error) {
      console.error("Error loading data:", error)
      Alert.alert("Erro", "Não foi possível carregar os dados")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }

  useFocusEffect(
    useCallback(() => {
      loadData()
      loadUser()
    }, []),
  )

  const onRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: () => signOut() },
    ])
  }

  const renderChild = (child: Child) => {
    const age = calculateAge(new Date(child.birth_date))

    return (
      <View key={child.id} style={styles.childCard}>
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
            <Text style={styles.childAge}>{age} anos</Text>
            {child.medical_notes && <Text style={styles.medicalNotes}>⚕️ {child.medical_notes}</Text>}
          </View>
        </View>

        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => navigation.navigate("QRCode", { childId: child.id })}
          activeOpacity={0.8}
        >
          <Ionicons name="qr-code" size={20} color="white" />
          <Text style={styles.qrButtonText}>QR Code</Text>
        </TouchableOpacity>
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
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.user_metadata?.full_name || "Usuário"}! 👋</Text>
            <Text style={styles.subtitle}>Air Jump Monte Carmo</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Loyalty Program */}
        {loyalty && (
          <View style={styles.loyaltyCard}>
            <View style={styles.loyaltyHeader}>
              <View style={styles.loyaltyTitle}>
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text style={styles.loyaltyText}>Programa Fidelidade</Text>
              </View>
              <View style={styles.loyaltyBadge}>
                <Text style={styles.loyaltyBadgeText}>{loyalty.seals}/10 selos</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(loyalty.seals / 10) * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>{10 - loyalty.seals} selos para entrada gratuita</Text>
            </View>

            {loyalty.seals >= 9 && (
              <View style={styles.almostThereAlert}>
                <Ionicons name="gift" size={16} color="#F59E0B" />
                <Text style={styles.almostThereText}>
                  Quase lá! Mais {10 - loyalty.seals} selo para entrada gratuita! 🏰
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Children List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Minhas Crianças</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate("AddChild")}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={16} color="#3B82F6" />
              <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          {children.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>Nenhuma criança cadastrada</Text>
              <Text style={styles.emptyStateSubtext}>Adicione uma criança para começar a usar o Air Jump</Text>
            </View>
          ) : (
            children.map(renderChild)
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate("Party")}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar" size={32} color="#8B5CF6" />
              <Text style={styles.quickActionTitle}>Agendar Festa</Text>
              <Text style={styles.quickActionSubtitle}>Comemore conosco</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate("Support")}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble" size={32} color="#3B82F6" />
              <Text style={styles.quickActionTitle}>Fale Conosco</Text>
              <Text style={styles.quickActionSubtitle}>Dúvidas e sugestões</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Safety Information */}
        <View style={styles.safetyCard}>
          <View style={styles.safetyHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#F59E0B" />
            <Text style={styles.safetyTitle}>Lembrete Importante</Text>
          </View>
          <View style={styles.safetyList}>
            <Text style={styles.safetyItem}>• Crianças com deficiência: responsável deve permanecer na loja</Text>
            <Text style={styles.safetyItem}>• Menores de 5 anos precisam de acompanhante maior de 18 anos</Text>
            <Text style={styles.safetyItem}>• Menores de 18 anos desacompanhados precisam de autorização</Text>
          </View>
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
  scrollView: {
    flex: 1,
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
  greeting: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  loyaltyCard: {
    backgroundColor: "white",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loyaltyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  loyaltyTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  loyaltyText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    color: "#1f2937",
  },
  loyaltyBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loyaltyBadgeText: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "600",
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#F59E0B",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  almostThereAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    padding: 8,
    borderRadius: 8,
  },
  almostThereText: {
    fontSize: 12,
    color: "#92400E",
    marginLeft: 8,
    flex: 1,
  },
  section: {
    margin: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 6,
  },
  addButtonText: {
    color: "#3B82F6",
    fontSize: 14,
    marginLeft: 4,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  childInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
  },
  medicalNotes: {
    fontSize: 12,
    color: "#F59E0B",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  qrButton: {
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  qrButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAction: {
    backgroundColor: "white",
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
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
  },
  safetyCard: {
    backgroundColor: "#FEF3C7",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  safetyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
    marginLeft: 8,
  },
  safetyList: {
    marginLeft: 28,
  },
  safetyItem: {
    fontSize: 12,
    color: "#92400E",
    marginBottom: 4,
  },
})
