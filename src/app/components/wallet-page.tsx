import { useState, useEffect } from "react";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, RefreshCw, AlertCircle, Lock, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { useWeb3 } from "../hooks/useWeb3";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { toast } from "sonner";
import { BrowserProvider } from "ethers";
import { getGPULeaseContract } from "../utils/contract";

export function WalletPage() {
  const { user } = useAuth();
  const { account, connectWallet, isConnecting } = useWeb3();
  const [contractBalance, setContractBalance] = useState<string>("0");
  const [walletBalance, setWalletBalance] = useState<string>("0");
  const [frozenFunds, setFrozenFunds] = useState<string>("0");
  const [tokenSymbol, setTokenSymbol] = useState<string>("USDC");
  const [isLoading, setIsLoading] = useState(false);
  
  // Deposit/Withdraw states
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Load balances
  const loadBalances = async (address: string) => {
    setIsLoading(true);
    try {
      const contract = await getGPULeaseContract();
      if (!contract) {
        throw new Error("Failed to initialize contract");
      }

      // Get contract balance (userBalance)
      const balance = await contract.getUserBalance(address);
      setContractBalance(balance);

      // Get wallet balance (USDC from wallet)
      const walletBal = await contract.getUSDCBalance(address);
      setWalletBalance(walletBal);

      // Get frozen funds (getUserFrozenFunds)
      const frozen = await contract.getUserFrozenFunds(address);
      setFrozenFunds(frozen);

      // Get token symbol
      const symbol = await contract.getUSDCSymbol();
      setTokenSymbol(symbol);
    } catch (error) {
      console.error("Error loading balances:", error);
      toast.error("Failed to load balances");
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh balances
  const refreshBalances = async () => {
    if (account) {
      await loadBalances(account);
      toast.success("Balances refreshed");
    }
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!account) {
      toast.error("Wallet not connected");
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (isDepositInsufficient()) {
      toast.error("Insufficient wallet balance");
      return;
    }

    try {
      const contract = await getGPULeaseContract();
      if (!contract) {
        throw new Error("Failed to initialize contract");
      }

      // Step 1: Approve USDC tokens
      setIsApproving(true);
      toast.info("Step 1/2: Approving USDC tokens...", {
        description: "Please confirm the approval transaction in MetaMask",
        duration: 5000,
      });
      
      await contract.approveTokens(depositAmount);
      toast.success("✓ Step 1/2: Tokens approved successfully!");
      
      setIsApproving(false);
      
      // Step 2: Deposit to contract
      setIsDepositing(true);
      toast.info("Step 2/2: Depositing to contract...", {
        description: "Please confirm the deposit transaction in MetaMask",
        duration: 5000,
      });
      
      await contract.deposit(depositAmount);
      
      toast.success(`✓ Deposit complete! ${depositAmount} ${tokenSymbol} deposited successfully!`, {
        description: "Your funds are now available in the contract",
      });
      setDepositAmount("");
      await loadBalances(account);
    } catch (error: any) {
      console.error("Error depositing:", error);
      if (error.code === 4001) {
        toast.error("Transaction rejected", {
          description: "You rejected the transaction in MetaMask",
        });
      } else if (error.code === -32603) {
        toast.error("Transaction failed", {
          description: error.message || "Please check your balance and try again",
        });
      } else {
        toast.error("Deposit failed", {
          description: error.message || "Please try again",
        });
      }
    } finally {
      setIsApproving(false);
      setIsDepositing(false);
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (isWithdrawInsufficient()) {
      toast.error("Insufficient available balance (excluding frozen funds)");
      return;
    }

    try {
      setIsWithdrawing(true);
      const contract = await getGPULeaseContract();
      if (!contract) {
        throw new Error("Failed to initialize contract");
      }

      toast.info("Withdrawing... Please confirm in MetaMask");
      await contract.withdraw(withdrawAmount);
      
      toast.success(`Successfully withdrawn ${withdrawAmount} ${tokenSymbol}!`);
      setWithdrawAmount("");
      await loadBalances(account);
    } catch (error: any) {
      console.error("Error withdrawing:", error);
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else {
        toast.error("Failed to withdraw. Please try again.");
      }
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Load balances when account changes
  useEffect(() => {
    if (account) {
      loadBalances(account);
    }
  }, [account]);

  // Calculate available balance (excluding frozen funds)
  const calculateAvailableBalance = () => {
    const total = parseFloat(contractBalance);
    const frozen = parseFloat(frozenFunds);
    return (total - frozen).toFixed(6);
  };

  // Check if deposit amount exceeds wallet balance
  const isDepositInsufficient = () => {
    if (!depositAmount) return false;
    return parseFloat(depositAmount) > parseFloat(walletBalance);
  };

  // Check if withdraw amount exceeds available balance
  const isWithdrawInsufficient = () => {
    if (!withdrawAmount) return false;
    const available = parseFloat(contractBalance) - parseFloat(frozenFunds);
    return parseFloat(withdrawAmount) > available;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20">
        <div className="container mx-auto px-6 py-12">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to access your wallet.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Wallet</h1>
              <p className="text-slate-600">Manage your deposits and withdrawals</p>
            </div>
            {account && (
              <Button
                variant="outline"
                size="sm"
                onClick={refreshBalances}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
          </div>
        </div>

        {/* Wallet Connection */}
        {!account ? (
          <Card className="mb-8">
            <CardContent className="py-12 text-center">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Connect Your Wallet</h3>
              <p className="text-slate-600 mb-6">
                Connect your MetaMask wallet to deposit and withdraw funds
              </p>
              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {parseFloat(contractBalance).toFixed(6)} {tokenSymbol}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Total deposited in contract</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Frozen Funds</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {parseFloat(frozenFunds).toFixed(6)} {tokenSymbol}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Locked in active leases</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Wallet Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {parseFloat(walletBalance).toFixed(6)} {tokenSymbol}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Available in your wallet</p>
                </CardContent>
              </Card>
            </div>

            {/* Connected Wallet Info */}
            <Card className="mb-8">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Connected Wallet</p>
                      <code className="text-sm font-mono text-slate-900">
                        {account.slice(0, 6)}...{account.slice(-4)}
                      </code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deposit/Withdraw Tabs */}
            <Tabs defaultValue="deposit" className="mb-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="deposit">Deposit</TabsTrigger>
                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              </TabsList>

              <TabsContent value="deposit">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowDownToLine className="w-5 h-5 text-blue-600" />
                      Deposit Funds
                    </CardTitle>
                    <CardDescription>
                      Transfer {tokenSymbol} from your wallet to the contract
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Amount
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="pr-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          step="0.000001"
                          min="0"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                          {tokenSymbol}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Available: {parseFloat(walletBalance).toFixed(6)} {tokenSymbol}
                      </p>
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild className="w-full">
                        <div>
                          <Button
                            onClick={handleDeposit}
                            disabled={isApproving || isDepositing || !depositAmount || isDepositInsufficient()}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isApproving ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Approving...
                              </>
                            ) : isDepositing ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Depositing...
                              </>
                            ) : (
                              <>
                                <ArrowDownToLine className="w-4 h-4 mr-2" />
                                Deposit
                              </>
                            )}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {isDepositInsufficient() && (
                        <TooltipContent>
                          <p>Insufficient funds in wallet</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="withdraw">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowUpFromLine className="w-5 h-5 text-green-600" />
                      Withdraw Funds
                    </CardTitle>
                    <CardDescription>
                      Transfer {tokenSymbol} from the contract to your wallet
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Amount
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="pr-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          step="0.000001"
                          min="0"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                          {tokenSymbol}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Available: {calculateAvailableBalance()} {tokenSymbol}
                      </p>
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild className="w-full">
                        <div>
                          <Button
                            onClick={handleWithdraw}
                            disabled={isWithdrawing || !withdrawAmount || isWithdrawInsufficient()}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isWithdrawing ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Withdrawing...
                              </>
                            ) : (
                              <>
                                <ArrowUpFromLine className="w-4 h-4 mr-2" />
                                Withdraw
                              </>
                            )}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {isWithdrawInsufficient() && (
                        <TooltipContent>
                          <p>Insufficient available balance (excluding frozen funds)</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Frozen Funds Details */}
            {parseFloat(frozenFunds) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-orange-600" />
                    Frozen Funds
                  </CardTitle>
                  <CardDescription>
                    Funds locked in active leases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div
                      className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Lease #1
                        </p>
                        <p className="text-xs text-slate-500">Active lease</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-orange-600">
                          {parseFloat(frozenFunds).toFixed(6)} {tokenSymbol}
                        </p>
                        <p className="text-xs text-slate-500">Frozen</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}