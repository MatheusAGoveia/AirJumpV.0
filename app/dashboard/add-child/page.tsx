"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Upload, Calendar } from "lucide-react"
import Link from "next/link"

export default function AddChildPage() {
  const [hasDisability, setHasDisability] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simular cadastro
    setTimeout(() => {
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
          <h1 className="text-xl font-bold text-gray-900">Cadastrar Criança</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Criança</CardTitle>
            <CardDescription>Preencha os dados para garantir a segurança e diversão</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input id="name" placeholder="Nome completo da criança" required />
              </div>

              {/* Data de Nascimento */}
              <div className="space-y-2">
                <Label htmlFor="birthdate">Data de Nascimento *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="birthdate" type="date" className="pl-10" required />
                </div>
              </div>

              {/* Foto */}
              <div className="space-y-2">
                <Label htmlFor="photo">Foto da Criança</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Clique para fazer upload ou arraste a foto aqui</p>
                  <Input id="photo" type="file" accept="image/*" className="hidden" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("photo")?.click()}
                  >
                    Selecionar Foto
                  </Button>
                </div>
              </div>

              {/* Observações Médicas */}
              <div className="space-y-2">
                <Label htmlFor="medical-notes">Observações Médicas</Label>
                <Textarea id="medical-notes" placeholder="Alergias, medicamentos, condições especiais..." rows={3} />
                <p className="text-xs text-gray-500">Informações importantes para a segurança da criança</p>
              </div>

              {/* Criança com Deficiência */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="disability"
                    checked={hasDisability}
                    onCheckedChange={(checked) => setHasDisability(checked as boolean)}
                  />
                  <Label htmlFor="disability" className="text-sm font-medium">
                    Criança com deficiência
                  </Label>
                </div>

                {hasDisability && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">⚠️ Benefícios da Legislação Estadual:</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 1ª e 2ª criança com deficiência: entrada gratuita</li>
                      <li>• 3ª criança em diante: 50% de desconto</li>
                      <li>• Responsável deve permanecer na loja</li>
                    </ul>

                    <div className="space-y-2">
                      <Label htmlFor="disability-doc">Documento Comprobatório</Label>
                      <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center">
                        <Upload className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                        <p className="text-xs text-blue-600 mb-2">Upload do laudo médico ou documento oficial</p>
                        <Input id="disability-doc" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("disability-doc")?.click()}
                        >
                          Selecionar Documento
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Informações Automáticas */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Tags Automáticas:</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>⚠️ Deficiência (se aplicável)</p>
                  <p>🥸 Menor de 5 anos (calculado automaticamente)</p>
                  <p>👦 Cliente menor de idade (calculado automaticamente)</p>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Cadastrando..." : "Cadastrar Criança"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
