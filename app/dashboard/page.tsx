"use client";

import { useAuth } from "@/context/AuthContext";
import { FileText, Users, Clock, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      name: "Total Dokumen",
      value: "1,240",
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      name: "Staff Aktif",
      value: "24",
      icon: Users,
      color: "bg-green-500",
    },
    {
      name: "Dokumen Pending",
      value: "12",
      icon: Clock,
      color: "bg-orange-500",
    },
    {
      name: "Perlu Tindakan",
      value: "5",
      icon: AlertCircle,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h2>
          <p className="text-sm text-gray-500">
            Selamat datang kembali,{" "}
            <span className="font-bold text-gray-800">
              {user?.name || "User"}
            </span>
            !
          </p>
        </div>
      </div>

      {/* Grid Statistik */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="overflow-hidden rounded-lg bg-white shadow transition-all hover:shadow-md"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`shrink-0 rounded-md p-3 ${item.color}`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      {item.name}
                    </dt>
                    <dd>
                      <div className="text-lg font-bold text-gray-900">
                        {item.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
