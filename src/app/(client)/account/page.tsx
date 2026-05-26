"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { authService, bookingService } from "@/lib/services";
import { notify } from "@/lib/notify";
import type { Booking } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, FileText, Settings } from "lucide-react";
import AccountHeader from "@/components/account/AccountHeader";
import ProfileHeader from "@/components/account/ProfileHeader";
import BookingsList from "@/components/account/BookingsList";
import ProfileSettings from "@/components/account/ProfileSettings";

interface UserProfile {
  id?: string;
  email?: string;
  displayName?: string;
  phone?: string;
  isCorporate?: boolean;
  corporateName?: string;
  clientCode?: string;
  avatarUrl?: string;
}

export default function ClientAccountPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsPage, setBookingsPage] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    // Wait for auth to finish initializing before redirecting
    if (authLoading) return;

    if (!user) {
      router.push("/auth");
      return;
    }

    fetchProfile();
    fetchBookings();
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProfile = async () => {
    try {
      const currentUser = await authService.me();
      const profileData = currentUser.profile;
      if (profileData) {
        setProfile({
          email: profileData.email ?? user?.email,
          displayName: profileData.displayName ?? currentUser.fullName ?? user?.fullName ?? user?.email?.split("@")[0] ?? "",
          phone: profileData.phone ?? "",
          isCorporate: profileData.isCorporate ?? false,
          corporateName: profileData.corporateName ?? "",
          clientCode: profileData.clientCode ?? undefined,
          avatarUrl: profileData.avatarUrl ?? undefined,
        });
      } else {
        setProfile({
          email: user?.email,
          displayName: currentUser.fullName || user?.fullName || user?.email?.split("@")[0] || "",
          phone: "",
          isCorporate: false,
          corporateName: "",
          clientCode: undefined,
          avatarUrl: undefined,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile({
        email: user?.email,
        displayName: user?.fullName || user?.email?.split("@")[0] || "",
        phone: "",
        isCorporate: false,
        corporateName: "",
        clientCode: undefined,
        avatarUrl: undefined,
      });
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await bookingService.getMyBookings();
      if (Array.isArray(data)) {
        setAllBookings(data);
      } else {
        setAllBookings([]);
      }
    } catch (error: unknown) {
      console.error("Error fetching bookings:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load bookings";
      setFetchError("Unable to load ride history right now. Please try again later.");
      notify.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (data: Omit<UserProfile, 'email' | 'clientCode' | 'avatarUrl'>) => {
    if (!user || !profile) return;
    try {
      await authService.updateProfile({
        displayName: data.displayName,
        phone: data.phone,
      });
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
      notify.success("Profile updated successfully");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      notify.error(message);
      throw error;
    }
  };

  const handleReschedule = async (bookingId: string, date: string, time: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `https://wc-backend-ayx0.onrender.com/api/bookings/${bookingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ pickupDate: date, pickupTime: time })
        }
      );
      if (!response.ok) throw new Error("Failed to reschedule");
      setAllBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, pickupDate: date, pickupTime: time }
            : b
        )
      );
      notify.success("Booking rescheduled successfully");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to reschedule";
      notify.error(message);
      throw error;
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`https://wc-backend-ayx0.onrender.com/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "cancelled" })
      });
      if (!response.ok) throw new Error("Failed to cancel booking");
      setAllBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
      );
      notify.success("Reservation cancelled");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to cancel booking";
      notify.error(message);
      throw error;
    }
  };

  const handleChangePassword = async (current: string, newPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      notify.error("Password must be at least 6 characters.");
      throw new Error("Invalid password");
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("https://wc-backend-ayx0.onrender.com/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: current,
          newPassword: newPassword
        })
      });
      if (!response.ok) throw new Error("Failed to change password");
      notify.success("Password updated successfully");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to change password";
      notify.error(message);
      throw error;
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      notify.error("Please upload an image file.");
      throw new Error("Invalid file type");
    }
    if (file.size > 5 * 1024 * 1024) {
      notify.error("Please upload an image under 5MB.");
      throw new Error("File too large");
    }

    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://wc-backend-ayx0.onrender.com/api/v1"}/uploads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error("Failed to upload avatar");
      
      const data = await response.json();
      setProfile((prev) => (prev ? { ...prev, avatarUrl: data.url } : null));
      notify.success("Profile picture updated successfully");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to upload profile picture";
      notify.error(message);
      throw error;
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  const handlePageChange = (page: number) => {
    setBookingsPage(page);
  };

  if (!user) return null;

  const displayName = profile?.displayName || user.fullName || user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AccountHeader onSignOut={handleSignOut} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <ProfileHeader
          displayName={displayName}
          email={user.email || ""}
          clientCode={profile?.clientCode}
          avatarUrl={profile?.avatarUrl}
          onAvatarUpload={handleAvatarUpload}
        />

        <div className="grid gap-4 xl:grid-cols-[1.5fr_0.85fr] items-start mt-8">
          <div className="space-y-6">
            <div className="rounded-4xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Your account summary</p>
                  <h2 className="mt-2 text-xl font-display font-semibold text-slate-900">Your dashboard</h2>
                </div>
                <p className="text-sm text-slate-600 max-w-xl">Manage upcoming rides, invoices, and account preferences with clean, consistent brand styling.</p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-slate-50 p-4 shadow-sm ring-1 ring-slate-200">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Active bookings</p>
                  <p className="mt-3 text-xl font-semibold text-slate-900">{allBookings.filter((b) => b.status !== "cancelled" && b.status !== "done").length}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 shadow-sm ring-1 ring-slate-200">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Total rides</p>
                  <p className="mt-3 text-xl font-semibold text-slate-900">{allBookings.length}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 shadow-sm ring-1 ring-slate-200">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Account tier</p>
                  <p className="mt-3 text-xl font-semibold text-slate-900">Executive</p>
                </div>
              </div>
            </div>

            <div className="rounded-4xl bg-white shadow-sm ring-1 ring-slate-200 p-5">
              <Tabs defaultValue="rides" className="space-y-6">
                <TabsList className="grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-lg bg-transparent border-b border-slate-200 p-1">
                  <TabsTrigger value="rides" className="flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent text-sm font-semibold text-slate-600 py-3 data-[state=active]:border-sky-600 data-[state=active]:text-slate-900 data-[state=active]:bg-transparent">
                    <Car className="h-4 w-4" /> Rides
                  </TabsTrigger>
                  <TabsTrigger value="invoices" className="flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent text-sm font-semibold text-slate-600 py-3 data-[state=active]:border-sky-600 data-[state=active]:text-slate-900 data-[state=active]:bg-transparent">
                    <FileText className="h-4 w-4" /> Invoices
                  </TabsTrigger>
                  <TabsTrigger value="profile" className="flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent text-sm font-semibold text-slate-600 py-3 data-[state=active]:border-sky-600 data-[state=active]:text-slate-900 data-[state=active]:bg-transparent">
                    <Settings className="h-4 w-4" /> Profile
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="rides">
                    {fetchError ? (
                      <div className="rounded-4xl bg-white shadow-sm ring-1 ring-slate-200 p-8 text-center">
                        <p className="text-sm text-destructive font-semibold mb-3">{fetchError}</p>
                        <p className="text-sm text-slate-600 mb-6">We couldn&apos;t load your ride history due to a server problem.</p>
                        <button
                          onClick={fetchBookings}
                          className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
                        >
                          Retry
                        </button>
                      </div>
                    ) : (
                      <BookingsList
                        bookings={allBookings}
                        loading={loading}
                        page={bookingsPage}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        onReschedule={handleReschedule}
                        onCancel={handleCancelBooking}
                      />
                    )}
                  </TabsContent>

                <TabsContent value="invoices">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Invoices coming soon</h3>
                    <p className="text-sm text-slate-400">Your billing history will appear here after your first completed ride.</p>
                  </div>
                </TabsContent>

                <TabsContent value="profile">
                  {profile && (
                    <ProfileSettings
                      profile={{
                        email: profile.email || user.email || "",
                        displayName: profile.displayName || "",
                        phone: profile.phone || "",
                        isCorporate: profile.isCorporate || false,
                        corporateName: profile.corporateName || "",
                        clientCode: profile.clientCode,
                      }}
                      onSave={handleSaveProfile}
                      onChangePassword={handleChangePassword}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-4xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
              <h3 className="text-sm uppercase tracking-[0.3em] text-slate-500">Quick actions</h3>
              <div className="mt-5 space-y-3">
                <div className="rounded-3xl bg-slate-50 p-4 shadow-sm ring-1 ring-slate-200">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Support</p>
                  <p className="mt-2 text-sm text-slate-700">Need help with your ride or account? Contact our concierge team anytime.</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 shadow-sm ring-1 ring-slate-200">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Payment method</p>
                  <p className="mt-2 text-sm text-slate-700">Secure card vault and priority invoicing for corporate clients.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
