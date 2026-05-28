"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { authService, bookingService, documentService, type Document } from "@/lib/services";
import { notify } from "@/lib/notify";
import type { Booking } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, FileText, Settings, Download, Eye, Calendar } from "lucide-react";
import AccountHeader from "@/components/account/AccountHeader";
import ProfileHeader from "@/components/account/ProfileHeader";
import BookingsListProfessional from "@/components/account/BookingsListProfessional";
import ProfileSettings from "@/components/account/ProfileSettings";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

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
  const [myDocuments, setMyDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
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
    fetchDocuments();
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDocuments = async () => {
    setDocumentsLoading(true);
    try {
      const data = await documentService.getMyDocuments();
      setMyDocuments(data.filter(d => d.documentType === "client_invoice" || d.documentType === "trip_confirmation"));
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setDocumentsLoading(false);
    }
  };

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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <ProfileHeader
            displayName={displayName}
            email={user.email || ""}
            clientCode={profile?.clientCode}
            avatarUrl={profile?.avatarUrl}
            onAvatarUpload={handleAvatarUpload}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Dashboard Stats */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Account Overview</h2>
                <p className="mt-1 text-sm text-slate-600">Manage your rides and account preferences</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-900 mb-2">Active Bookings</p>
                  <p className="text-2xl font-semibold text-slate-900">{allBookings.filter((b) => b.status !== "cancelled" && b.status !== "done").length}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-900 mb-2">Total Rides</p>
                  <p className="text-2xl font-semibold text-slate-900">{allBookings.length}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-900 mb-2">Account Tier</p>
                  <p className="text-2xl font-semibold text-slate-900">Executive</p>
                </div>
              </div>
            </div>

            {/* Main Content Tabs */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <Tabs defaultValue="rides" className="space-y-6">
                <TabsList className="grid grid-cols-3 h-12 gap-1 rounded-lg bg-slate-100 p-1">
                  <TabsTrigger value="rides" className="flex items-center justify-center gap-2 rounded-md text-sm font-medium text-slate-700 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                    <Car className="h-4 w-4" /> Rides
                  </TabsTrigger>
                  <TabsTrigger value="invoices" className="flex items-center justify-center gap-2 rounded-md text-sm font-medium text-slate-700 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                    <FileText className="h-4 w-4" /> Invoices
                  </TabsTrigger>
                  <TabsTrigger value="profile" className="flex items-center justify-center gap-2 rounded-md text-sm font-medium text-slate-700 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                    <Settings className="h-4 w-4" /> Profile
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="rides">
                    {fetchError ? (
                      <div className="rounded-2xl bg-white shadow-sm p-8 text-center">
                        <p className="text-sm text-red-600 font-semibold mb-3">{fetchError}</p>
                        <p className="text-sm text-slate-600 mb-6">We couldn&apos;t load your ride history due to a server problem.</p>
                        <button
                          onClick={fetchBookings}
                          className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-700 transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    ) : (
                      <BookingsListProfessional
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
                  {documentsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                    </div>
                  ) : myDocuments.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 p-12 text-center">
                      <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No documents yet</h3>
                      <p className="text-sm text-slate-600">Your invoices and trip confirmations will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myDocuments.map((doc) => (
                        <div key={doc.id} className="rounded-xl bg-slate-50 p-4 hover:bg-slate-100 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  doc.documentType === "client_invoice" 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-purple-100 text-purple-800"
                                }`}>
                                  {doc.documentType === "client_invoice" ? "Invoice" : "Trip Confirmation"}
                                </span>
                                <span className="font-mono text-sm font-semibold text-slate-900">
                                  #{doc.documentNumber}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                <Calendar className="h-3.5 w-3.5" />
                                {format(new Date(doc.createdAt), "MMM d, yyyy")}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const { documentData } = doc;
                                    if (doc.documentType === "client_invoice") {
                                      const { generateInvoicePDF } = await import("@/lib/generateInvoicePDF");
                                      const pdfDoc = await generateInvoicePDF(documentData.invoiceData, "/assets/wc-logo-full.png", "light");
                                      const blob = pdfDoc.output("blob");
                                      const url = URL.createObjectURL(blob);
                                      window.open(url, "_blank");
                                    } else {
                                      const { generateConfirmationPDF } = await import("@/lib/generateConfirmationPDF");
                                      const confirmationData = {
                                        confirmationNumber: documentData.invoiceData.invoiceNumber,
                                        clientName: documentData.invoiceData.clientName,
                                        clientAddress: documentData.invoiceData.clientAddress,
                                        clientPhone: documentData.invoiceData.clientPhone,
                                        clientEmail: documentData.invoiceData.clientEmail,
                                        driverName: documentData.driverInfo?.driverName,
                                        vehicleType: documentData.driverInfo?.vehicleType,
                                        vehicleTag: documentData.driverInfo?.vehicleTag,
                                        items: documentData.invoiceData.items,
                                      };
                                      const pdfDoc = await generateConfirmationPDF(confirmationData, "/assets/wc-logo-full.png", "light");
                                      const blob = pdfDoc.output("blob");
                                      const url = URL.createObjectURL(blob);
                                      window.open(url, "_blank");
                                    }
                                  } catch (error) {
                                    notify.error("Failed to preview document");
                                  }
                                }}
                                className="gap-1.5"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const { documentData } = doc;
                                    if (doc.documentType === "client_invoice") {
                                      const { generateInvoicePDF } = await import("@/lib/generateInvoicePDF");
                                      const pdfDoc = await generateInvoicePDF(documentData.invoiceData, "/assets/wc-logo-full.png", "light");
                                      pdfDoc.save(`${doc.documentNumber}-Invoice.pdf`);
                                    } else {
                                      const { generateConfirmationPDF } = await import("@/lib/generateConfirmationPDF");
                                      const confirmationData = {
                                        confirmationNumber: documentData.invoiceData.invoiceNumber,
                                        clientName: documentData.invoiceData.clientName,
                                        clientAddress: documentData.invoiceData.clientAddress,
                                        clientPhone: documentData.invoiceData.clientPhone,
                                        clientEmail: documentData.invoiceData.clientEmail,
                                        driverName: documentData.driverInfo?.driverName,
                                        vehicleType: documentData.driverInfo?.vehicleType,
                                        vehicleTag: documentData.driverInfo?.vehicleTag,
                                        items: documentData.invoiceData.items,
                                      };
                                      const pdfDoc = await generateConfirmationPDF(confirmationData, "/assets/wc-logo-full.png", "light");
                                      pdfDoc.save(`${doc.documentNumber}-Confirmation.pdf`);
                                    }
                                    notify.success("Document downloaded");
                                  } catch (error) {
                                    notify.error("Failed to download document");
                                  }
                                }}
                                className="gap-1.5"
                              >
                                <Download className="h-3.5 w-3.5" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900 mb-2">Support</p>
                  <p className="text-sm text-slate-600">Need help with your ride or account? Contact our concierge team anytime.</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900 mb-2">Payment Method</p>
                  <p className="text-sm text-slate-600">Secure card vault and priority invoicing for corporate clients.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
