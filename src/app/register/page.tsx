"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, User, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nomorInduk: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nomorInduk.trim()) {
      newErrors.nomorInduk = "NIS wajib diisi";
    } else if (!/^\d{7}$/.test(formData.nomorInduk)) {
      newErrors.nomorInduk = "NIS harus 7 digit angka";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Nama lengkap wajib diisi";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Nama minimal 2 karakter";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email wajib diisi";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nomorInduk: formData.nomorInduk,
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Pendaftaran gagal");
      }

      alert("Pendaftaran berhasil! Silakan login dengan akun Anda.");
      window.location.href = "/login?role=siswa";
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: "", color: "" };
    if (password.length < 6) return { strength: 25, text: "Lemah", color: "text-red-500" };
    if (password.length < 8) return { strength: 50, text: "Sedang", color: "text-yellow-500" };
    if (password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password)) {
      return { strength: 100, text: "Kuat", color: "text-green-500" };
    }
    return { strength: 75, text: "Baik", color: "text-blue-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
          <p className="text-gray-600">Daftar sebagai siswa untuk memulai</p>
        </div>

        {/* card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Daftar Akun Siswa</CardTitle>
            <CardDescription className="text-center">Lengkapi data diri Anda untuk membuat akun baru</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* nomorInduk */}
              <div className="space-y-2">
                <Label htmlFor="nomorInduk" className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>NIS (Nomor Induk Siswa)</span>
                </Label>
                <Input
                  id="nomorInduk"
                  type="text"
                  placeholder="Masukkan NIS Anda"
                  className={`h-11 ${errors.nomorInduk ? "border-red-500" : ""}`}
                  value={formData.nomorInduk}
                  onChange={(e) => handleInputChange("nomorInduk", e.target.value)}
                />
                {errors.nomorInduk && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.nomorInduk}</span>
                  </p>
                )}
              </div>

              {/* lanjut fields name, email, password, confirmPassword ... */}
              {/* tidak berubah, sama seperti sebelumnya */}
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Nama Lengkap</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama lengkap Anda"
                  className={`h-11 ${errors.name ? "border-red-500" : ""}`}
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Email</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan alamat email Anda"
                  className={`h-11 ${errors.email ? "border-red-500" : ""}`}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Password</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    className={`h-11 pr-10 ${errors.password ? "border-red-500" : ""}`}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>

                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Kekuatan Password:</span>
                      <span className={passwordStrength.color}>{passwordStrength.text}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          passwordStrength.strength <= 25
                            ? "bg-red-500"
                            : passwordStrength.strength <= 50
                            ? "bg-yellow-500"
                            : passwordStrength.strength <= 75
                            ? "bg-blue-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      />
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Konfirmasi Password</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Masukkan ulang password"
                    className={`h-11 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>

                {formData.confirmPassword && (
                  <div className="flex items-center space-x-2 text-xs">
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-500">Password cocok</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-red-500">Password tidak cocok</span>
                      </>
                    )}
                  </div>
                )}

                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>

              {/* submit button */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Mendaftar...</span>
                  </div>
                ) : (
                  "Daftar Akun"
                )}
              </Button>
            </form>
            
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-gray-600 text-center">
              Sudah punya akun?{" "}
              <Link href="/login?role=siswa" className="text-blue-600 hover:underline font-medium">
                Masuk di sini
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
