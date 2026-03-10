import { Outlet } from "react-router";

// This component is no longer needed - AuthProvider is now in App.tsx
// Keeping this file temporarily to prevent cached import errors
export function AuthLayout() {
  return <Outlet />;
}
