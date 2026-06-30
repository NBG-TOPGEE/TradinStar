import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TradeProvider } from "@/contexts/TradeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import LogTrade from "@/pages/LogTrade";
import Journal from "@/pages/Journal";
import Performance from "@/pages/Performance";
import RiskCalculator from "@/pages/RiskCalculator";
import AICoach from "@/pages/AICoach";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Admin from "@/pages/Admin";
import Onboarding from "@/pages/Onboarding";

const queryClient = new QueryClient();

// Redirect logged-in users without a completed trader profile to onboarding
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, traderProfile, profileLoading } = useAuth();

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // If trader_profiles table doesn't exist yet (null profile) or onboarding not done
  // → send to onboarding. But only for app routes, not /onboarding itself.
  if (traderProfile && !traderProfile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// Onboarding route — must be logged in, but not gate on profile completion
function OnboardingRoute() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return <Onboarding />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <TradeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding" element={<OnboardingRoute />} />
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/log" element={<LogTrade />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="/risk" element={<RiskCalculator />} />
                <Route path="/coach" element={<AICoach />} />
                <Route path="/settings" element={<Navigate to="/profile" replace />} />
                <Route path="/profile" element={<Profile />} />
                {import.meta.env.DEV && <Route path="/admin" element={<Admin />} />}
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TradeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
