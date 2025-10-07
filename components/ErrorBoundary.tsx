"use client";

import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center p-4">
          <Card className="bg-white bg-opacity-95 backdrop-blur-sm p-8 max-w-md w-full text-center">
            <div className="text-red-600 mb-4 flex justify-center">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We encountered an error while loading the game. Please try
              refreshing the page.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                className="w-full"
              >
                Go Home
              </Button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
