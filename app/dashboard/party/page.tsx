"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, Users, Clock, Gift } from "lucide-react"
import Link from "next/link"

export default function PartyBookingPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simular agendamento
    setTimeout(() => {
      alert("Solicitação enviada! Entraremos em contato via WhatsApp para confirmação.")
      window.location.href = "/dashboard"
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Agendar Festa</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Informações */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Gift className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-purple-800 mb-1">Festa Inesquecível!</p>
                <p className="text-purple-700">
                  Comemore o aniversário do seu filho com segurança e diversão no Air Jump Monte Carmo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solicitar Agendamento</CardTitle>
            <CardDescription>Preencha os dados e nossa equipe entrará em contato</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome do Aniversariante */}
              <div className="space-y-2">
                <Label htmlFor="birthday-child">Nome do Aniversariante *</Label>
                <Input id="birthday-child" placeholder="Nome da criança" required />
              </div>

              {/* Data e Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="party-date">Data da Festa *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="party-date" type="date" className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="party-time">Horário *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="party-time" type="time" className="pl-10" required />
                  </div>
                </div>
              </div>

              {/* Número de Convidados */}
              <div className="space-y-2">
                <Label htmlFor="guests">Número de Convidados *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="guests" type="number" placeholder="Quantas crianças?" className="pl-10" min="1" required />
                </div>
              </div>

              {/* Tipo de Pacote */}
              <div className="space-y-2">
                <Label htmlFor="package">Tipo de Pacote *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o pacote" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Básico - 1h de diversão</SelectItem>
                    <SelectItem value="standard">Padrão - 1h30 + lanche</SelectItem>
                    <SelectItem value="premium">Premium - 2h + lanche + decoração</SelectItem>
                    <SelectItem value="deluxe">Deluxe - 2h30 + lanche + decoração + animação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea id="notes" placeholder="Tema da festa, alergias, pedidos especiais..." rows={3} />
              </div>

              {/* Informações dos Pacotes */}
              <Card className="bg-gray-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Nossos Pacotes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="border-l-4 border-blue-500 pl-3">
                    <p className="font-medium">Básico - R$ 299</p>
                    <p className="text-gray-600">1h de diversão para até 10 crianças</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-3">
                    <p className="font-medium">Padrão - R$ 449</p>
                    <p className="text-gray-600">1h30 + lanche simples para até 15 crianças</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-3">
                    <p className="font-medium">Premium - R$ 649</p>
                    <p className="text-gray-600">2h + lanche + decoração para até 20 crianças</p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-3">
                    <p className="font-medium">Deluxe - R$ 899</p>
                    <p className="text-gray-600">2h30 + lanche + decoração + animação para até 25 crianças</p>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Enviando Solicitação..." : "Solicitar Agendamento"}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Após o envio, nossa equipe entrará em contato via WhatsApp para confirmação e detalhes do pagamento.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
