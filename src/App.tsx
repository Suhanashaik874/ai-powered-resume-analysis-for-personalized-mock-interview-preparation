import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Resume from "./pages/Resume";
import InterviewSelect from "./pages/InterviewSelect";
import CodingInterview from "./pages/CodingInterview";
import HRInterview from "./pages/HRInterview";
import AptitudeInterview from "./pages/AptitudeInterview";
import InterviewResults from "./pages/InterviewResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/resume" element={<ProtectedRoute><Resume /></ProtectedRoute>} />
            <Route path="/interview/select" element={<ProtectedRoute><InterviewSelect /></ProtectedRoute>} />
            <Route path="/interview/:id" element={<ProtectedRoute><CodingInterview /></ProtectedRoute>} />
            <Route path="/interview/hr/:id" element={<ProtectedRoute><HRInterview /></ProtectedRoute>} />
            <Route path="/interview/aptitude/:id" element={<ProtectedRoute><AptitudeInterview /></ProtectedRoute>} />
            <Route path="/interview/results/:id" element={<ProtectedRoute><InterviewResults /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
