"use client"

import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { initializeApp } from "firebase/app"
import { getAuth, onAuthStateChanged, type User } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"

// Screens
import LoginScreen from "./src/screens/LoginScreen"
import DashboardScreen from "./src/screens/DashboardScreen"
import AddChildScreen from "./src/screens/AddChildScreen"
import QRCodeScreen from "./src/screens/QRCodeScreen"
import PartyBookingScreen from "./src/screens/PartyBookingScreen"
import SupportScreen from "./src/screens/SupportScreen"
import AdminDashboardScreen from "./src/screens/AdminDashboardScreen"
import AdminScannerScreen from "./src/screens/AdminScannerScreen"

// Firebase config
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

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

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "AddChild") {
            iconName = focused ? "person-add" : "person-add-outline"
          } else if (route.name === "Party") {
            iconName = focused ? "calendar" : "calendar-outline"
          } else if (route.name === "Support") {
            iconName = focused ? "chatbubble" : "chatbubble-outline"
          } else {
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
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  if (isLoading) {
    return null // Loading screen
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
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
