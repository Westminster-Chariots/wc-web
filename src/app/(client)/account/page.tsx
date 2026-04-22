"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { bookingService } from "@/lib/services";
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
  const { user, logout } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsPage, setBookingsPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
    fetchProfile();
    fetchBookingsPage(0);
  }, [user, router]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("https://wc-backend-ayx0.onrender.com/api/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        setProfile({ email: user?.email, displayName: user?.fullName });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile({ email: user?.email, displayName: user?.fullName });
    }
  };

  const fetchBookingsPage = async (page: number) => {
    setLoading(true);
    try {
      const data = await bookingService.getAll();
      const paginatedBookings = Array.isArray(data)
        ? data.slice(page * pageSize, (page + 1) * pageSize)
        : [];
      setBookings(paginatedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      notify.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (data: Omit<UserProfile, 'email' | 'clientCode'>) => {
    if (!user || !profile) return;
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("https://wc-backend-ayx0.onrender.com/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to save profile");
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
      notify.success("Profile updated successfully");
    } catch (error: any) {
      notify.error(error.message || "Failed to update profile");
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
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, pickupDate: date, pickupTime: time }
            : b
        )
      );
      notify.success("Booking rescheduled successfully");
    } catch (error: any) {
      notify.error(error.message || "Failed to reschedule");
      throw error;
    }
  };

  const handleCancelBooking = async (bookingId: string, reservationNumber: string) => {
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
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
      );
      notify.success("Reservation cancelled");
    } catch (error: any) {
      notify.error(error.message || "Failed to cancel booking");
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
    } catch (error: any) {
      notify.error(error.message || "Failed to change password");
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

      const response = await fetch("https://wc-backend-ayx0.onrender.com/api/v1/uploads", {
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
    } catch (error: any) {
      notify.error(error.message || "Failed to upload profile picture");
      throw error;
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  const handlePageChange = (page: number) => {
    setBookingsPage(page);
    fetchBookingsPage(page);
  };

  if (!user) return null;

  const displayName = profile?.displayName || user.fullName || user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-background">
      <AccountHeader onSignOut={handleSignOut} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <ProfileHeader
          displayName={displayName}
          email={user.email || ""}
          clientCode={profile?.clientCode}
          avatarUrl={profile?.avatarUrl}
          onAvatarUpload={handleAvatarUpload}
        />

        <Tabs defaultValue="rides" className="space-y-6 mt-8">
          <TabsList className="glass-subtle p-1 h-auto flex-wrap">
            <TabsTrigger value="rides" className="gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Car className="h-4 w-4" /> My Rides
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <FileText className="h-4 w-4" /> Invoices
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Settings className="h-4 w-4" /> Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rides">
            <BookingsList
              bookings={bookings}
              loading={loading}
              page={bookingsPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onReschedule={handleReschedule}
              onCancel={handleCancelBooking}
            />
          </TabsContent>

          <TabsContent value="invoices">
            <div className="rounded-xl glass p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No invoices yet</p>
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
      </main>
    </div>
  );
}
