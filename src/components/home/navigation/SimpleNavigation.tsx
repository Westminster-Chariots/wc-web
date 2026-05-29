"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "./Navigation";

export default function SimpleNavigation() {
  const { user, isAdmin, logout } = useAuth();
  const { lang, cycleLang } = useLanguage();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  const displayName = user?.fullName || user?.email?.split("@")[0] || "User";

  return (
    <Navigation
      isOnLandingPage={false}
      isScrolled={true}
      isScrollingDown={false}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
      user={user}
      isAdmin={isAdmin}
      displayName={displayName}
      handleSignOut={handleSignOut}
      lang={lang}
      cycleLang={cycleLang}
    />
  );
}
