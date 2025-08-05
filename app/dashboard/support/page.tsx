"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, MessageCircle, HelpCircle, Lightbulb, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function SupportPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simular envio do chamado
    setTimeout(() => {
      alert("Chamado enviado com sucesso! Nossa equipe entrará em contato em breve.")
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
          <h1 className="text-xl font-bold text-gray-900">Fale Conosco</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Tipos de Atendimento */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-blue-200">
            <CardContent className="p-3 text-center">
              <HelpCircle className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-xs font-medium text-blue-800">Dúvida</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow border-green-200">
            <CardContent className="p-3 text-center">
              <Lightbulb className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-xs font-medium text-green-800">Sugestão</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow border-red-200">
            <CardContent className="p-3 text-center">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <p className="text-xs font-medium text-red-800">Reclamação</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Abrir Chamado
            </CardTitle>
            <CardDescription>Nossa equipe está pronta para ajudar você</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo do Chamado */}
              <div className="space-y-2">
                <Label htmlFor="ticket-type">Tipo do Chamado *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doubt">Dúvida</SelectItem>
                    <SelectItem value="suggestion">Sugestão</SelectItem>
                    <SelectItem value="complaint">Reclamação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assunto */}
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto *</Label>
                <Input id="subject" placeholder="Resumo do seu chamado" required />
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva detalhadamente sua dúvida, sugestão ou reclamação..."
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Enviando Chamado..." : "Enviar Chamado"}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Você receberá uma resposta via app e WhatsApp em até 24 horas.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Contatos Diretos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contato Direto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-800">WhatsApp</p>
                <p className="text-sm text-green-700">(11) 99999-9999</p>
              </div>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Conversar
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-800">Telefone</p>
                <p className="text-sm text-blue-700">(11) 3333-3333</p>
              </div>
              <Button size="sm" variant="outline">
                Ligar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
