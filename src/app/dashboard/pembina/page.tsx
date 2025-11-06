"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  ClipboardList,
  Plus,
  LogOut,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

type Extracurricular = {
  id: number;
  name: string;
  JumlahAnggota: number;
  maxAnggota: number;
  periode_start: string; // Tambahkan ini
  periode_end: string;   // Tambahkan ini
  jadwal?: {
    hari: string;
    waktuMulai: string;
    waktuSelesai: string;
  } | null;
};

type SupervisorData = {
  id: string;
  name: string;
  nomorInduk: string;
  role: string;
};

type TokenPayload = {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

export default function PembinaDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [supervisorData, setSupervisorData] = useState<SupervisorData | null>(null);
  const [myExtracurriculars, setMyExtracurriculars] = useState<Extracurricular[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login?role=pembina");
        return;
      }

      try {
        const decoded: TokenPayload = jwtDecode(token);
        if (decoded.role !== "pembina") {
          console.warn("Akses ditolak: bukan pembina");
          router.push("/login?role=pembina");
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pembina/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Gagal fetch data dashboard");

        const data = await res.json();
        setSupervisorData({
          id: data.user.id,
          name: data.user.name,
          nomorInduk: data.user.nomorInduk,
          role: data.user.role,
        });
        setMyExtracurriculars(data.extracurriculars);
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
        router.push("/login?role=pembina");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login?role=pembina");
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="w-16 h-16 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        <p className="text-gray-500">Memuat data dashboard pembina</p>
      </div>
    </div>
  ); 

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-700 to-blue-900 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Dashboard Pembina</h1>
              <p className="text-sm text-gray-600">Selamat datang, {supervisorData?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Card */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-blue-700 to-blue-900 text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 border-2 border-white">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-white text-blue-600 text-lg font-bold">
                  {(supervisorData?.name ?? "pembina")
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{supervisorData?.name}</h2>
                <p className="opacity-90">
                  NIP: {supervisorData?.nomorInduk}
                </p>
                <p className="opacity-90">
                  Mengelola: {myExtracurriculars.length} Ekstrakurikuler
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-blue-700" />
                  <span>Aksi Cepat</span>
                </CardTitle>
                <CardDescription>Kelola ekstrakurikuler Anda</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <Link href="/dashboard/pembina/buat-ekstrakurikuler">
                  <Button className="w-full h-16 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 flex flex-col items-center justify-center space-y-1">
                    <Plus className="w-6 h-6" />
                    <span>Buat Ekstrakurikuler</span>
                  </Button>
                </Link>
                <Link href="/dashboard/pembina/presensi">
                  <Button
                    variant="outline"
                    className="w-full h-16 border-blue-200 hover:bg-blue-50 flex flex-col items-center justify-center space-y-1 bg-transparent"
                  >
                    <ClipboardList className="w-6 h-6 text-blue-700" />
                    <span>Ambil Presensi</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* My Extracurriculars */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-blue-700" />
                  <span>Ekstrakurikuler Saya</span>
                </CardTitle>
                <CardDescription>Ekstrakurikuler yang Anda kelola</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {myExtracurriculars.map((ekskul) => {
                  const now = new Date();
                  const periodeEnd = new Date(ekskul.periode_end);
                  const isActive = now <= periodeEnd;

                  return (
                    <div
                      key={ekskul.id}
                      className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">{ekskul.name}</h3>
                        {isActive ? (
                          <Badge className="bg-green-100 text-green-700">Aktif</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">Tidak Aktif</Badge>
                        )}
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Anggota</p>
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={(ekskul.JumlahAnggota / ekskul.maxAnggota) * 100}
                              className="flex-1"
                            />
                            <span className="text-sm font-medium">
                              {ekskul.JumlahAnggota}/{ekskul.maxAnggota}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Jadwal</p>
                          <p className="font-medium text-sm">
                            {ekskul.jadwal
                              ? `${ekskul.jadwal.hari}, ${ekskul.jadwal.waktuMulai} - ${ekskul.jadwal.waktuSelesai}`
                              : "Belum ada jadwal"}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Link href="/dashboard/pembina/presensi">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs bg-transparent"
                            >
                              Presensi
                            </Button>
                          </Link>
                          <Link href={`/dashboard/pembina/edit-ekstrakurikuler/${ekskul.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs bg-transparent"
                            >
                              Kelola
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {myExtracurriculars.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Anda belum mengelola ekstrakurikuler apapun</p>
                    <p className="text-sm">Buat ekstrakurikuler baru untuk memulai!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6"></div>
        </div>
      </div>
    </div>
  );
}
