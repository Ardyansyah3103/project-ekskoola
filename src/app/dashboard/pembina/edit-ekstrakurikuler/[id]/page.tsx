"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, BookOpen, Lightbulb } from "lucide-react"
import Link from "next/link"

interface Schedule {
  id: string
  day: string
  startTime: string
  endTime: string
}

interface ExtracurricularData {
  id: string
  name: string
  description: string
  maxMembers: string
  registrationStart: string
  registrationEnd: string
  pembinaId?: string
  schedule: Schedule
}

export default function EditExtracurricularPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState<ExtracurricularData>({
    id: "",
    name: "",
    description: "",
    maxMembers: "",
    registrationStart: "",
    registrationEnd: "",
    schedule: { id: "1", day: "", startTime: "", endTime: "" },
  })

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      const ekstrakurikulerId = params.id as string
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/editEkstra/${ekstrakurikulerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setFormData({
          ...data,
          maxMembers: data.maxMembers.toString(),
          schedule: {
            id: data.schedule.id.toString(),
            day: data.schedule.day,
            startTime: data.schedule.startTime,
            endTime: data.schedule.endTime,
          },
        })
      }

      setIsLoading(false)
    }

    fetchData()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const token = localStorage.getItem("token")

      const payload = {
        name: formData.name,
        description: formData.description,
        maxMembers: parseInt(formData.maxMembers),
        registrationStart: formData.registrationStart,
        registrationEnd: formData.registrationEnd,
        pembinaId: formData.pembinaId ? parseInt(formData.pembinaId) : null,
        schedules: [
          {
            day: formData.schedule.day,
            startTime: formData.schedule.startTime,
            endTime: formData.schedule.endTime,
          },
        ],
      }

      console.log("=== Payload ===", payload)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/editEkstra/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const resJson = await response.json()
      console.log("=== RESPONSE ===", resJson)

      if (!response.ok) throw new Error(resJson.message || "Gagal menyimpan perubahan")

      alert("Ekstrakurikuler berhasil diperbarui!")
      router.push("/dashboard/pembina")
    } catch (error) {
      console.error(error)
      alert("Gagal memperbarui ekstrakurikuler. Silakan coba lagi.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/pembina">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            </Link>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-700 to-blue-900 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Edit Ekstrakurikuler</h1>
              <p className="text-sm text-gray-600">
                Dashboard Pembina / Edit Ekstrakurikuler / {formData.name}
              </p>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900"
          >
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Informasi Dasar */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Informasi Dasar</CardTitle>
                <CardDescription>Edit informasi dasar ekstrakurikuler</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama Ekstrakurikuler *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="maxMembers">Maksimal Anggota</Label>
                  <Input
                    id="maxMembers"
                    type="number"
                    value={formData.maxMembers}
                    onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                    min="1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Jadwal */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Jadwal Kegiatan</CardTitle>
                <CardDescription>Atur jadwal kegiatan ekstrakurikuler</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Hari</Label>
                      <Select
                        value={formData.schedule.day}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, day: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={formData.schedule.day || "Pilih hari"} />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map((day) => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Waktu Mulai</Label>
                      <Input
                        type="time"
                        value={formData.schedule.startTime}
                        onChange={(e) => setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, startTime: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Waktu Selesai</Label>
                      <Input
                        type="time"
                        value={formData.schedule.endTime}
                        onChange={(e) => setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, endTime: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Periode Pendaftaran */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Periode Pendaftaran</CardTitle>
                <CardDescription>Atur periode pendaftaran anggota baru</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="registrationStart">Tanggal Mulai</Label>
                    <Input
                      id="registrationStart"
                      type="date"
                      value={formData.registrationStart}
                      onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="registrationEnd">Tanggal Berakhir</Label>
                    <Input
                      id="registrationEnd"
                      type="date"
                      value={formData.registrationEnd}
                      onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <span>Tips Edit</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800">Perhatikan Anggota Aktif</p>
                  <p className="text-blue-600">Pastikan perubahan tidak mengganggu anggota yang sudah terdaftar</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-800">Jadwal Bentrok</p>
                  <p className="text-green-600">Cek kembali jadwal untuk menghindari bentrok dengan kegiatan lain</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="font-medium text-purple-800">Notifikasi Otomatis</p>
                  <p className="text-purple-600">Anggota akan mendapat notifikasi jika ada perubahan penting</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  )
}
