"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { ArrowLeft, BookOpen } from "lucide-react"
import Link from "next/link"

interface Schedule {
  id: string
  day: string
  startTime: string
  endTime: string
}

export default function CreateExtracurricularPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxMembers: "",
    registrationStart: "",
    registrationEnd: ""
  })

  const [schedules, setSchedules] = useState<Schedule[]>([
    { id: "1", day: "", startTime: "", endTime: "" }
  ])

  const days = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu"
  ]

  const updateSchedule = (
    id: string,
    field: keyof Schedule,
    value: string
  ) => {
    setSchedules(
      schedules.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const userString = localStorage.getItem("user")
      if (!userString) throw new Error("User belum login")
      const user = JSON.parse(userString)
      const pembinaId = user.id

      const payload = {
        name: formData.name,
        description: formData.description,
        maxMembers: parseInt(formData.maxMembers),
        registrationStart: formData.registrationStart,
        registrationEnd: formData.registrationEnd,
        schedules: schedules.map((sch) => ({
          day: sch.day,
          startTime: sch.startTime,
          endTime: sch.endTime
        })),
        pembinaId: pembinaId
      }

      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ekstra`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || "Gagal membuat ekstrakurikuler")
      }

      const result = await response.json()
      alert("Berhasil membuat ekstrakurikuler!")
      console.log(result)
      router.push("/dashboard/pembina")
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
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
              <h1 className="text-xl font-bold">
                Buat Ekstrakurikuler
              </h1>
              <p className="text-sm text-gray-600">
                Dashboard Pembina / Buat Ekstrakurikuler
              </p>
            </div>
          </div>
          <Button
            type="submit"
            form="ekstraForm"
            className="bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900"
          >
            Simpan Ekstrakurikuler
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <form
          id="ekstraForm"
          onSubmit={handleSubmit}
          className="grid lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-6">
            {/* Informasi Dasar */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Informasi Dasar</CardTitle>
                <CardDescription>
                  Masukkan informasi dasar ekstrakurikuler
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama Ekstrakurikuler *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value
                      })
                    }
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="maxMembers">Maksimal Anggota</Label>
                  <Input
                    id="maxMembers"
                    type="number"
                    value={formData.maxMembers}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxMembers: e.target.value
                      })
                    }
                    min="1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Jadwal */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Jadwal Kegiatan</CardTitle>
                <CardDescription>
                  Atur jadwal kegiatan ekstrakurikuler
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Hari</Label>
                        <Select
                          value={schedule.day}
                          onValueChange={(value) =>
                            updateSchedule(
                              schedule.id,
                              "day",
                              value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih hari" />
                          </SelectTrigger>
                          <SelectContent>
                            {days.map((day) => (
                              <SelectItem
                                key={day}
                                value={day}
                              >
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Waktu Mulai</Label>
                        <Input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) =>
                            updateSchedule(
                              schedule.id,
                              "startTime",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label>Waktu Selesai</Label>
                        <Input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) =>
                            updateSchedule(
                              schedule.id,
                              "endTime",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Periode Pendaftaran */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Periode Pendaftaran</CardTitle>
                <CardDescription>
                  Atur periode pendaftaran anggota baru
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="registrationStart">
                      Tanggal Mulai
                    </Label>
                    <Input
                      id="registrationStart"
                      type="date"
                      value={formData.registrationStart}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          registrationStart: e.target.value
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="registrationEnd">
                      Tanggal Berakhir
                    </Label>
                    <Input
                      id="registrationEnd"
                      type="date"
                      value={formData.registrationEnd}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          registrationEnd: e.target.value
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  )
}
