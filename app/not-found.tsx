"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center p-4">
      <Card className="bg-white bg-opacity-95 backdrop-blur-sm p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🃏</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-600 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          Looks like you've dealt yourself a bad hand. This page doesn't exist
          in our deck.
        </p>
        <div className="space-y-3">
          <Link href="/">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </Card>
    </div>
  );
}
