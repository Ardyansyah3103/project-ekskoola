"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  User,
  BookOpen,
  Clock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

function DaftarEkstrakurikulerContent() {
  const params = useParams();
  const router = useRouter();

  const ekskulId = params.ekskulId;
  const userId = params.userId;

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [data, setData] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    console.log("params:", params);
  }, [params]);

  // GET data
  useEffect(() => {
    if (!ekskulId || !userId) return;

    const fetchData = async () => {
      setIsFetching(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/form-pendaftaran/${ekskulId}/${userId}`
        );
        if (!res.ok) throw new Error("Gagal mengambil data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [ekskulId, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ekskulId) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang.");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pendaftaran`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            eksul_id: Number(ekskulId),
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        alert(`Gagal mendaftar: ${errorText}`);
        return;
      }

      setIsSuccess(true);

      setTimeout(() => {
        router.push("/dashboard/siswa");
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mendaftar");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading states
  if (!ekskulId || !userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Memuat parameter...</p>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Memuat data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Data tidak ditemukan</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">
              Pendaftaran Berhasil!
            </h2>
            <p className="text-gray-600 mb-4">
              Anda telah berhasil mendaftar ekstrakurikuler{" "}
              <strong>{data.ekstrakurikuler.name}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Mengarahkan kembali ke dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/siswa">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Daftar Ekstrakurikuler</h1>
              <p className="text-sm text-gray-600">
                {data.ekstrakurikuler.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-700" />
                  <span>Form Pendaftaran</span>
                </CardTitle>
                <CardDescription>
                  Lengkapi data berikut untuk mendaftar ekstrakurikuler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Data Siswa
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Nama Lengkap</Label>
                        <Input
                          value={data.profile.name}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      <div>
                        <Label>NIS</Label>
                        <Input
                          value={data.profile.nomorInduk ?? "-"}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={data.profile.email}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-700 hover:bg-blue-800"
                    disabled={isLoading}
                  >
                    {isLoading ? "Memproses..." : "Daftar Sekarang"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>{data.ekstrakurikuler.name}</CardTitle>
                <CardDescription>
                  {data.ekstrakurikuler.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Periode</p>
                    <p className="text-sm text-gray-600">
                      {data.ekstrakurikuler.periode_start} -{" "}
                      {data.ekstrakurikuler.periode_end}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Pembina ID</p>
                    <p className="text-sm text-gray-600">
                      {data.ekstrakurikuler.pembina_id}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DaftarEkstrakurikuler() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DaftarEkstrakurikulerContent />
    </Suspense>
  );
}
