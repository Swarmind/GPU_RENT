import { Outlet } from "react-router";
import { AuthProvider } from "../contexts/auth-context";

export function AuthLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
