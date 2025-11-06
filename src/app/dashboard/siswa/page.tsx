"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Clock, Trophy, AlertCircle, Plus, LogOut } from "lucide-react";
import Link from "next/link";
import { fetchWithToken } from "@/lib/fetcher";
import { jwtDecode } from "jwt-decode";

type TokenPayload = {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

/* ----------------------- */
/* 1. Wrapper Component */
/* ----------------------- */
export default function StudentDashboard() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <StudentDashboardContent />
    </QueryClientProvider>
  );
}

/* ----------------------- */
/* 2. Page UI Content */
/* ----------------------- */
function StudentDashboardContent() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("Tidak ada token ditemukan. Mengarahkan ke halaman login.");
      router.push("/login");
      return;
    }

    try {
      const decoded: TokenPayload = jwtDecode(token);

      if (decoded.role !== "siswa") {
        console.warn(`Akses ditolak: Anda login sebagai ${decoded.role}, bukan siswa.`);
        router.push("/login?error=unauthorized_role");
        return;
      }

      setUserId(Number(decoded.sub));
    } catch (error) {
      console.error("Gagal mendekode token JWT atau token tidak valid:", error);
      localStorage.removeItem("token");
      router.push("/login?error=invalid_token");
    }
  }, [router]);

  const { data, error } = useQuery({
    queryKey: ["dashboard", userId],
    queryFn: () =>
      fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/siswa/dashboard?userId=${userId}`
      ),
    enabled: !!userId,
  });

  
  if (error) return <div className="p-8 text-red-600">Error: {(error as Error).message}</div>;
  
  const user = data?.user ?? {};
  const allExtracurriculars = data?.allExtracurriculars ?? [];
  const myExtracurriculars = data?.myExtracurriculars ?? [];
  const displayName = user.name ?? "Siswa";

  const canRegister = (ekskul: any) => {
    if (+ekskul.JumlahAnggota >= ekskul.maxAnggota)
      return { can: false, reason: "Kuota penuh" };
    if (myExtracurriculars.length >= 2)
      return { can: false, reason: "Maksimal 2 ekstrakurikuler" };
    const taken = myExtracurriculars.map((e: any) => e.ekstra.jadwal.hari);
    if (taken.includes(ekskul.jadwal.hari))
      return { can: false, reason: "Jadwal bentrok" };
    return { can: true, reason: "" };
  };

  const isActivePeriod = (ekskul: any) => {
    const today = new Date().toISOString().split("T")[0];
    return ekskul.periode_start <= today && today <= ekskul.periode_end;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-700 to-blue-900">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Dashboard Siswa</h1>
              <p className="text-sm text-gray-600">Selamat datang, {displayName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                <LogOut className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="container mx-auto px-4 py-8">
        {/* PROFILE */}
        <Card className="mb-8 border-0 bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-2 border-white">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt="avatar siswa" />
                <AvatarFallback className="bg-white text-lg font-bold text-blue-600">
                  {(user?.name ?? "Siswa") 
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="opacity-90">NIS: {user.nomorInduk}</p>
                <p className="opacity-90">
                  Ekstrakurikuler: {myExtracurriculars.length}/2
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5 text-blue-700" />
              <span>Aksi Cepat</span>
            </CardTitle>
            <CardDescription>Fitur utama untuk siswa</CardDescription>
          </CardHeader>
          {/* Perbaikan di sini: Hapus grid dari CardContent jika hanya ada satu tombol yang ingin full width */}
        <CardContent className="px-6 pb-6"> {/* Menyesuaikan padding agar konsisten */}
          <Link href="/dashboard/siswa/daftar-ekstrakurikuler-list">
           <Button className="w-full h-16 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 flex flex-col items-center justify-center space-y-1">
              <Plus className="w-6 h-6" />
          <span>Daftar Ekstrakurikuler</span>
          </Button>
         </Link>
        </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* MAIN COLUMN */}
          <div className="space-y-8 lg:col-span-2">
            {/* My Ekskul */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-blue-700" />
                  <span>Ekstrakurikuler Saya</span>
                </CardTitle>
                <CardDescription>Ekstrakurikuler yang sedang Anda ikuti</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {myExtracurriculars.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <Trophy className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Anda belum mengikuti ekstrakurikuler apa pun</p>
                    <p className="text-sm">Daftar ekstrakurikuler untuk memulai!</p>
                  </div>
                ) : (
                  myExtracurriculars.map((item: any) => (
                    <div
                      key={item.id}
                      className="rounded-lg border bg-gradient-to-r from-blue-50 to-blue-100 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{item.ekstra.name}</h3>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="mb-1 text-sm text-gray-600">Jadwal</p>
                          <p className="font-medium">{item.ekstra.jadwal.hari}</p>
                        </div>
                      </div>
                      <div className="mt-3 rounded border-l-4 border-blue-500 bg-white p-3">
                        <p className="text-sm font-medium text-blue-700">Status:</p>
                        <p className="text-sm">{item.status}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Available Ekskul Preview */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Plus className="h-5 w-5 text-blue-700" />
                    <span>Ekstrakurikuler Tersedia</span>
                  </div>
                  <Link href="/dashboard/siswa/daftar-ekstrakurikuler-list">
                    <Button variant="outline" size="sm">
                      Lihat Semua
                    </Button>
                  </Link>
                </CardTitle>
                <CardDescription>Ekstrakurikuler yang dapat Anda ikuti</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {allExtracurriculars.slice(0, 3).map((ekskul: any) => {
                  const registerStatus = canRegister(ekskul);
                  const active = isActivePeriod(ekskul);
                  return (
                    <div
                      key={ekskul.id}
                      className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{ekskul.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{ekskul.description}</p>
                        </div>
                        {active && registerStatus.can ? (
                          <Link
                            href={`/dashboard/siswa/daftar-ekstrakurikuler/${ekskul.id}/${userId}`}
                          >
                            <Button size="sm" className="bg-blue-700 hover:bg-blue-800">
                              Daftar
                            </Button>
                          </Link>
                        ) : (
                          <Button size="sm" disabled>
                            {active ? "Tidak Tersedia" : "Periode Tutup"}
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-4 text-sm md:grid-cols-3">
                        <div>
                          <p className="text-gray-600">Jadwal</p>
                          <p className="font-medium">{ekskul.jadwal.hari}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Anggota</p>
                          <span className="font-medium text-xs">
                            {ekskul.JumlahAnggota}/{ekskul.maxAnggota}
                          </span>
                        </div>
                        <div>
                          <p className="text-gray-600">Status</p>
                          <span
                            className={`font-medium text-xs ${
                              active ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {active ? "Aktif" : "Tidak Aktif"}
                          </span>
                        </div>
                      </div>
                      {!registerStatus.can && active && (
                        <div className="mt-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                          <AlertCircle className="mr-1 inline h-4 w-4" />
                          {registerStatus.reason}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="text-center pt-4">
                  <Link href="/dashboard/siswa/daftar-ekstrakurikuler-list">
                    <Button variant="outline" className="w-full bg-transparent">
                      Lihat Semua Ekstrakurikuler ({allExtracurriculars.length})
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
