"use client"

import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import type { Session } from "@supabase/supabase-js"

// Supabase
import { supabase } from "./src/lib/supabase"

// Screens
import LoginScreen from "./src/screens/LoginScreen"
import DashboardScreen from "./src/screens/DashboardScreen"
import AddChildScreen from "./src/screens/AddChildScreen"
import QRCodeScreen from "./src/screens/QRCodeScreen"
import PartyBookingScreen from "./src/screens/PartyBookingScreen"
import SupportScreen from "./src/screens/SupportScreen"
import AdminDashboardScreen from "./src/screens/AdminDashboardScreen"
import AdminScannerScreen from "./src/screens/AdminScannerScreen"
import LoadingScreen from "./src/screens/LoadingScreen"

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()
const AdminStack = createStackNavigator()

function AdminStackNavigator() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <AdminStack.Screen name="AdminScanner" component={AdminScannerScreen} />
    </AdminStack.Navigator>
  )
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "home" : "home-outline"
              break
            case "AddChild":
              iconName = focused ? "person-add" : "person-add-outline"
              break
            case "Party":
              iconName = focused ? "calendar" : "calendar-outline"
              break
            case "Support":
              iconName = focused ? "chatbubble" : "chatbubble-outline"
              break
            default:
              iconName = "home-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Início" }} />
      <Tab.Screen name="AddChild" component={AddChildScreen} options={{ title: "Adicionar" }} />
      <Tab.Screen name="Party" component={PartyBookingScreen} options={{ title: "Festas" }} />
      <Tab.Screen name="Support" component={SupportScreen} options={{ title: "Suporte" }} />
    </Tab.Navigator>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="QRCode" component={QRCodeScreen} />
            <Stack.Screen name="Admin" component={AdminStackNavigator} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
