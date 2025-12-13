"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { documentAPI, employeeAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, ShieldCheck, Clock } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDocs: 0,
    myDocs: 0,
    totalStaff: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const myDocsRes = await documentAPI.getMyDocuments();
        let allDocsCount = 0;
        let staffCount = 0;

        if (user?.Role === "admin" || user?.Role === "superadmin") {
          const [allDocsRes, staffRes] = await Promise.all([
            documentAPI.getAllAdmin(),
            employeeAPI.getAll(),
          ]);
          allDocsCount = allDocsRes.status ? allDocsRes.data.length : 0;
          staffCount = staffRes.status ? staffRes.data.length : 0;
        }

        setStats({
          myDocs: myDocsRes.status ? myDocsRes.data.length : 0,
          totalDocs: allDocsCount,
          totalStaff: staffCount,
        });
      } catch (error) {
        console.error("Gagal memuat statistik dashboard", error);
      }
    };

    if (user) {
      loadStats();
    }
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Header Welcome */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-500">
          Halo,{" "}
          <span className="font-semibold text-blue-600">{user?.Name}</span>!
          Anda login sebagai{" "}
          <span className="capitalize font-semibold">{user?.Role}</span>.
        </p>
      </div>

      {/* Statistik */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Dokumen Saya */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dokumen Saya</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myDocs}</div>
            <p className="text-xs text-muted-foreground">
              Total upload pribadi
            </p>
          </CardContent>
        </Card>

        {/* Kartu Khusus Admin */}
        {(user?.Role === "admin" || user?.Role === "superadmin") && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Arsip (Admin)
                </CardTitle>
                <ShieldCheck className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDocs}</div>
                <p className="text-xs text-muted-foreground">
                  Seluruh dokumen sistem
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Pegawai
                </CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStaff}</div>
                <p className="text-xs text-muted-foreground">
                  Staff aktif terdaftar
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Kartu Info Waktu */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hari Ini</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </div>
            <p className="text-xs text-muted-foreground">Selamat bekerja!</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions / Banner */}
      <div className="rounded-lg border bg-linear-to-r from-blue-50 to-indigo-50 p-8">
        <h3 className="text-lg font-semibold text-blue-900">
          Mulai Mengelola Arsip
        </h3>
        <p className="mt-2 text-sm text-blue-700 max-w-2xl">
          Gunakan menu di sidebar sebelah kiri untuk mengunggah dokumen baru
          atau melihat arsip yang sudah tersimpan. Pastikan Anda selalu
          memeriksa dokumen sebelum mengunggah.
        </p>
      </div>
    </div>
  );
}
