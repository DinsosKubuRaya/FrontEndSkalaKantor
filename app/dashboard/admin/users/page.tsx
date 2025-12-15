"use client";

import { useEffect, useState } from "react";
import { employeeAPI, getErrorMessage } from "@/lib/api";
import { Employee, EmployeeBackendData, EmployeeFilterParams } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Plus,
  Search,
  Filter,
  X,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { EmployeeFormDialog } from "@/components/ui/users/UserFormDialog";
import { DeleteUserDialog } from "@/components/ui/users/DeleteUserDialog";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { EmptyState } from "@/components/ui/empty-state";

export default function UsersPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  const [showFilters, setShowFilters] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params: EmployeeFilterParams = {
        page: currentPage,
        limit: itemsPerPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (searchQuery) params.name = searchQuery;
      if (roleFilter && roleFilter !== "all") params.role = roleFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await employeeAPI.getAll(params);
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

      if (response.meta) {
        setTotalPages(response.meta.total_pages);
        setTotalItems(response.meta.total_items);
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
  }, [currentPage, sortBy, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEmployees();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setStartDate("");
    setEndDate("");
    setSortBy("created_at");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const activeFiltersCount = [
    searchQuery,
    roleFilter !== "all" ? roleFilter : "",
    startDate,
    endDate,
  ].filter(Boolean).length;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Pegawai</h2>
          {totalItems > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Menampilkan {startItem}-{endItem} dari {totalItems} pegawai
            </p>
          )}
        </div>
        <EmployeeFormDialog onSuccess={fetchEmployees}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Tambah Pegawai
          </Button>
        </EmployeeFormDialog>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
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
                <Search className="mr-2 h-4 w-4" />
                Cari
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {showFilters && (
              <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Role</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal Mulai</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal Akhir</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="md:col-span-3 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Hapus Filter
                  </Button>
                  <Button type="submit" size="sm">
                    Terapkan Filter
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading ? (
        <SkeletonTable rows={5} columns={4} />
      ) : employees.length === 0 ? (
        <Card>
          <EmptyState
            icon={searchQuery || activeFiltersCount > 0 ? "search" : "users"}
            title={
              searchQuery || activeFiltersCount > 0
                ? "Tidak ada hasil ditemukan"
                : "Belum ada pegawai"
            }
            description={
              searchQuery || activeFiltersCount > 0
                ? "Coba ubah filter pencarian Anda"
                : "Mulai dengan menambahkan pegawai baru"
            }
            action={
              searchQuery || activeFiltersCount > 0
                ? {
                    label: "Hapus Filter",
                    onClick: handleClearFilters,
                  }
                : undefined
            }
          />
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("name")}
                      className="hover:bg-transparent"
                    >
                      Nama
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("role")}
                      className="hover:bg-transparent"
                    >
                      Role
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("created_at")}
                      className="hover:bg-transparent"
                    >
                      Tanggal Dibuat
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.ID}>
                    <TableCell className="font-medium">{emp.Name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {emp.Username}
                    </TableCell>
                    <TableCell>
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
                    <TableCell className="text-sm text-muted-foreground">
                      {emp.CreatedAt
                        ? new Date(emp.CreatedAt).toLocaleDateString("id-ID")
                        : "-"}
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

          {/* Mobile Cards */}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
