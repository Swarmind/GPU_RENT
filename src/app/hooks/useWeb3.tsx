import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { BrowserProvider } from "ethers";
import { toast } from "sonner";
import { BASE_CHAIN_ID } from "../utils/contract";

interface Web3ContextType {
  account: string | null;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

interface Web3ProviderProps {
  children: ReactNode;
  onWalletUpdate?: (address: string) => Promise<void>;
  fetchWalletAddress?: () => Promise<string | null>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children, onWalletUpdate, fetchWalletAddress }: Web3ProviderProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Switch to Base network
  const switchToBase = async () => {
    if (typeof window.ethereum === "undefined") return false;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }], // 0x2105 for Base mainnet
      });
      return true;
    } catch (err: any) {
      // Chain not added to MetaMask
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
                chainName: "Base",
                nativeCurrency: {
                  name: "Ethereum",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://mainnet.base.org"],
                blockExplorerUrls: ["https://basescan.org"],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error("Error adding Base network:", addError);
          toast.error("Failed to add Base network", {
            description: "Please add Base network manually in MetaMask",
          });
          return false;
        }
      }
      console.error("Error switching to Base network:", err);
      return false;
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      const errorMsg = "MetaMask is not installed. Please install MetaMask browser extension to continue.";
      setError(errorMsg);
      toast.error("MetaMask not found", {
        description: "Install MetaMask to connect your wallet",
        action: {
          label: "Install",
          onClick: () => window.open("https://metamask.io/download/", "_blank"),
        },
        duration: 5000,
      });
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts.length > 0) {
        // Switch to Base network automatically
        const switched = await switchToBase();
        if (switched) {
          toast.success("Switched to Base network");
        }

        setAccount(accounts[0]);

        // Update wallet address on backend
        if (onWalletUpdate) {
          try {
            await onWalletUpdate(accounts[0]);
          } catch (err) {
            console.error("Failed to update wallet address on backend:", err);
          }
        }

        toast.success("Wallet connected!", {
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });
      }
    } catch (err: any) {
      console.error("Error connecting wallet:", err);
      let errorMessage = "Failed to connect wallet. Please try again.";
      
      if (err.code === 4001) {
        errorMessage = "Connection rejected. Please approve the connection request in MetaMask.";
        toast.error("Connection rejected", {
          description: "You need to approve the connection in MetaMask",
        });
      } else if (err.code === -32002) {
        errorMessage = "Connection request pending. Please check MetaMask.";
        toast.error("Request pending", {
          description: "Please check MetaMask for a pending connection request",
        });
      } else {
        toast.error("Connection failed", {
          description: errorMessage,
        });
      }
      
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    // Clear wallet address from backend
    if (onWalletUpdate) {
      onWalletUpdate("").catch(err => {
        console.error("Failed to clear wallet address on backend:", err);
      });
    }
    toast.info("Wallet disconnected");
  };

  useEffect(() => {
    // Load wallet address from backend on mount
    const loadWalletAddress = async () => {
      if (fetchWalletAddress) {
        try {
          const address = await fetchWalletAddress();
          if (address) {
            console.log('Loaded wallet address from backend:', address);
            setAccount(address);
          }
        } catch (err) {
          console.error('Failed to load wallet address from backend:', err);
        }
      }
    };

    loadWalletAddress();

    if (typeof window.ethereum !== "undefined") {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);

          // Update wallet address on backend when account changes
          if (onWalletUpdate) {
            try {
              await onWalletUpdate(accounts[0]);
            } catch (err) {
              console.error("Failed to update wallet address on backend:", err);
            }
          }

          toast.info("Account changed", {
            description: `Switched to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          });
        } else {
          disconnectWallet();
        }
      };

      const handleChainChanged = () => {
        toast.info("Network changed", {
          description: "Reloading page...",
        });
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (typeof window.ethereum !== "undefined") {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [onWalletUpdate, fetchWalletAddress]);

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

// Safe version that returns null if provider is not available
export function useWeb3Safe() {
  const context = useContext(Web3Context);
  return context || null;
}