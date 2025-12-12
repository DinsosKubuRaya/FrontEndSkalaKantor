"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DocumentsPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Redirect berdasarkan role
      if (user.role === "admin") {
        router.push("/dashboard/admin/documents");
      } else {
        router.push("/dashboard/my-documents");
      }
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-sm text-gray-600">Mengalihkan...</p>
      </div>
    </div>
  );
}
