import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { BrowserProvider } from "ethers";

interface Web3ContextType {
  account: string | null;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed. Please install MetaMask to continue.");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        localStorage.setItem("walletConnected", "true");
      }
    } catch (err: any) {
      console.error("Error connecting wallet:", err);
      if (err.code === 4001) {
        setError("Connection rejected. Please try again.");
      } else {
        setError("Failed to connect wallet. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    localStorage.removeItem("walletConnected");
  };

  const checkIfWalletIsConnected = async () => {
    if (typeof window.ethereum === "undefined") return;

    const wasConnected = localStorage.getItem("walletConnected");
    if (!wasConnected) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_accounts", []);

      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        localStorage.removeItem("walletConnected");
      }
    } catch (err) {
      console.error("Error checking wallet connection:", err);
      localStorage.removeItem("walletConnected");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();

    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          disconnectWallet();
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    return () => {
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.removeListener("accountsChanged", () => {});
        window.ethereum.removeListener("chainChanged", () => {});
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}
