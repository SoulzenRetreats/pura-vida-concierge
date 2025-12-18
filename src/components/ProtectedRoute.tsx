import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

type AppRole = "admin" | "staff";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps): React.JSX.Element {
  const { user, userRole, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login/auth" state={{ from: location }} replace />;
  }

  if (!userRole) {
    return <Navigate to="/login/auth" state={{ error: "noRole" }} replace />;
  }

  // Check if user has one of the allowed roles
  // Admin always has access
  const hasAccess = userRole === "admin" || allowedRoles.includes(userRole);

  if (!hasAccess) {
    return <Navigate to="/login/auth" state={{ error: "unauthorized" }} replace />;
  }

  return <>{children}</>;
}
