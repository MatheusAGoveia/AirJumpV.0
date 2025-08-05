"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Plus, QrCode, Calendar, MessageCircle, Star, AlertTriangle, Gift, Bell } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const [children] = useState([
    {
      id: 1,
      name: "Ana Clara Silva",
      age: 8,
      photo: "/young-woman-smiling.png",
      tags: ["👦"],
      hasDisability: false,
      isActive: false,
    },
    {
      id: 2,
      name: "Pedro Silva",
      age: 4,
      photo: "/young-boy-drawing.png",
      tags: ["🥸", "👦"],
      hasDisability: false,
      isActive: true,
    },
    {
      id: 3,
      name: "Maria Silva",
      age: 10,
      photo: "/young-woman-smiling.png",
      tags: ["⚠️", "👦"],
      hasDisability: true,
      isActive: false,
    },
  ])

  const [loyaltySeals] = useState(7)
  const [notifications] = useState([
    {
      id: 1,
      type: "info",
      message: "Pedro está brincando há 45 minutos",
      time: "há 5 min",
    },
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Olá, Maria! 👋</h1>
            <p className="text-sm text-gray-600">Air Jump Monte Carmo</p>
          </div>
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-600" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Fidelidade */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Programa Fidelidade
              </CardTitle>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {loyaltySeals}/10 selos
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={loyaltySeals * 10} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Próxima entrada gratuita</span>
                <span className="font-medium">{10 - loyaltySeals} selos restantes</span>
              </div>
              {loyaltySeals >= 9 && (
                <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                  <Gift className="h-4 w-4" />
                  Quase lá! Mais 1 selo para entrada gratuita! 🏰
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        {notifications.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-800">Notificações</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-blue-800">{notification.message}</p>
                    <p className="text-xs text-blue-600 mt-1">{notification.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Crianças Cadastradas */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Minhas Crianças</CardTitle>
              <Link href="/dashboard/add-child">
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {children.map((child) => (
              <div key={child.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={child.photo || "/placeholder.svg"} />
                  <AvatarFallback>
                    {child.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{child.name}</h3>
                    {child.tags.map((tag, index) => (
                      <span key={index} className="text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{child.age} anos</p>
                  {child.isActive && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs mt-1">
                      Brincando agora
                    </Badge>
                  )}
                </div>

                <Link href={`/dashboard/qr/${child.id}`}>
                  <Button size="sm" variant={child.isActive ? "destructive" : "default"}>
                    <QrCode className="h-4 w-4 mr-1" />
                    {child.isActive ? "Retirar" : "QR Code"}
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/party">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-medium text-gray-900">Agendar Festa</h3>
                <p className="text-xs text-gray-600 mt-1">Comemore conosco</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/support">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-medium text-gray-900">Fale Conosco</h3>
                <p className="text-xs text-gray-600 mt-1">Dúvidas e sugestões</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Informações Importantes */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">Lembrete Importante</p>
                <ul className="text-amber-700 space-y-1 text-xs">
                  <li>• Crianças com deficiência: responsável deve permanecer na loja</li>
                  <li>• Menores de 5 anos precisam de acompanhante maior de 18 anos</li>
                  <li>• Menores de 18 anos desacompanhados precisam de autorização</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
