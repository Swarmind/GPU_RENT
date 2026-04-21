import { Outlet } from "react-router";
import { Web3Provider } from "../hooks/useWeb3";
import { AuthProvider, useAuth } from "../contexts/auth-context";
import { TemplateProvider } from "../contexts/template-context";

function Web3ProviderWithAuth({ children }: { children: React.ReactNode }) {
  const { updateWalletAddress, fetchWalletAddress } = useAuth();

  return (
    <Web3Provider onWalletUpdate={updateWalletAddress} fetchWalletAddress={fetchWalletAddress}>
      {children}
    </Web3Provider>
  );
}

export function RootLayout() {
  return (
    <AuthProvider>
      <Web3ProviderWithAuth>
        <TemplateProvider>
          <Outlet />
        </TemplateProvider>
      </Web3ProviderWithAuth>
    </AuthProvider>
  );
}
