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
import { Skeleton } from "@/components/ui/skeleton";
import { AdminAnalyticsDashboard } from "@/components/admin/AdminAnalyticsDashboard";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Layout } from "@/components/Layout";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { performanceMonitor } from "@/lib/performance";
import { ExpertProfile } from "@/components/consultation/ExpertProfile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 0,
      refetchOnWindowFocus: true,
      retry: false,
    },
  },
});

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    performanceMonitor.trackPageLoad('App');

    const initializeAuth = async () => {
      try {
        console.log("Starting auth initialization..."); // Debug log
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setLoading(false);
          return;
        }

        console.log("Session data received:", data.session); // Debug log
        setSession(data.session);
        setLoading(false);

      } catch (error) {
        console.error("Caught error during auth initialization:", error);
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session); // Debug log
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  console.log("Current state - loading:", loading, "session:", session); // Debug log

  if (loading) {
    console.log("Rendering loading state..."); // Debug log
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-accent via-background to-secondary/30 p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  console.log("Rendering main app content..."); // Debug log

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <Layout>
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
                <Route
                  path="/resources/:id"
                  element={
                    session ? (
                      <ResourceDetail />
                    ) : (
                      <Navigate to="/auth" replace />
                    )
                  }
                />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route
                  path="/admin"
                  element={
                    <AdminGuard>
                      <AdminAnalyticsDashboard />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/expert/profile"
                  element={
                    session ? (
                      <ExpertProfile />
                    ) : (
                      <Navigate to="/auth" replace />
                    )
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </BrowserRouter>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
