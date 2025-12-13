"use client";

import { useEffect, useState } from "react";
import { employeeAPI } from "@/lib/api";
import { Employee, EmployeeBackendData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { EmployeeFormDialog } from "@/components/ui/users/UserFormDialog";
import { DeleteUserDialog } from "@/components/ui/users/DeleteUserDialog";

export default function UsersPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = searchQuery
        ? await employeeAPI.search(searchQuery)
        : await employeeAPI.getAll();
      const rawData = response.data || [];

      const mappedEmployees: Employee[] = Array.isArray(rawData)
        ? rawData.map((item: EmployeeBackendData | Employee) => ({
            ID: "id" in item ? item.id : item.ID,
            Name: "name" in item ? item.name : item.Name,
            Username: "username" in item ? item.username : item.Username,
            Role: "role" in item ? item.role : item.Role,
            CreatedAt: "created_at" in item ? item.created_at : item.CreatedAt,
            UpdatedAt: "updated_at" in item ? item.updated_at : item.UpdatedAt,
          }))
        : [];

      setEmployees(mappedEmployees);
    } catch (error) {
      toast.error("Gagal memuat data pegawai");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmployees();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Data Pegawai</h2>
        <EmployeeFormDialog onSuccess={fetchEmployees}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Tambah Pegawai
          </Button>
        </EmployeeFormDialog>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama pegawai..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary">
          Cari
        </Button>
      </form>

      {loading ? (
        <div className="text-center py-10">Memuat data...</div>
      ) : employees.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          Tidak ada pegawai ditemukan.
        </div>
      ) : (
        <>
          <div className="hidden md:block border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.ID}>
                    <TableCell className="font-medium">{emp.Name}</TableCell>
                    <TableCell>{emp.Username}</TableCell>
                    <TableCell>
                      {/*  badge untuk superadmin */}
                      <Badge
                        variant={
                          emp.Role === "admin" || emp.Role === "superadmin"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {emp.Role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <EmployeeFormDialog
                        onSuccess={fetchEmployees}
                        userToEdit={emp}
                      />
                      <DeleteUserDialog user={emp} onSuccess={fetchEmployees} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-4 md:hidden">
            {employees.map((emp) => (
              <Card key={emp.ID}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {emp.Name}
                  </CardTitle>
                  <Badge
                    variant={
                      emp.Role === "admin" || emp.Role === "superadmin"
                        ? "default"
                        : "outline"
                    }
                  >
                    {emp.Role}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground mb-4">
                    Username:{" "}
                    <span className="font-mono text-black">{emp.Username}</span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <EmployeeFormDialog
                      onSuccess={fetchEmployees}
                      userToEdit={emp}
                    />
                    <DeleteUserDialog user={emp} onSuccess={fetchEmployees} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
