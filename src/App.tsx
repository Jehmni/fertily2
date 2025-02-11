
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

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Session timeout handling (30 minutes)
    const checkSession = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Get last activity from session metadata or user's last sign in
        const lastActivity = new Date(session.user.last_sign_in_at).getTime();
        const now = new Date().getTime();
        const inactiveTime = now - lastActivity;
        
        // If inactive for more than 30 minutes, sign out
        if (inactiveTime > 30 * 60 * 1000) {
          await supabase.auth.signOut();
          setSession(null);
        }
      }
    }, 60000); // Check every minute

    return () => {
      subscription.unsubscribe();
      clearInterval(checkSession);
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
