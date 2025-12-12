"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, FileText, Users, TrendingUp } from "lucide-react";

export default function ReportsPage() {
  const { user } = useAuth();

  const reports = [
    {
      title: "Dokumen per Bulan",
      value: "156",
      change: "+12%",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Pegawai",
      value: "24",
      change: "+2",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Dokumen Aktif",
      value: "1,240",
      change: "+18%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Rata-rata Upload/Hari",
      value: "8",
      change: "+5%",
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Laporan & Statistik
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Ringkasan data dan aktivitas sistem
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {report.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${report.bgColor}`}>
                  <Icon className={`h-4 w-4 ${report.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.value}</div>
                <p className="text-xs text-green-600 mt-1">
                  {report.change} dari bulan lalu
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Halaman ini menampilkan statistik dan laporan sistem arsip digital.
            {user?.role === "admin"
              ? " Sebagai administrator, Anda dapat melihat semua data statistik."
              : " Anda dapat melihat statistik dokumen Anda sendiri."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
