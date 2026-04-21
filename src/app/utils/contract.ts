import { BrowserProvider, Contract, parseUnits, formatUnits } from "ethers";
import GPULeaseArtifact from "../../imports/GPULease.json";

// Contract addresses in Base network
export const GPU_LEASE_CONTRACT_ADDRESS = "0x222e1a492Ddd4B48b23Dab8005Ddadf67302D6f5";
export const USDC_TOKEN_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base mainnet
export const BASE_CHAIN_ID = 8453; // Base mainnet

// ERC20 ABI for approve/balanceOf/allowance
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)",
  "function decimals() public view returns (uint8)",
  "function symbol() public view returns (string)",
];

export class GPULeaseContract {
  private provider: BrowserProvider;
  private contract: Contract;
  private usdcToken: Contract;

  constructor(provider: BrowserProvider) {
    this.provider = provider;
    this.contract = new Contract(
      GPU_LEASE_CONTRACT_ADDRESS,
      GPULeaseArtifact.abi,
      provider
    );
    this.usdcToken = new Contract(USDC_TOKEN_ADDRESS, ERC20_ABI, provider);
  }

  // Get user's balance in the contract
  async getUserBalance(address: string): Promise<string> {
    try {
      const balance = await this.contract.userBalance(address);
      const decimals = await this.getUSDCDecimals();
      return formatUnits(balance, decimals);
    } catch (error) {
      console.error("Error getting user balance:", error);
      throw error;
    }
  }

  // Get user's frozen funds (total amount)
  async getUserFrozenFunds(address: string): Promise<string> {
    try {
      const frozenFunds = await this.contract.getUserFrozenFunds(address);
      const decimals = await this.getUSDCDecimals();

      // Handle empty array or invalid response
      if (!frozenFunds || (Array.isArray(frozenFunds) && frozenFunds.length === 0)) {
        return "0";
      }

      // frozenFunds is array of FrozenFundsInfo structs: [{ leaseId: uint, amount: uint256 }]
      // Sum up only the amount fields
      if (Array.isArray(frozenFunds)) {
        let total = BigInt(0);
        for (const item of frozenFunds) {
          // Each item is a struct with leaseId (index 0) and amount (index 1)
          const amount = item.amount || item[1];
          if (amount) {
            total += BigInt(amount);
          }
        }
        return formatUnits(total, decimals);
      }

      return formatUnits(frozenFunds, decimals);
    } catch (error) {
      console.error("Error getting frozen funds:", error);
      return "0"; // Return 0 instead of throwing
    }
  }

  // Get USDC token balance from wallet
  async getUSDCBalance(address: string): Promise<string> {
    try {
      const balance = await this.usdcToken.balanceOf(address);
      const decimals = await this.getUSDCDecimals();
      return formatUnits(balance, decimals);
    } catch (error) {
      console.error("Error getting USDC balance:", error);
      throw error;
    }
  }

  // Get USDC decimals
  async getUSDCDecimals(): Promise<number> {
    try {
      return await this.usdcToken.decimals();
    } catch (error) {
      console.error("Error getting USDC decimals:", error);
      return 6; // Default USDC decimals
    }
  }

  // Get USDC symbol
  async getUSDCSymbol(): Promise<string> {
    try {
      return await this.usdcToken.symbol();
    } catch (error) {
      console.error("Error getting USDC symbol:", error);
      return "USDC";
    }
  }

  // Check allowance
  async getAllowance(ownerAddress: string): Promise<string> {
    try {
      const decimals = await this.getUSDCDecimals();
      const allowance = await this.usdcToken.allowance(
        ownerAddress,
        GPU_LEASE_CONTRACT_ADDRESS
      );
      return formatUnits(allowance, decimals);
    } catch (error) {
      console.error("Error getting allowance:", error);
      throw error;
    }
  }

  // Approve tokens
  async approveTokens(amount: string): Promise<any> {
    try {
      const signer = await this.provider.getSigner();
      const usdcTokenWithSigner = this.usdcToken.connect(signer);
      const decimals = await this.getUSDCDecimals();
      const amountInWei = parseUnits(amount, decimals);
      const tx = await usdcTokenWithSigner.approve(
        GPU_LEASE_CONTRACT_ADDRESS,
        amountInWei
      );
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Error approving tokens:", error);
      throw error;
    }
  }

  // Deposit tokens
  async deposit(amount: string): Promise<any> {
    try {
      const signer = await this.provider.getSigner();
      const contractWithSigner = this.contract.connect(signer);
      const decimals = await this.getUSDCDecimals();
      const amountInWei = parseUnits(amount, decimals);
      const tx = await contractWithSigner.deposit(amountInWei);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Error depositing:", error);
      throw error;
    }
  }

  // Withdraw tokens
  async withdraw(amount: string): Promise<any> {
    try {
      const signer = await this.provider.getSigner();
      const contractWithSigner = this.contract.connect(signer);
      const decimals = await this.getUSDCDecimals();
      const amountInWei = parseUnits(amount, decimals);
      const tx = await contractWithSigner.withdraw(amountInWei);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Error withdrawing:", error);
      throw error;
    }
  }

  // Get user's active leases
  async getUserActiveLeases(address: string, index: number): Promise<string> {
    try {
      const leaseId = await this.contract.userActiveLeases(address, index);
      return leaseId.toString();
    } catch (error) {
      console.error("Error getting active leases:", error);
      throw error;
    }
  }

  // Get lease details
  async getLease(leaseId: string): Promise<any> {
    try {
      const lease = await this.contract.leases(leaseId);
      return {
        user: lease.user,
        provider: lease.provider,
        startTime: Number(lease.startTime),
        duration: Number(lease.duration),
        storagePricePerSecond: formatUnits(lease.storagePricePerSecond, 18),
        computePricePerSecond: formatUnits(lease.computePricePerSecond, 18),
        active: lease.active,
        completed: lease.completed,
        paused: lease.paused,
        pausedAt: Number(lease.pausedAt),
        pausedDuration: Number(lease.pausedDuration),
      };
    } catch (error) {
      console.error("Error getting lease:", error);
      throw error;
    }
  }

  // Get platform fee percentage
  async getPlatformFee(): Promise<string> {
    try {
      const fee = await this.contract.platformFeePercentage();
      return fee.toString();
    } catch (error) {
      console.error("Error getting platform fee:", error);
      throw error;
    }
  }
}

// Helper to get contract instance
export async function getGPULeaseContract(): Promise<GPULeaseContract | null> {
  if (typeof window.ethereum === "undefined") {
    console.error("MetaMask not installed");
    return null;
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    return new GPULeaseContract(provider);
  } catch (error) {
    console.error("Error creating contract instance:", error);
    return null;
  }
}