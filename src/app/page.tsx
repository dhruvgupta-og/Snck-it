"use client";

import { useAuth } from "@/context/AuthContext";
import Onboarding from "@/components/Onboarding";
import Home from "@/components/Home";

export default function EntryPage() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show Onboarding if not logged in or not finished profile
  if (!user || !profile?.isOnboarded) {
    return <Onboarding />;
  }

  return <Home />;
}
