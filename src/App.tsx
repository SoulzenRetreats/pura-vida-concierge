import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TripPlanProvider } from "@/contexts/TripPlanContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import Experiences from "./pages/Experiences";

import Booking from "./pages/Booking";
import Success from "./pages/Success";
import NotFound from "./pages/NotFound";
import AdminAuth from "./pages/admin/Auth";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSettings from "./pages/admin/Settings";

import AdminBookings from "./pages/admin/Bookings";
import AdminVendors from "./pages/admin/Vendors";
import AdminServices from "./pages/admin/Services";
import AdminProperties from "./pages/admin/Properties";
import AdminUsers from "./pages/admin/Users";
import AdminCategories from "./pages/admin/Categories";
import SlugRedirect from "./pages/SlugRedirect";

const queryClient = new QueryClient();

function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <TripPlanProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/properties" element={<Properties />} />

              {/* Legacy redirect */}
              <Route path="/experiences" element={<SlugRedirect />} />

              {/* Slug-based storefront routes */}
              <Route path="/:slug/experiences" element={<Experiences />} />
              <Route path="/:slug/booking" element={<Booking />} />
              <Route path="/:slug/success" element={<Success />} />


              {/* Auth route */}
              <Route path="/login/auth" element={<AdminAuth />} />

              {/* Admin protected routes with layout */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="properties" element={<AdminProperties />} />
                <Route path="vendors" element={<AdminVendors />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="categories" element={<AdminCategories />} />
                
                <Route path="users" element={<AdminUsers />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Slug-based root storefront — must be LAST before catch-all */}
              <Route path="/:slug" element={<Home />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </TripPlanProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
