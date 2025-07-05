"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  ArrowLeft,
  Search,
  Filter,
  Plus,
  AlertCircle,
  Users,
  Clock,
  User,
} from "lucide-react";
import { fetchWithToken } from "@/lib/fetcher";
import { jwtDecode } from "jwt-decode";

type TokenPayload = {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

type Extracurricular = {
  id: number;
  name: string;
  description: string;
  maxAnggota: number;
  JumlahAnggota: number;
  pembina_id: number;
  periode_start: string;
  periode_end: string;
  jadwal_id: number;
  jadwal: {
    hari: string;
    waktuMulai: string;
    waktuSelesai: string;
  };
  pembina: {
    id: number;
    name: string;
  } | null;
};

type MyExtracurricular = {
  id: number;
  status: string;
  register_at: string;
  ekstra: Extracurricular;
};

/* ----------------------- */
/* 1. Wrapper Component */
/* ----------------------- */
export default function DaftarEkstrakurikulerListPageWrapper() {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <DaftarEkstrakurikulerListPageContent />
    </QueryClientProvider>
  );
}

/* ----------------------- */
/* 2. Page UI Content */
/* ----------------------- */
function DaftarEkstrakurikulerListPageContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const decoded: TokenPayload = jwtDecode(token);
      if (decoded.role !== "siswa") {
        router.push("/login?error=unauthorized_role");
        return;
      }
      setUserId(Number(decoded.sub));
    } catch (error) {
      localStorage.removeItem("token");
      router.push("/login?error=invalid_token");
    }
  }, [router]);

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["ekstrakurikulerList", userId],
    queryFn: () =>
      fetchWithToken(`${process.env.NEXT_PUBLIC_API_URL}/siswa/dashboard?userId=${userId}`),
    enabled: !!userId,
  });

  const availableExtracurriculars: Extracurricular[] = dashboardData?.allExtracurriculars || [];
  const myExtracurriculars: MyExtracurricular[] = dashboardData?.myExtracurriculars || [];

  const isActivePeriod = (ekskul: Extracurricular) => {
    const today = new Date().toISOString().split("T")[0];
    return ekskul.periode_start <= today && today <= ekskul.periode_end;
  };

  const canRegister = (ekskul: Extracurricular) => {
    if (!isActivePeriod(ekskul)) return { can: false, reason: "Pendaftaran belum dibuka atau sudah ditutup." };
    if (ekskul.JumlahAnggota >= ekskul.maxAnggota) return { can: false, reason: "Kuota penuh." };
    if (myExtracurriculars.length >= 2) return { can: false, reason: "Maksimal 2 ekstrakurikuler." };
    const hasConflict = myExtracurriculars.some(
      (my) => my.ekstra.jadwal.hari === ekskul.jadwal.hari
    );
    if (hasConflict) return { can: false, reason: "Jadwal bentrok dengan ekstrakurikuler lain." };
    return { can: true, reason: "" };
  };

  const filteredExtracurriculars = availableExtracurriculars.filter((ekskul) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const matchesSearch =
      ekskul.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
      ekskul.description?.toLowerCase().includes(lowerCaseSearchTerm) ||
      ekskul.pembina?.name?.toLowerCase().includes(lowerCaseSearchTerm);

    const registerStatus = canRegister(ekskul);

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "available" && registerStatus.can) ||
      (filterStatus === "full" && ekskul.JumlahAnggota >= ekskul.maxAnggota);

    return matchesSearch && matchesStatus;
  });

  if (isLoading || userId === null) return <div className="p-8">Memuat daftar ekstrakurikuler...</div>;
  if (error)
    return (
      <div className="p-8 text-red-600">
        Error memuat data: {(error as Error).message}. Pastikan Anda sudah login.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
          <Link href="/dashboard/siswa">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-700 to-blue-900 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Daftar Ekstrakurikuler</h1>
            <p className="text-sm text-gray-600">Pilih ekstrakurikuler yang ingin Anda ikuti</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-6 grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Cari Ekstrakurikuler</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari nama, deskripsi, atau pembina..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="available">Bisa Daftar</SelectItem>
                  <SelectItem value="full">Kuota Penuh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Total Ditemukan</Label>
              <div className="h-10 flex items-center">
                <Badge className="bg-blue-100 text-blue-700 text-sm">
                  {filteredExtracurriculars.length} ekstrakurikuler
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredExtracurriculars.map((ekskul) => {
            const registerStatus = canRegister(ekskul);
            const isRegistered = myExtracurriculars.some((my) => my.ekstra.id === ekskul.id);

            return (
              <Card key={ekskul.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{ekskul.name}</CardTitle>
                    <Badge
                      className={`text-xs ${
                        isRegistered
                          ? "bg-blue-100 text-blue-700"
                          : isActivePeriod(ekskul)
                          ? registerStatus.can
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {isRegistered
                        ? "Terdaftar"
                        : isActivePeriod(ekskul)
                        ? registerStatus.can
                          ? "Aktif"
                          : "Tidak Tersedia"
                        : "Periode Tutup"}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">{ekskul.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>
                        {ekskul.jadwal.hari}, {ekskul.jadwal.waktuMulai}-{ekskul.jadwal.waktuSelesai}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{ekskul.pembina?.name || "N/A"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>
                        {ekskul.JumlahAnggota}/{ekskul.maxAnggota}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2">
                    {isActivePeriod(ekskul) && registerStatus.can && !isRegistered ? (
                      <Link href={`/dashboard/siswa/daftar-ekstrakurikuler/${ekskul.id}/${userId}`}>
                        <Button className="w-full bg-blue-700 hover:bg-blue-800">
                          <Plus className="w-4 h-4 mr-2" />
                          Daftar Sekarang
                        </Button>
                      </Link>
                    ) : (
                      <Button className="w-full" disabled>
                        {isRegistered
                          ? "Sudah Terdaftar"
                          : !isActivePeriod(ekskul)
                          ? "Periode Ditutup"
                          : "Tidak Tersedia"}
                      </Button>
                    )}
                  </div>
                  {!registerStatus.can && !isRegistered && (
                    <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                      <AlertCircle className="mr-1 inline h-4 w-4" />
                      {registerStatus.reason}
                    </div>
                  )}
                  {isRegistered && (
                    <div className="rounded border border-blue-200 bg-blue-50 p-2 text-sm text-blue-700">
                      <AlertCircle className="mr-1 inline h-4 w-4" />
                      Anda sudah terdaftar di ekstrakurikuler ini.
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredExtracurriculars.length === 0 && (
          <Card className="border-0 shadow-lg mt-8">
            <CardContent className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Tidak ada ekstrakurikuler ditemukan
              </h3>
              <p className="text-gray-500 mb-4">
                Coba ubah filter atau kata kunci pencarian Anda.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
              >
                Reset Filter
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
