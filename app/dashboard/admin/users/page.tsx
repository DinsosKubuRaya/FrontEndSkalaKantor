"use client";

import { useEffect, useState } from "react";
import { employeeAPI, getErrorMessage } from "@/lib/api";
import { Employee, EmployeeBackendData, EmployeeFilterParams } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { EmployeeFormDialog } from "@/components/ui/users/UserFormDialog";
import { DeleteUserDialog } from "@/components/ui/users/DeleteUserDialog";
import { UserTable } from "@/components/ui/users/UserTable";
import { SkeletonTable } from "@/components/ui/skeleton-table";

export default function UsersPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editUser, setEditUser] = useState<Employee | null>(null);
  const [deleteUser, setDeleteUser] = useState<Employee | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params: EmployeeFilterParams = {
        page: currentPage,
        limit: itemsPerPage,
        name: searchQuery || undefined,
        sort_by: "created_at",
        sort_order: "desc",
      };

      const response = await employeeAPI.getAll(params);
      const rawData = response.data || [];
      const mappedEmployees: Employee[] = Array.isArray(rawData)
        ? rawData.map((item: EmployeeBackendData | Employee) => ({
            ID: "id" in item ? item.id : item.ID,
            Name: "name" in item ? item.name : item.Name,
            Username: "username" in item ? item.username : item.Username,
            Role: "role" in item ? item.role : item.Role,
          }))
        : [];

      setEmployees(mappedEmployees);

      if (response.meta) {
        setTotalPages(response.meta.total_pages);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEmployees();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Manajemen Pegawai
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola akun akses pegawai dinas.
          </p>
        </div>
        <EmployeeFormDialog onSuccess={fetchEmployees}>
          <Button className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Tambah Pegawai
          </Button>
        </EmployeeFormDialog>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama pegawai..."
                className="pl-9 bg-muted/30 border-transparent focus:bg-background focus:border-primary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary">
              Cari
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <SkeletonTable rows={5} columns={4} />
      ) : (
        <UserTable
          users={employees}
          onEdit={setEditUser}
          onDelete={setDeleteUser}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">Halaman {currentPage}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Conditional Dialogs */}
      {editUser && (
        <EmployeeFormDialog
          userToEdit={editUser}
          onSuccess={() => {
            setEditUser(null);
            fetchEmployees();
          }}
          key={editUser.ID}
        />
      )}

      {deleteUser && (
        <DeleteUserDialog
          user={deleteUser}
          onSuccess={() => {
            setDeleteUser(null);
            fetchEmployees();
          }}
        />
      )}
    </div>
  );
}
