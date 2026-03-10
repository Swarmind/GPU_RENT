import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Web3Provider } from "./hooks/useWeb3";
import { AuthProvider } from "./contexts/auth-context";

export default function App() {
  return (
    <Web3Provider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Web3Provider>
  );
}