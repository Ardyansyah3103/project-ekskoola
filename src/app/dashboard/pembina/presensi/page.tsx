"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Save, CheckCircle, XCircle, AlertCircle, BookOpen, ArrowLeft } from "lucide-react";

interface Extracurricular {
  id: string;
  name: string;
}

interface Member {
  id: number;
  name: string;
  nis: string;
  avatar?: string;
  attendance: "hadir" | "tidak_hadir" | "izin" | "sakit" | null;
  note?: string;
}

export default function PresensiPage() {
  const [extracurriculars, setExtracurriculars] = useState<Extracurricular[]>([]);
  const [selectedExtracurricular, setSelectedExtracurricular] = useState<string>("");
  const [members, setMembers] = useState<Member[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const now = new Date();
  const sessionDate = now.toISOString().split("T")[0];
  const sessionTime = now.toTimeString().split(" ")[0]; 
 
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/ekstra`)
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((e: any) => ({
          id: e.id.toString(),
          name: e.name,
        }));
        setExtracurriculars(mapped);
        if (mapped.length > 0) setSelectedExtracurricular(mapped[0].id);
      });
  }, []);

  useEffect(() => {
    if (!selectedExtracurricular) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/anggota/ekskul/${selectedExtracurricular}`)
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((item: any) => ({
          id: item.id,
          nis: item.users.nomorInduk,
          name: item.users.name,
          attendance: null,
          note: "",
          avatar: "/placeholder.svg",
        }));
        setMembers(mapped);
      });
  }, [selectedExtracurricular]);

  const updateAttendance = (memberId: number, status: Member["attendance"]) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, attendance: status } : m))
    );
  };

  const updateNote = (memberId: number, note: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, note } : m))
    );
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("userId");
      if (storedId) setUserId(Number(storedId));
    }
  }, []);

  const handleSaveAttendance = async () => {
    if (!userId) {
      alert("User belum login.");
      return;
    }

    setIsSaving(true);

    try {
      for (const m of members) {
        const payload = {
          tanggal: sessionDate,
          waktu: sessionTime,
          status_hadir: m.attendance,
          catatan: m.note,
          pendaftaran_id: m.id,
          noted_by: userId,
        };

        console.log("Kirim presensi:", payload);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/presensi`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        console.log("Respon fetch:", res);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
      }
      alert("Presensi berhasil disimpan!");
    } catch (err: any) {
      console.error("Error saat simpan presensi:", err);
      alert(`Gagal menyimpan presensi: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
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
            <h1 className="text-xl font-bold">Presensi Anggota</h1>
            <p className="text-sm text-gray-600">Kelola kehadiran anggota ekstrakurikuler</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-700" />
              <span>Informasi Sesi</span>
            </CardTitle>
            <CardDescription>Informasi sesi otomatis sesuai waktu sekarang</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Ekstrakurikuler</Label>
                <Select value={selectedExtracurricular} onValueChange={setSelectedExtracurricular}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih ekstrakurikuler" />
                  </SelectTrigger>
                  <SelectContent>
                    {extracurriculars.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input type="date" value={sessionDate} disabled />
              </div>
              <div className="space-y-2">
                <Label>Waktu</Label>
                <Input type="time" value={sessionTime} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-700" />
              <span>Daftar Anggota</span>
              <Badge className="bg-blue-100 text-blue-700">{members.length} anggota</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4">Anggota</th>
                    <th className="text-left p-4">NIS</th>
                    <th className="text-center p-4">Status Kehadiran</th>
                    <th className="text-left p-4">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, index) => (
                    <tr
                      key={m.id}
                      className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={m.avatar} />
                            <AvatarFallback>
                              {m.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{m.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{m.nis}</td>
                      <td className="p-4">
                        <div className="flex justify-center space-x-2">
                          <Button
                            size="sm"
                            variant={m.attendance === "hadir" ? "default" : "outline"}
                            className={`${
                              m.attendance === "hadir"
                                ? "bg-green-600 hover:bg-green-700"
                                : "hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                            }`}
                            onClick={() => updateAttendance(m.id, "hadir")}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Hadir
                          </Button>
                          <Button
                            size="sm"
                            variant={m.attendance === "tidak_hadir" ? "default" : "outline"}
                            className={`${
                              m.attendance === "tidak_hadir"
                                ? "bg-red-600 hover:bg-red-700"
                                : "hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                            }`}
                            onClick={() => updateAttendance(m.id, "tidak_hadir")}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Tidak Hadir
                          </Button>
                          <Button
                            size="sm"
                            variant={m.attendance === "izin" ? "default" : "outline"}
                            className={`${
                              m.attendance === "izin"
                                ? "bg-yellow-600 hover:bg-yellow-700"
                                : "hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300"
                            }`}
                            onClick={() => updateAttendance(m.id, "izin")}
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Izin
                          </Button>
                          <Button
                            size="sm"
                            variant={m.attendance === "sakit" ? "default" : "outline"}
                            className={`${
                              m.attendance === "sakit"
                                ? "bg-orange-600 hover:bg-orange-700"
                                : "hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300"
                            }`}
                            onClick={() => updateAttendance(m.id, "sakit")}
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Sakit
                          </Button>
                        </div>
                      </td>
                      <td className="p-4">
                        <Input
                          placeholder="Catatan..."
                          value={m.note}
                          onChange={(e) => updateNote(m.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-end">
          <Button
            size="lg"
            onClick={handleSaveAttendance}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 px-8"
          >
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan...</span>
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Simpan Presensi
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
