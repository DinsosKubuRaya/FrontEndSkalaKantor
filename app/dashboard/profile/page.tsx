"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { employeeAPI } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // State Profile
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  // State Password
  const [passData, setPassData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    if (user) {
      setName(user.Name);
      setUsername(user.Username);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await employeeAPI.updateMe({ name, username });
      toast.success("Profil berhasil diperbarui");
      await refreshProfile(); // Refresh data user di context
    } catch (error) {
      toast.error("Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    setLoading(true);
    try {
      await employeeAPI.changePassword({
        current_password: passData.current,
        new_password: passData.new,
        confirm_password: passData.confirm,
      });
      toast.success("Password berhasil diubah. Silakan login ulang.");
      setPassData({ current: "", new: "", confirm: "" });
    } catch (error: unknown) {
      toast.error("Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan Akun</h2>
        <p className="text-gray-500">
          Kelola informasi profil dan keamanan akun Anda.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="general">Umum</TabsTrigger>
          <TabsTrigger value="security">Keamanan</TabsTrigger>
        </TabsList>

        {/* TAB UMUM */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Profil</CardTitle>
              <CardDescription>
                Update nama dan username Anda disini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    value={user?.Role}
                    disabled
                    className="bg-gray-100 capitalize"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB SECURITY */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Ganti Password</CardTitle>
              <CardDescription>
                Pastikan password baru Anda aman dan kuat.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label>Password Saat Ini</Label>
                  <Input
                    type="password"
                    value={passData.current}
                    onChange={(e) =>
                      setPassData({ ...passData, current: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password Baru</Label>
                  <Input
                    type="password"
                    value={passData.new}
                    onChange={(e) =>
                      setPassData({ ...passData, new: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Konfirmasi Password Baru</Label>
                  <Input
                    type="password"
                    value={passData.confirm}
                    onChange={(e) =>
                      setPassData({ ...passData, confirm: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={loading}
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Ubah Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
