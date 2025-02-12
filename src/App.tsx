
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { ResourceDetail } from "@/components/ResourceDetail";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set loading to true when effect starts
    setLoading(true);
    
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Current session:", currentSession);
        setSession(currentSession);
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        // Ensure loading is set to false after auth check completes
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", session);
      setSession(session);
      // Don't set loading to false here as we don't want to show loading on every auth change
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show loading state with a better visual indicator
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <LoadingSkeleton className="h-12 w-full mb-4" />
          <LoadingSkeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  console.log("Rendering main app with session:", !!session);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background">
          <ErrorBoundary>
            <TooltipProvider>
              <Routes>
                <Route
                  path="/"
                  element={
                    session ? (
                      <Index />
                    ) : (
                      <Navigate to="/auth" replace />
                    )
                  }
                />
                <Route
                  path="/auth"
                  element={
                    !session ? (
                      <Auth />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </ErrorBoundary>
        </div>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
