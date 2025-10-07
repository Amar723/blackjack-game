"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogIn, Shield, Brain, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkUserAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkUserAndProfile();
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const checkUserAndProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setUser(null);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle(); // <- avoids throwing when not found

      if (!profile) {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          chips: 500,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        if (insertError)
          console.error("Error creating profile:", insertError.message);
      }

      setUser(user);
      router.push("/game");
    } catch (e) {
      console.error("Error checking user and profile:", e);
      setUser(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Strategy Assistant",
      description: "Get real-time blackjack advice from Gemini AI",
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Track Your Progress",
      description: "Detailed statistics and game history",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Your data is protected with Google authentication",
    },
  ];

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Redirecting to game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-gray-700"
                >
                  ← Back to Home
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-white border-gray-300">
                New User? Get 500 free chips!
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Sign In Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-gray-800 border-gray-700 p-8">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🃏</div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome to Blackjack
                </h1>
                <p className="text-gray-300">
                  Sign in to start playing and get 500 free chips!
                </p>
              </div>

              <div className="space-y-6">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-4 text-lg"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <LogIn className="w-5 h-5 mr-3" />
                      Sign in with Google
                    </div>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    By signing in, you agree to our terms of service
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Right Side - Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Why Sign In?
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Get the full blackjack experience with AI assistance, detailed
                statistics, and secure gameplay.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="bg-gray-800 border-gray-700 p-6 hover:bg-gray-700 transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="text-yellow-400 mt-1">{feature.icon}</div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-300">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                What You Get
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• 500 free chips to start playing</li>
                <li>• AI-powered strategy suggestions</li>
                <li>• Complete game history and statistics</li>
                <li>• Secure authentication with Google</li>
                <li>• Mobile-responsive design</li>
                <li>• Smooth card animations</li>
              </ul>
            </Card>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-xl font-bold text-white mb-2">
              Ready to Play?
            </h3>
            <p className="text-gray-300 mb-4">
              Sign in now and start your blackjack journey!
            </p>
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3"
            >
              {isLoading ? "Signing in..." : "Get Started"}
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
