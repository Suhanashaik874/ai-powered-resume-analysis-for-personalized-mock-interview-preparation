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
import Profile from "./pages/Profile";
import Resume from "./pages/Resume";
import InterviewSelect from "./pages/InterviewSelect";
import CodingInterview from "./pages/CodingInterview";
import HRInterview from "./pages/HRInterview";
import AptitudeInterview from "./pages/AptitudeInterview";
import CombinedInterview from "./pages/CombinedInterview";
import InterviewResults from "./pages/InterviewResults";
import AllInterviews from "./pages/AllInterviews";
import ResetPassword from "./pages/ResetPassword";
import PreparationCourse from "./pages/PreparationCourse";
import Preparation from "./pages/Preparation";
import SkillRevision from "./pages/SkillRevision";
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
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/resume" element={<ProtectedRoute><Resume /></ProtectedRoute>} />
            <Route path="/interview/select" element={<ProtectedRoute><InterviewSelect /></ProtectedRoute>} />
            <Route path="/interview/:id" element={<ProtectedRoute><CodingInterview /></ProtectedRoute>} />
            <Route path="/interview/hr/:id" element={<ProtectedRoute><HRInterview /></ProtectedRoute>} />
            <Route path="/interview/aptitude/:id" element={<ProtectedRoute><AptitudeInterview /></ProtectedRoute>} />
            <Route path="/interview/combined/:id" element={<ProtectedRoute><CombinedInterview /></ProtectedRoute>} />
            <Route path="/interview/results/:id" element={<ProtectedRoute><InterviewResults /></ProtectedRoute>} />
            <Route path="/interviews" element={<ProtectedRoute><AllInterviews /></ProtectedRoute>} />
            <Route path="/preparation" element={<ProtectedRoute><Preparation /></ProtectedRoute>} />
            <Route path="/preparation/skill-revision" element={<ProtectedRoute><SkillRevision /></ProtectedRoute>} />
            <Route path="/preparation/:categoryId" element={<ProtectedRoute><PreparationCourse /></ProtectedRoute>} />
            <Route path="/preparation/:categoryId/:topicId" element={<ProtectedRoute><PreparationCourse /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
