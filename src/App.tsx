import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Connect from "./pages/Connect";
import Pulse from "./pages/Pulse";
import AnonySpace from "./pages/AnonySpace";
import ClubVerse from "./pages/ClubVerse";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import StudyRoom from "./pages/StudyRoom";
import Alumni from "./pages/Alumni";
import Discover from "./pages/Discover";
import Events from "./pages/Events";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import { useAuth } from "./hooks/useAuth";
import { getRandomQuote } from "./utils/quotes";
import { AuthProvider } from "./components/AuthProvider";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, hasProfile } = useAuth();
  const location = useLocation();
  const [quote] = useState(() => getRandomQuote());

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background p-6 text-center space-y-8 animate-fade-in">
        <div className="relative">
          <div className="h-24 w-24 rounded-3xl bg-white flex items-center justify-center shadow-2xl overflow-hidden animate-pulse">
            <img src="/favicon.ico" alt="Bazinga" className="h-16 w-16 object-contain" />
          </div>
          <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary animate-ping" />
        </div>

        <div className="max-w-md space-y-4">
          <p className="text-2xl font-handwriting tracking-tight text-foreground leading-tight italic">
            "{quote}"
          </p>
          <div className="flex items-center justify-center gap-2 text-muted-foreground font-scribble">
            <div className="h-px w-8 bg-muted-foreground/30" />
            <span>Vibing...</span>
            <div className="h-px w-8 bg-muted-foreground/30" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (hasProfile === false && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (hasProfile === true && location.pathname === '/onboarding') {
    return <Navigate to="/" replace />;
  }

  // If we are logged in but profile status is unknown (null), 
  // we should show loading instead of the main page to avoid flashing.
  if (hasProfile === null) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background p-6 text-center space-y-8 animate-fade-in">
        <div className="relative">
          <div className="h-24 w-24 rounded-3xl bg-white flex items-center justify-center shadow-2xl overflow-hidden animate-pulse">
            <img src="/favicon.ico" alt="Bazinga" className="h-16 w-16 object-contain" />
          </div>
          <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary animate-ping" />
        </div>

        <div className="max-w-md space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground font-scribble">
            <div className="h-px w-8 bg-muted-foreground/30" />
            <span>Verifying session...</span>
            <div className="h-px w-8 bg-muted-foreground/30" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="bazinga-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* ... existing routes ... */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout><Index /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/connect" element={
                <ProtectedRoute>
                  <Layout><Connect /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/pulse" element={
                <ProtectedRoute>
                  <Layout><Pulse /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/study-room" element={
                <ProtectedRoute>
                  <Layout><StudyRoom /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/anonyspace" element={
                <ProtectedRoute>
                  <Layout><AnonySpace /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/clubverse" element={
                <ProtectedRoute>
                  <Layout><ClubVerse /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Layout><Messages /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout><Profile /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/alumni" element={
                <ProtectedRoute>
                  <Layout><Alumni /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/discover" element={
                <ProtectedRoute>
                  <Layout><Discover /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/dating" element={<Navigate to="/discover" replace />} />
              <Route path="/events" element={
                <ProtectedRoute>
                  <Layout><Events /></Layout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
