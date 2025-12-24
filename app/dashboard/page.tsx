"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { documentAPI, employeeAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, FolderOpen } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.Role === "admin";

  const [stats, setStats] = useState({
    myDocs: 0,
    allDocs: 0,
    employees: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const myDocsRes = await documentAPI.getMyDocuments();
        const myDocsCount = myDocsRes.data?.documents?.length || 0;

        let allDocsCount = 0;
        let employeesCount = 0;

        if (isAdmin) {
          const allDocsRes = await documentAPI.getAllAdmin({ limit: 1 });
          const employeesRes = await employeeAPI.getAll({ limit: 1 });

          allDocsCount = allDocsRes.data?.pagination?.total_items || 0;
          employeesCount = employeesRes.meta?.total_items || 0;
        }

        setStats({
          myDocs: myDocsCount,
          allDocs: allDocsCount,
          employees: employeesCount,
        });
      } catch (error) {
        throw error;
      }
    };

    if (user) fetchStats();
  }, [user, isAdmin]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Selamat datang kembali,{" "}
          <span className="font-semibold text-primary uppercase">
            {user?.Name}
          </span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/*  Dokumen Saya  */}
        <Card className="shadow-sm border-border/60 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Dokumen Saya</CardTitle>
            <FolderOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myDocs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Arsip pribadi Anda
            </p>
          </CardContent>
        </Card>

        {/* Card Admin Only */}
        {isAdmin && (
          <>
            <Card className="shadow-sm border-border/60 hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Total Pegawai
                </CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.employees}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pengguna terdaftar
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/60 hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Semua Dokumen
                </CardTitle>
                <FileText className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.allDocs}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total arsip sistem
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
