"use client"

import { useState, Suspense } from "react" // Import Suspense
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { BookOpen, Users, Trophy, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner";

// Buat komponen terpisah untuk menggunakan useSearchParams
// Ini akan memastikan useSearchParams hanya dijalankan di client
function RoleTabs() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "siswa";

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [emailSiswa, setEmailSiswa] = useState("");
  const [passwordSiswa, setPasswordSiswa] = useState("");
  const [emailPembina, setEmailPembina] = useState("");
  const [passwordPembina, setPasswordPembina] = useState("");

  const handleLogin = async (role: string) => {
    setIsLoading(true);
    try {
      const payload = {
        email: role === "siswa" ? emailSiswa : emailPembina,
        password: role === "siswa" ? passwordSiswa : passwordPembina,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login gagal");
      }

      const data = await response.json();
      console.log("LOGIN SUCCESS:", data);
      toast.success("Login berhasil!");

      // simpan token dan user
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userId", data.user.id.toString());
      }

      // redirect
      if (role === "siswa") {
        window.location.href = "/dashboard/siswa";
      } else {
        window.location.href = "/dashboard/pembina";
      }
    } catch (err: any) {
      toast.error("Login gagal: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue={defaultRole} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger
          value="siswa"
          className="flex items-center space-x-2"
        >
          <Users className="w-4 h-4" />
          <span>Siswa</span>
        </TabsTrigger>
        <TabsTrigger
          value="pembina"
          className="flex items-center space-x-2"
        >
          <Trophy className="w-4 h-4" />
          <span>Pembina</span>
        </TabsTrigger>
      </TabsList>

      {/* siswa */}
      <TabsContent value="siswa" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="student-email">Email</Label>
          <Input
            id="student-email"
            type="email"
            placeholder="Masukkan email"
            className="h-11"
            value={emailSiswa}
            onChange={(e) => setEmailSiswa(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="student-password">Password</Label>
          <div className="relative">
            <Input
              id="student-password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              className="h-11 pr-10"
              value={passwordSiswa}
              onChange={(e) => setPasswordSiswa(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <Button
        className="w-full h-11 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 flex items-center justify-center gap-2"
        onClick={() => handleLogin("siswa")}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Memproses...
          </>
        ) : (
          "Masuk sebagai Siswa"
        )}
      </Button>
      </TabsContent>

      {/* pembina */}
      <TabsContent value="pembina" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="teacher-email">Email</Label>
          <Input
            id="teacher-email"
            type="email"
            placeholder="Masukkan email"
            className="h-11"
            value={emailPembina}
            onChange={(e) => setEmailPembina(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="teacher-password">Password</Label>
          <div className="relative">
            <Input
              id="teacher-password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              className="h-11 pr-10"
              value={passwordPembina}
              onChange={(e) => setPasswordPembina(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
         <Button
        className="w-full h-11 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 flex items-center justify-center gap-2"
        onClick={() => handleLogin("pembina")}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Memproses...
          </>
        ) : (
          "Masuk sebagai pembina"
        )}
      </Button>
      </TabsContent>
    </Tabs>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-700 to-blue-900 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
              Ekskoola
            </h1>
          </Link>
          <p className="text-gray-600">Masuk ke akun Anda</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Masuk</CardTitle>
            <CardDescription className="text-center">
              Pilih peran Anda untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Bungkus komponen yang menggunakan useSearchParams dengan Suspense */}
            <Suspense fallback={<div>Loading form...</div>}>
              <RoleTabs />
            </Suspense>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-gray-600 text-center">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:underline font-medium"
              >
                Daftar sebagai siswa
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}