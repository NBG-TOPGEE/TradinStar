import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TradeProvider } from "@/contexts/TradeContext";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import LogTrade from "@/pages/LogTrade";
import Journal from "@/pages/Journal";
import Performance from "@/pages/Performance";
import RiskCalculator from "@/pages/RiskCalculator";
import AICoach from "@/pages/AICoach";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TradeProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/log" element={<LogTrade />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/risk" element={<RiskCalculator />} />
              <Route path="/coach" element={<AICoach />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TradeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
