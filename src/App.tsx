import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import Experiences from "./pages/Experiences";
import TripTypes from "./pages/TripTypes";
import Booking from "./pages/Booking";
import NotFound from "./pages/NotFound";
import AdminAuth from "./pages/admin/Auth";
import AdminDashboard from "./pages/admin/Dashboard";
import { ConciergeLayout } from "./components/concierge/ConciergeLayout";
import ConciergeDashboard from "./pages/concierge/Dashboard";
import ConciergeBookings from "./pages/concierge/Bookings";

const queryClient = new QueryClient();

function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/experiences" element={<Experiences />} />
              <Route path="/trip-types" element={<TripTypes />} />
              <Route path="/booking" element={<Booking />} />

              {/* Auth route */}
              <Route path="/login/auth" element={<AdminAuth />} />

              {/* Admin protected routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Concierge protected routes (staff + admin can access) */}
              <Route
                path="/concierge"
                element={
                  <ProtectedRoute allowedRoles={["admin", "staff"]}>
                    <ConciergeLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/concierge/dashboard" replace />} />
                <Route path="dashboard" element={<ConciergeDashboard />} />
                <Route path="bookings" element={<ConciergeBookings />} />
                <Route path="bookings/:id" element={<div>Booking Detail (Coming Soon)</div>} />
                <Route path="vendors" element={<div>Vendors (Coming Soon)</div>} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
