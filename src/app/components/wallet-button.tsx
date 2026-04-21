import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, AlertCircle, Download } from "lucide-react";
import { useState } from "react";
import { useWeb3 } from "../hooks/useWeb3";
import { toast } from "sonner";

export function WalletButton() {
  const { account, isConnecting, error, connectWallet, disconnectWallet } = useWeb3();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const openInExplorer = () => {
    if (account) {
      window.open(`https://etherscan.io/address/${account}`, "_blank");
    }
  };

  const handleConnect = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error("MetaMask is not installed!", {
        description: "Please install MetaMask browser extension to continue.",
        action: {
          label: "Install MetaMask",
          onClick: () => window.open("https://metamask.io/download/", "_blank"),
        },
        duration: 5000,
      });
      return;
    }
    
    await connectWallet();
  };

  if (!account) {
    return (
      <div className="relative">
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wallet className="w-4 h-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
        
        {error && (
          <div className="absolute top-full mt-2 right-0 w-80 p-4 bg-red-50 border-2 border-red-200 rounded-lg shadow-xl z-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900 mb-1">Connection Error</p>
                <p className="text-sm text-red-800 mb-3">{error}</p>
                {error.includes("MetaMask") && (
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
                  >
                    <Download className="w-4 h-4" />
                    Install MetaMask
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm font-medium text-slate-900">{formatAddress(account)}</span>
        <ChevronDown className={`w-4 h-4 text-slate-600 transition ${isDropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-slate-200">
              <div className="text-xs text-slate-500 mb-1">Connected Wallet</div>
              <div className="text-sm font-medium text-slate-900 break-all">
                {account}
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded transition"
              >
                <Copy className="w-4 h-4" />
                {copySuccess ? "Copied!" : "Copy Address"}
              </button>
              <button
                onClick={openInExplorer}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded transition"
              >
                <ExternalLink className="w-4 h-4" />
                View on BaseScan
              </button>
            </div>

            <div className="p-2 border-t border-slate-200">
              <button
                onClick={() => {
                  disconnectWallet();
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}