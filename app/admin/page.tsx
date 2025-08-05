"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  MessageSquare,
  QrCode,
  Phone,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [activeChildren] = useState([
    {
      id: 1,
      name: "Pedro Silva",
      age: 4,
      tags: ["🥸", "👦"],
      entryTime: "14:30",
      duration: "45 min",
      responsible: "Maria Silva",
      phone: "(11) 99999-9999",
      hasDisability: false,
    },
    {
      id: 2,
      name: "João Santos",
      age: 7,
      tags: ["👦"],
      entryTime: "15:00",
      duration: "15 min",
      responsible: "Ana Santos",
      phone: "(11) 88888-8888",
      hasDisability: false,
    },
    {
      id: 3,
      name: "Laura Costa",
      age: 6,
      tags: ["⚠️", "👦"],
      entryTime: "14:45",
      duration: "30 min",
      responsible: "Carlos Costa",
      phone: "(11) 77777-7777",
      hasDisability: true,
    },
  ])

  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(null)

  const handleEmergencyAlert = (childId: number, type: string) => {
    const child = activeChildren.find((c) => c.id === childId)
    if (child) {
      setEmergencyAlert(`Alerta de ${type} enviado para ${child.responsible}`)
      // Simular envio de notificação
      setTimeout(() => setEmergencyAlert(null), 5000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600">Air Jump Monte Carmo</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Sistema Online
            </Badge>
            <Link href="/">
              <Button variant="outline" size="sm">
                Sair
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Alert de Emergência */}
      {emergencyAlert && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mx-4 mt-4 rounded">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 font-medium">{emergencyAlert}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="active">Crianças Ativas</TabsTrigger>
            <TabsTrigger value="scanner">Scanner QR</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Métricas do Dia */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Entradas Hoje</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+12% em relação a ontem</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1h 23m</div>
                  <p className="text-xs text-muted-foreground">Permanência média</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Com Deficiência</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Atendimentos inclusivos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 1.240</div>
                  <p className="text-xs text-muted-foreground">+8% em relação a ontem</p>
                </CardContent>
              </Card>
            </div>

            {/* Ações Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Festas Agendadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Aniversário Ana - 15h</span>
                      <Badge variant="outline">Confirmado</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Festa Pedro - 17h</span>
                      <Badge variant="secondary">Pendente</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Chamados Abertos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dúvida sobre preços</span>
                      <Badge variant="outline">Novo</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sugestão de melhoria</span>
                      <Badge variant="secondary">Em análise</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Alertas Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Nenhum alerta ativo</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Crianças Brincando Agora ({activeChildren.length})</CardTitle>
                <CardDescription>Monitore o tempo de permanência e envie alertas de emergência</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeChildren.map((child) => (
                    <div key={child.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={`/abstract-geometric-shapes.png?height=40&width=40&query=${child.name}`} />
                          <AvatarFallback>
                            {child.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{child.name}</h3>
                            {child.tags.map((tag, index) => (
                              <span key={index} className="text-sm">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">
                            {child.age} anos • Entrada: {child.entryTime} • {child.duration}
                          </p>
                          <p className="text-sm text-gray-600">
                            Responsável: {child.responsible} • {child.phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEmergencyAlert(child.id, "Emergência Médica")}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Emergência
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEmergencyAlert(child.id, "Fim da Sessão")}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Fim Sessão
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scanner" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Scanner de QR Code
                </CardTitle>
                <CardDescription>Escaneie o QR Code para entrada ou saída</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  {/* Simulação de câmera */}
                  <div className="w-64 h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Posicione o QR Code aqui</p>
                    </div>
                  </div>

                  <div className="w-full max-w-md">
                    <Label htmlFor="manual-qr">Ou digite o código manualmente:</Label>
                    <div className="flex gap-2 mt-2">
                      <Input id="manual-qr" placeholder="AJ-123-1234567890" className="flex-1" />
                      <Button>Validar</Button>
                    </div>
                  </div>
                </div>

                {/* Resultado da validação */}
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">QR Code Válido</p>
                        <p className="text-sm text-green-700">Pedro Silva - 4 anos 🥸👦</p>
                        <p className="text-sm text-green-700">Responsável deve acompanhar (menor de 5 anos)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório Diário</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Entradas pagas:</span>
                    <span className="font-medium">18</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entradas gratuitas:</span>
                    <span className="font-medium">4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entradas com desconto:</span>
                    <span className="font-medium">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crianças com deficiência:</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total de atendimentos:</span>
                    <span>24</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Clientes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>MS</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Maria Silva</span>
                    </div>
                    <Badge variant="secondary">15 visitas</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>AS</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Ana Santos</span>
                    </div>
                    <Badge variant="secondary">12 visitas</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>CC</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Carlos Costa</span>
                    </div>
                    <Badge variant="secondary">8 visitas</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
