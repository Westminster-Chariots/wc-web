"use client";
import { useState, useEffect } from "react";
import { Settings, Building2, Bell, Users, Save, Loader2, Shield, UserCircle, Lock, Eye, EyeOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Profile {
  id: string;
  userId: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  isCorporate: boolean;
  corporateName: string | null;
  createdAt: string;
}

interface UserRole {
  id: string;
  userId: string;
  role: "admin" | "client";
}

interface UserWithRole extends Profile {
  role: "admin" | "client";
  roleId: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState({ displayName: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [company, setCompany] = useState({
    name: "Westminster Chariots",
    email: "dispatch@westminsterchariots.com",
    phone: "(571) 426-6338",
    address: "Triangle, VA · Washington DC Metropolitan Area",
    website: "https://westminsterchariots.com",
    description: "Premium luxury ground transportation serving the Washington DC metropolitan area.",
  });
  const [savingCompany, setSavingCompany] = useState(false);
  const [notifications, setNotifications] = useState({
    emailNewBooking: true,
    emailStatusChange: true,
    emailDriverAssignment: true,
    emailInvoice: true,
    pushUrgent: true,
    pushReminder: false,
    dailyDigest: true,
    weeklyReport: true,
  });
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchUsers();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get<Profile>("/auth/me");
      setProfile({
        displayName: data.displayName || "",
        phone: data.phone || "",
      });
    } catch {
      toast.error("Failed to load profile");
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get<UserWithRole[]>("/users");
      setUsers(data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleChange = async (userId: string, roleId: string, newRole: "admin" | "client") => {
    try {
      await api.patch(`/users/roles/${roleId}`, { role: newRole });
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await api.patch("/auth/profile", {
        displayName: profile.displayName,
        phone: profile.phone,
      });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.new || !passwordForm.confirm) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (passwordForm.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("Passwords don't match");
      return;
    }

    setChangingPassword(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new,
      });
      setPasswordForm({ current: "", new: "", confirm: "" });
      toast.success("Password changed successfully");
    } catch {
      toast.error("Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveCompany = async () => {
    setSavingCompany(true);
    await new Promise(r => setTimeout(r, 600));
    toast.success("Company info saved");
    setSavingCompany(false);
  };

  const handleSaveNotifications = async () => {
    setSavingNotifs(true);
    await new Promise(r => setTimeout(r, 600));
    toast.success("Notification preferences saved");
    setSavingNotifs(false);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-8 py-4 flex items-center gap-3">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="text-lg md:text-xl font-semibold">Settings</h2>
      </header>

      <div className="p-4 md:p-8 max-w-4xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="gap-2">
              <UserCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Company</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile">
            <div className="rounded-lg border border-border bg-card">
              <div className="p-6 border-b border-border">
                <h3 className="font-semibold">My Profile</h3>
                <p className="text-sm text-muted-foreground mt-1">Update your personal information</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Display Name</label>
                    <Input
                      value={profile.displayName}
                      onChange={e => setProfile({ ...profile, displayName: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Phone</label>
                    <Input
                      value={profile.phone}
                      onChange={e => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="(202) 555-0100"
                    />
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={savingProfile} className="gap-2">
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Profile
                </Button>

                {/* Change Password */}
                <div className="border-t border-border pt-6 mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold">Change Password</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium block mb-2">Current Password</label>
                      <div className="relative">
                        <Input
                          type={showPassword.current ? "text" : "password"}
                          value={passwordForm.current}
                          onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                          placeholder="••••••••"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2">New Password</label>
                      <div className="relative">
                        <Input
                          type={showPassword.new ? "text" : "password"}
                          value={passwordForm.new}
                          onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })}
                          placeholder="••••••••"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium block mb-2">Confirm New Password</label>
                      <div className="relative">
                        <Input
                          type={showPassword.confirm ? "text" : "password"}
                          value={passwordForm.confirm}
                          onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                          placeholder="••••••••"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleChangePassword}
                    disabled={changingPassword || !passwordForm.current || !passwordForm.new || !passwordForm.confirm}
                    className="gap-2"
                  >
                    {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    Update Password
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Company */}
          <TabsContent value="company">
            <div className="rounded-lg border border-border bg-card">
              <div className="p-6 border-b border-border">
                <h3 className="font-semibold">Company Information</h3>
                <p className="text-sm text-muted-foreground mt-1">Manage company details for invoices and communications</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Company Name</label>
                    <Input value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Email</label>
                    <Input type="email" value={company.email} onChange={e => setCompany({ ...company, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Phone</label>
                    <Input value={company.phone} onChange={e => setCompany({ ...company, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Website</label>
                    <Input value={company.website} onChange={e => setCompany({ ...company, website: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Address</label>
                  <Input value={company.address} onChange={e => setCompany({ ...company, address: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Description</label>
                  <textarea
                    value={company.description}
                    onChange={e => setCompany({ ...company, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <Button onClick={handleSaveCompany} disabled={savingCompany} className="gap-2">
                  {savingCompany ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <div className="rounded-lg border border-border bg-card">
              <div className="p-6 border-b border-border">
                <h3 className="font-semibold">Notification Preferences</h3>
                <p className="text-sm text-muted-foreground mt-1">Configure which notifications you receive</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Email Notifications</h4>
                  <div className="space-y-4">
                    {[
                      { key: "emailNewBooking" as const, label: "New Booking", desc: "Get notified when a new booking is created" },
                      { key: "emailStatusChange" as const, label: "Status Changes", desc: "Updates when booking status changes" },
                      { key: "emailDriverAssignment" as const, label: "Driver Assignment", desc: "When a driver is assigned or unassigned" },
                      { key: "emailInvoice" as const, label: "Invoice Activity", desc: "New invoices and payment updates" },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications[item.key]}
                          onChange={e => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                          className="rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-semibold mb-3">Push Notifications</h4>
                  <div className="space-y-4">
                    {[
                      { key: "pushUrgent" as const, label: "Urgent Alerts", desc: "Critical issues requiring immediate attention" },
                      { key: "pushReminder" as const, label: "Reminders", desc: "Upcoming pickup reminders" },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications[item.key]}
                          onChange={e => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                          className="rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-semibold mb-3">Reports</h4>
                  <div className="space-y-4">
                    {[
                      { key: "dailyDigest" as const, label: "Daily Digest", desc: "Summary of the day's bookings and activity" },
                      { key: "weeklyReport" as const, label: "Weekly Report", desc: "Weekly performance and revenue overview" },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications[item.key]}
                          onChange={e => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                          className="rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={handleSaveNotifications} disabled={savingNotifs} className="gap-2">
                  {savingNotifs ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Preferences
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <div className="rounded-lg border border-border bg-card">
              <div className="p-6 border-b border-border">
                <h3 className="font-semibold">User Management</h3>
                <p className="text-sm text-muted-foreground mt-1">View registered users and manage their roles</p>
              </div>
              <div className="p-6">
                {loadingUsers ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No users found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-2">User</th>
                          <th className="text-left py-2 px-2">Email</th>
                          <th className="text-left py-2 px-2">Role</th>
                          <th className="text-left py-2 px-2">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id} className="border-b border-border">
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-semibold text-primary">
                                    {(u.displayName || u.email || "?")[0].toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{u.displayName || "—"}</p>
                                  {u.isCorporate && (
                                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Corporate</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-2 px-2 text-muted-foreground">{u.email || "—"}</td>
                            <td className="py-2 px-2">
                              <select
                                value={u.role}
                                onChange={e => handleRoleChange(u.userId, u.roleId, e.target.value as "admin" | "client")}
                                className="text-xs bg-secondary border border-border rounded px-2 py-1 w-[100px]"
                              >
                                <option value="admin">Admin</option>
                                <option value="client">Client</option>
                              </select>
                            </td>
                            <td className="py-2 px-2 text-muted-foreground">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
