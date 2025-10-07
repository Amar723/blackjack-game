"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();

    // Subscribe to auth changes so we update the button state immediately
    // when the user signs in or out in another tab or via other components.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    window.location.href = "/signin";
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // After signing out, redirect to /signin so protected pages won't
      // attempt unauthorized DB calls. router.replace avoids adding an
      // extra history entry.
      router.replace("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (isLoading) {
    return (
      <Button disabled variant="outline">
        Loading...
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4" />
          <span className="text-sm text-gray-600">{user.email}</span>
        </div>
        <Button onClick={handleSignOut} variant="outline" size="sm">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleSignIn} className="bg-blue-600 hover:bg-blue-700">
      <LogIn className="w-4 h-4 mr-2" />
      Sign In with Google
    </Button>
  );
}
