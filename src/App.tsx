import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import VoiceInterview from "./pages/VoiceInterview";
import Feedback from "./pages/Feedback";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Profile from "@/pages/Profile";
import Templates from "./pages/Templates";
import Reports from "./pages/Reports";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import LearningRoadmap from "./pages/LearningRoadmap";
import CommunicationFeedback from "./pages/CommunicationFeedback";
import TopicInterview from "./pages/TopicInterview";
import JobRecommendations from "./pages/JobRecommendations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/resume-analyzer" element={<ResumeAnalysis />} />
            <Route path="/interview/:id" element={<Interview />} />
            <Route path="/interview/:id/voice" element={<VoiceInterview />} />
            <Route path="/feedback/:id" element={<Feedback />} />
            <Route path="/roadmap/:id" element={<LearningRoadmap />} />
            <Route path="/communication-feedback/:id" element={<CommunicationFeedback />} />
            <Route path="/topic-interview" element={<TopicInterview />} />
            <Route path="/topic-interview/:id/voice" element={<VoiceInterview />} />
            <Route path="/topic-interview/:id/feedback" element={<Feedback />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/job-recommendations" element={<JobRecommendations />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
