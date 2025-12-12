"use client";

import { useEffect, useState } from "react";
import { employeeAPI, getErrorMessage } from "@/lib/api";
import { Employee } from "@/types";
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
import { Plus, Trash2, Pencil, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import EmployeeFormDialog from "@/components/ui/employees/EmployeeFormDialog";

export default function EmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      let data;
      if (searchQuery) {
        data = await employeeAPI.search(searchQuery);
      } else {
        data = await employeeAPI.getAll();
      }
      setEmployees(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchEmployees();
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pegawai ini?")) return;
    try {
      await employeeAPI.delete(id);
      toast.success("Pegawai dihapus");
      fetchEmployees();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const openCreate = () => {
    setSelectedEmp(null);
    setIsDialogOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setSelectedEmp(emp);
    setIsDialogOpen(true);
  };

  if (user?.role !== "admin") return <div>Akses Ditolak</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Pegawai</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Pegawai
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Daftar Pegawai</CardTitle>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Cari nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-50"
              />
              <Button type="submit" variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Terdaftar</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Data tidak ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>{emp.username}</TableCell>
                    <TableCell>
                      <Badge
                        variant={emp.role === "admin" ? "default" : "secondary"}
                      >
                        {emp.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(emp.created_at).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(emp)}
                      >
                        <Pencil className="h-4 w-4 text-amber-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleDelete(emp.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EmployeeFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchEmployees}
        employeeToEdit={selectedEmp}
      />
    </div>
  );
}
