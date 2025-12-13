"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { documentAPI, employeeAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Clock } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
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
        if (user?.Role === "admin") {
          const allDocsRes = await documentAPI.getAllAdmin({ limit: 100 });
          const employeesRes = await employeeAPI.getAll({ limit: 100 });
          allDocsCount =
            allDocsRes.data?.pagination?.total_items ||
            allDocsRes.data?.documents?.length ||
            0;
          employeesCount =
            employeesRes.meta?.total_items ||
            (Array.isArray(employeesRes.data) ? employeesRes.data.length : 0);
        }

        setStats({
          myDocs: myDocsCount,
          allDocs: allDocsCount,
          employees: employeesCount,
        });
      } catch (error) {
        console.error("Failed to load stats", error);
      }
    };

    if (user) fetchStats();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Selamat datang kembali, {user?.Name}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dokumen Saya</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myDocs}</div>
            <p className="text-xs text-muted-foreground">
              Total dokumen pribadi
            </p>
          </CardContent>
        </Card>

        {user?.Role === "admin" && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Pegawai
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.employees}</div>
                <p className="text-xs text-muted-foreground">
                  Terdaftar di sistem
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Semua Dokumen
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.allDocs}</div>
                <p className="text-xs text-muted-foreground">
                  Total arsip kantor
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
