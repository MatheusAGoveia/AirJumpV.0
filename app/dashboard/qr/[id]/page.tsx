"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, RefreshCw, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function QRCodePage({ params }: { params: { id: string } }) {
  const [child] = useState({
    id: Number.parseInt(params.id),
    name: "Pedro Silva",
    age: 4,
    photo: "/young-boy-drawing.png",
    tags: ["🥸", "👦"],
    hasDisability: false,
    isActive: false,
    medicalNotes: "Alergia a amendoim",
  })

  const [qrCode, setQrCode] = useState("")
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    // Gerar QR Code dinâmico
    const generateQR = () => {
      const timestamp = Date.now()
      const qrData = `AJ-${child.id}-${timestamp}`
      setQrCode(qrData)
      setExpiresAt(new Date(Date.now() + 2 * 60 * 60 * 1000)) // 2 horas
    }

    generateQR()
    const interval = setInterval(generateQR, 30000) // Renovar a cada 30s

    return () => clearInterval(interval)
  }, [child.id])

  useEffect(() => {
    if (!expiresAt) return

    const updateTimer = () => {
      const now = new Date()
      const diff = expiresAt.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft("Expirado")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)

    return () => clearInterval(timer)
  }, [expiresAt])

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
          <h1 className="text-xl font-bold text-gray-900">QR Code de Entrada</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Informações da Criança */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={child.photo || "/placeholder.svg"} />
                <AvatarFallback>
                  {child.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-gray-900">{child.name}</h2>
                  {child.tags.map((tag, index) => (
                    <span key={index} className="text-lg">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600">{child.age} anos</p>
                {child.medicalNotes && (
                  <p className="text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded mt-2">⚕️ {child.medicalNotes}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>QR Code Dinâmico</CardTitle>
            <CardDescription>Apresente este código na entrada</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {/* QR Code simulado */}
            <div className="mx-auto w-48 h-48 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
              <div
                className="w-40 h-40 bg-black"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='white'/%3E%3Cg fill='black'%3E%3Crect x='0' y='0' width='10' height='10'/%3E%3Crect x='20' y='0' width='10' height='10'/%3E%3Crect x='40' y='0' width='10' height='10'/%3E%3Crect x='60' y='0' width='10' height='10'/%3E%3Crect x='80' y='0' width='10' height='10'/%3E%3Crect x='0' y='20' width='10' height='10'/%3E%3Crect x='40' y='20' width='10' height='10'/%3E%3Crect x='80' y='20' width='10' height='10'/%3E%3Crect x='20' y='40' width='10' height='10'/%3E%3Crect x='60' y='40' width='10' height='10'/%3E%3Crect x='0' y='60' width='10' height='10'/%3E%3Crect x='40' y='60' width='10' height='10'/%3E%3Crect x='80' y='60' width='10' height='10'/%3E%3Crect x='20' y='80' width='10' height='10'/%3E%3Crect x='60' y='80' width='10' height='10'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: "cover",
                }}
              ></div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">{qrCode}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Expira em: {timeLeft}</span>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Renovar QR Code
            </Button>
          </CardContent>
        </Card>

        {/* Alertas de Segurança */}
        {child.tags.includes("🥸") && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 mb-1">Atenção - Menor de 5 anos</p>
                  <p className="text-amber-700">
                    Esta criança deve estar acompanhada por um responsável maior de 18 anos durante toda a permanência.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {child.hasDisability && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800 mb-1">Criança com Deficiência</p>
                  <p className="text-red-700">
                    O responsável deve permanecer na loja durante toda a sessão. Entrada gratuita conforme legislação
                    estadual.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Como usar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                1
              </span>
              <p>Apresente este QR Code na recepção</p>
            </div>
            <div className="flex gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                2
              </span>
              <p>Nossa equipe validará as informações de segurança</p>
            </div>
            <div className="flex gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                3
              </span>
              <p>O tempo de sessão será iniciado automaticamente</p>
            </div>
            <div className="flex gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                4
              </span>
              <p>Use o mesmo QR Code para a retirada segura</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
