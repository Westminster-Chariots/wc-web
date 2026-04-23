"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authService } from "@/lib/services";
import type { User } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isAuthenticated: false,
  login: async () => {},
  loginWithGoogle: async () => {},
  register: async () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.me();
      setUser(userData);
    } catch (error) {
      // Silently fail if user is not authenticated - they may be on login/signup page
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    
    // Refresh user data every 5 minutes
    const interval = setInterval(refreshUser, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      await authService.login(email, password);
      await refreshUser();
      toast.success("Welcome back!");
    } catch (error: any) {
      const message = error.response?.data?.message || "Invalid credentials";
      toast.error(message);
      throw error;
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    try {
      await authService.loginWithGoogle(idToken);
      await refreshUser();
      toast.success("Welcome back!");
    } catch (error: any) {
      const message = error.response?.data?.error || "Google sign-in failed";
      toast.error(message);
      throw error;
    }
  };

  const register = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      await authService.register(email, password, fullName, phone);
      toast.success("Account created! Please check your email to verify.");
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email);
      toast.success("Password reset link sent to your email");
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to send reset link";
      toast.error(message);
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      await authService.resetPassword(token, password);
      toast.success("Password reset successful! Please login.");
      router.push("/auth");
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to reset password";
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      // Still clear user on client side even if API call fails
      setUser(null);
      router.push("/");
    }
  };

  const isAdmin = user?.role === "admin";
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isAuthenticated,
        login,
        loginWithGoogle,
        register,
        forgotPassword,
        resetPassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
