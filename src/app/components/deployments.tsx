import { useState, useEffect } from "react";
import {
  Play,
  Square,
  Pause,
  Copy,
  Terminal,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Activity,
  HardDrive,
  Key
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { toast } from "sonner";

type DeploymentStatus = "running" | "stopped" | "stopping" | "starting" | "paused" | "pausing" | "resuming" | "terminated";

interface PortInfo {
  container_port: number;
  host_port: number;
  listen_port: number;
  protocols: string[];
  ssh: boolean;
}

interface SSHInfo {
  dial_ip: string;
  dial_port: number;
  enabled: boolean;
  listen_port: number;
  reason: string;
}

interface AccessInfo {
  deployment_id: string;
  gateway_host: string;
  gateway_id: string;
  machine_assigned_ip: string;
  ports: PortInfo[];
  rent_id: string;
  ssh: SSHInfo;
  status: string;
}

interface Deployment {
  id: string;
  instanceId: string;
  name: string;
  gpuName: string;
  gpuCount: number;
  vram: number;
  location: string;
  status: DeploymentStatus;
  ipAddress: string;
  sshPort: number;
  sshUser: string;
  createdAt: string;
  lastStarted?: string;
  uptime: number; // hours
  pricePerHour: number;
  totalCost: number;
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  gpuUsage: number; // percentage
  diskUsage: number; // GB used / total GB
  template?: string;
}

// Mock deployment data
const mockDeployments: Deployment[] = [
  {
    id: "dep-1a2b3c4d",
    instanceId: "m:45198",
    name: "ML Training Cluster",
    gpuName: "RTX 5090",
    gpuCount: 1,
    vram: 32,
    location: "Spain, ES",
    status: "running",
    ipAddress: "185.23.145.67",
    sshPort: 22,
    sshUser: "root",
    createdAt: "2026-03-20T10:30:00Z",
    lastStarted: "2026-03-25T08:15:00Z",
    uptime: 4.5,
    pricePerHour: 0.378,
    totalCost: 42.56,
    cpuUsage: 45,
    memoryUsage: 68,
    gpuUsage: 92,
    diskUsage: 245.5,
    template: "PyTorch 2.0 + CUDA 12.1"
  },
  {
    id: "dep-5e6f7g8h",
    instanceId: "m:46844",
    name: "LLM Fine-tuning",
    gpuName: "RTX PRO 6000",
    gpuCount: 1,
    vram: 96,
    location: "Michigan, US",
    status: "stopped",
    ipAddress: "104.234.67.89",
    sshPort: 22,
    sshUser: "ubuntu",
    createdAt: "2026-03-18T14:20:00Z",
    lastStarted: "2026-03-24T18:45:00Z",
    uptime: 0,
    pricePerHour: 0.738,
    totalCost: 128.34,
    cpuUsage: 0,
    memoryUsage: 0,
    gpuUsage: 0,
    diskUsage: 512.8,
    template: "TensorFlow 2.14 + Jupyter"
  },
  {
    id: "dep-9i0j1k2l",
    instanceId: "m:69572",
    name: "Multi-GPU Research",
    gpuName: "RTX PRO 6000",
    gpuCount: 2,
    vram: 96,
    location: "Michigan, US",
    status: "running",
    ipAddress: "104.234.89.123",
    sshPort: 22,
    sshUser: "root",
    createdAt: "2026-03-22T09:00:00Z",
    lastStarted: "2026-03-25T06:30:00Z",
    uptime: 6.2,
    pricePerHour: 1.472,
    totalCost: 67.89,
    cpuUsage: 78,
    memoryUsage: 84,
    gpuUsage: 96,
    diskUsage: 1024.3,
    template: "Custom CUDA Environment"
  }
];

export function Deployments() {
  const { user } = useAuth();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const [actionType, setActionType] = useState<"pause" | "resume" | "stop" | null>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [accessInfo, setAccessInfo] = useState<Record<string, AccessInfo>>({});
  const [isSshKeysModalOpen, setIsSshKeysModalOpen] = useState(false);
  const [sshKeys, setSshKeys] = useState<string>("");
  const [isUploadingSshKeys, setIsUploadingSshKeys] = useState(false);

  // Fetch deployments from API or use mock data
  useEffect(() => {
    const fetchDeployments = async () => {
      if (!user) {
        // Not authenticated - show empty state
        setDeployments([]);
        return;
      }

      setIsLoading(true);
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        // Add X-User-ID header if user has an ID (optional)
        if ((user as any)?.id) {
          headers['X-User-ID'] = (user as any).id.toString();
        }

        console.log('Fetching deployments from:', 'https://launchpad.swarmind.ai/deployments');

        const response = await fetch('https://launchpad.swarmind.ai/deployments', {
          credentials: 'include',
          headers,
        });

        if (!response.ok) {
          console.error('Failed to fetch deployments:', response.status);
          // Show empty deployments on error
          setDeployments([]);
          return;
        }

        const data = await response.json();
        console.log('Deployments response:', data);

        // Parse response with rents array
        let rentsArray: any[] = [];
        if (data.rents && Array.isArray(data.rents)) {
          rentsArray = data.rents;
        } else if (Array.isArray(data)) {
          rentsArray = data;
        } else if (data.deployments && Array.isArray(data.deployments)) {
          rentsArray = data.deployments;
        }

        // Map rents to Deployment interface
        const mappedDeployments: Deployment[] = rentsArray.map((rent: any) => {
          // Map API status to DeploymentStatus
          let apiStatus = (rent.Status?.toLowerCase() || rent.status || 'stopped');
          if (apiStatus === 'active') {
            apiStatus = 'running';
          }

          return {
            id: rent.ID || rent.id || '',
            instanceId: rent.DeploymentID || rent.deployment_id || '',
            name: rent.name || `Deployment ${rent.ID || rent.id}`,
            gpuName: rent.gpu_name || rent.gpu || 'Unknown GPU',
            gpuCount: rent.gpu_count || rent.gpus || 1,
            vram: rent.vram || rent.vram_gb || 0,
            location: rent.location || rent.region || 'Unknown',
            status: apiStatus as DeploymentStatus,
            ipAddress: rent.ip_address || rent.ip || '',
            sshPort: rent.ssh_port || 22,
            sshUser: rent.ssh_user || rent.user || 'root',
            createdAt: rent.CreatedAt || rent.created_at || new Date().toISOString(),
            lastStarted: rent.last_started || rent.lastStarted,
            uptime: rent.uptime || rent.uptime_hours || 0,
            pricePerHour: rent.price_per_hour || rent.price || 0,
            totalCost: rent.total_cost || rent.cost || 0,
            cpuUsage: rent.cpu_usage || 0,
            memoryUsage: rent.memory_usage || rent.mem_usage || 0,
            gpuUsage: rent.gpu_usage || 0,
            diskUsage: rent.disk_usage || rent.disk_used_gb || 0,
            template: rent.template || rent.template_name,
          };
        });

        setDeployments(mappedDeployments);
      } catch (error) {
        console.error('Error fetching deployments:', error);
        // Show empty deployments on error
        setDeployments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeployments();
  }, [user]);

  // Fetch access info for all deployments
  useEffect(() => {
    const fetchAccessInfo = async () => {
      if (!user || deployments.length === 0) return;

      for (const deployment of deployments) {
        try {
          const response = await fetch(`https://launchpad.swarmind.ai/deployments/${deployment.id}/access`, {
            credentials: 'include',
          });

          if (response.ok) {
            const data: AccessInfo = await response.json();
            setAccessInfo(prev => ({
              ...prev,
              [deployment.id]: data
            }));
          }
        } catch (error) {
          console.error(`Error fetching access info for deployment ${deployment.id}:`, error);
        }
      }
    };

    fetchAccessInfo();
  }, [user, deployments.length]);

  const handleAction = async (deployment: Deployment, action: "pause" | "resume" | "stop") => {
    if (action === "stop") {
      setSelectedDeployment(deployment);
      setActionType(action);
      setIsActionDialogOpen(true);
      return;
    }

    await performAction(deployment, action);
  };

  const performAction = async (deployment: Deployment, action: "pause" | "resume" | "stop") => {
    try {
      console.log(`Performing ${action} on deployment:`, deployment.id);

      const response = await fetch(`https://launchpad.swarmind.ai/deployments/${deployment.id}/${action}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} deployment`);
      }

      toast.success(`Deployment ${action}d successfully`);

      // Update local state optimistically
      setDeployments(prev => prev.map(d => {
        if (d.id === deployment.id) {
          if (action === "pause") return { ...d, status: "pausing" as DeploymentStatus };
          if (action === "resume") return { ...d, status: "resuming" as DeploymentStatus };
          if (action === "stop") return { ...d, status: "stopping" as DeploymentStatus };
        }
        return d;
      }));

      // Simulate status change after delay (in real app, would poll or use websocket)
      if (action === "pause") {
        setTimeout(() => {
          setDeployments(prev => prev.map(d =>
            d.id === deployment.id ? { ...d, status: "paused" as DeploymentStatus } : d
          ));
        }, 2000);
      } else if (action === "resume") {
        setTimeout(() => {
          setDeployments(prev => prev.map(d =>
            d.id === deployment.id ? { ...d, status: "running" as DeploymentStatus } : d
          ));
        }, 2000);
      } else if (action === "stop") {
        setTimeout(() => {
          setDeployments(prev => prev.map(d =>
            d.id === deployment.id ? { ...d, status: "stopped" as DeploymentStatus } : d
          ));
        }, 2000);
      }
    } catch (error) {
      console.error(`Error ${action}ing deployment:`, error);
      toast.error(`Failed to ${action} deployment`);
    }
  };

  const confirmAction = async () => {
    if (selectedDeployment && actionType) {
      await performAction(selectedDeployment, actionType);
      setIsActionDialogOpen(false);
      setSelectedDeployment(null);
      setActionType(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleOpenSshKeysModal = (deployment: Deployment) => {
    setSelectedDeployment(deployment);
    setSshKeys("");
    setIsSshKeysModalOpen(true);
  };

  const handleUploadSshKeys = async () => {
    if (!selectedDeployment) return;

    // Parse SSH keys - split by newlines and filter empty lines
    const keysArray = sshKeys
      .split('\n')
      .map(key => key.trim())
      .filter(key => key.length > 0);

    if (keysArray.length === 0) {
      toast.error("Please enter at least one SSH public key");
      return;
    }

    setIsUploadingSshKeys(true);

    try {
      const response = await fetch(`https://launchpad.swarmind.ai/deployments/${selectedDeployment.id}/ssh-keys`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ssh_public_keys: keysArray
        })
      });

      if (!response.ok) {
        throw new Error('Failed to upload SSH keys');
      }

      toast.success('SSH keys uploaded successfully');
      setIsSshKeysModalOpen(false);
      setSshKeys("");
      setSelectedDeployment(null);
    } catch (error) {
      console.error('Error uploading SSH keys:', error);
      toast.error('Failed to upload SSH keys');
    } finally {
      setIsUploadingSshKeys(false);
    }
  };

  const getStatusBadge = (status: DeploymentStatus) => {
    const config = {
      running: { variant: "default" as const, className: "bg-green-500 hover:bg-green-600", icon: CheckCircle2 },
      stopped: { variant: "secondary" as const, className: "bg-slate-500 hover:bg-slate-600", icon: Square },
      stopping: { variant: "secondary" as const, className: "bg-orange-500 hover:bg-orange-600", icon: Clock },
      starting: { variant: "secondary" as const, className: "bg-blue-500 hover:bg-blue-600", icon: Clock },
      paused: { variant: "secondary" as const, className: "bg-yellow-500 hover:bg-yellow-600", icon: Square },
      pausing: { variant: "secondary" as const, className: "bg-yellow-500 hover:bg-yellow-600", icon: Clock },
      resuming: { variant: "secondary" as const, className: "bg-blue-500 hover:bg-blue-600", icon: Clock },
      terminated: { variant: "destructive" as const, className: "", icon: AlertCircle },
    };

    const statusConfig = config[status] || config.stopped; // Fallback to stopped if status unknown
    const { className, icon: Icon } = statusConfig;

    return (
      <Badge className={className}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const calculateTotalSpending = () => {
    return deployments.reduce((sum, d) => sum + d.totalCost, 0);
  };

  const getActiveDeploymentsCount = () => {
    return deployments.filter(d => d.status === "running").length;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20">
        <div className="container mx-auto px-6 py-12">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to view your deployments.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Deployments</h1>
          <p className="text-slate-600">Manage and monitor your active GPU instances</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Deployments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{deployments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                <div className="text-2xl font-bold text-slate-900">{getActiveDeploymentsCount()}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-500" />
                <div className="text-2xl font-bold text-slate-900">${calculateTotalSpending().toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Avg. Cost/Hour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                ${deployments.length > 0 
                  ? (deployments.reduce((sum, d) => sum + d.pricePerHour, 0) / deployments.length).toFixed(3)
                  : '0.000'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deployments List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : deployments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Terminal className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No deployments yet</h3>
              <p className="text-slate-600 mb-6">Get started by renting a GPU instance from the marketplace</p>
              <Button 
                onClick={() => window.location.href = '/marketplace'}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Browse Marketplace
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {deployments.map((deployment) => (
              <Card key={deployment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-12 gap-6">
                    {/* Left: Instance Info */}
                    <div className="col-span-12 lg:col-span-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                          {deployment.gpuCount}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 truncate">{deployment.name}</h3>
                            {getStatusBadge(deployment.status)}
                          </div>
                          <p className="text-sm text-slate-600 mb-1">
                            {deployment.gpuCount}x {deployment.gpuName} ({deployment.vram}GB)
                          </p>
                          <p className="text-xs text-slate-500">
                            {deployment.location} • ID: {deployment.id}
                          </p>
                          {deployment.template && (
                            <p className="text-xs text-blue-600 mt-1">📦 {deployment.template}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Connection & Metrics */}
                    <div className="col-span-12 lg:col-span-5">
                      {accessInfo[deployment.id] ? (
                        <>
                          {/* SSH Connection */}
                          {accessInfo[deployment.id].ssh?.enabled && (
                            <div className="mb-4">
                              <h4 className="text-xs font-medium text-slate-500 mb-2">SSH CONNECTION</h4>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <code className="text-xs bg-slate-100 px-2 py-1 rounded flex-1 truncate">
                                    ssh root@{accessInfo[deployment.id].ssh.dial_ip} -p {accessInfo[deployment.id].ssh.dial_port}
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => copyToClipboard(`ssh root@${accessInfo[deployment.id].ssh.dial_ip} -p ${accessInfo[deployment.id].ssh.dial_port}`, "SSH command")}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Gateway Info */}
                          <div className="mb-4">
                            <h4 className="text-xs font-medium text-slate-500 mb-2">GATEWAY</h4>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-600">Host:</span>
                                <code className="font-medium text-slate-900 bg-slate-100 px-1 rounded">{accessInfo[deployment.id].gateway_host}</code>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Machine IP:</span>
                                <code className="font-medium text-slate-900 bg-slate-100 px-1 rounded">{accessInfo[deployment.id].machine_assigned_ip}</code>
                              </div>
                            </div>
                          </div>

                          {/* Ports */}
                          {accessInfo[deployment.id].ports && accessInfo[deployment.id].ports.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-xs font-medium text-slate-500 mb-2">PORTS</h4>
                              <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                                {accessInfo[deployment.id].ports.map((port, idx) => (
                                  <div key={idx} className="flex justify-between items-center py-1 px-2 bg-slate-50 rounded">
                                    <span className="text-slate-600">
                                      {port.container_port} → {port.listen_port}
                                    </span>
                                    <span className="font-medium text-slate-900">
                                      {port.protocols.join(', ')}
                                      {port.ssh && <Badge className="ml-2 bg-blue-500 text-white text-xs py-0 px-1">SSH</Badge>}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-xs text-slate-500 italic">Loading access info...</div>
                      )}

                      {/* Uptime & Cost */}
                      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
                        <div>
                          <h4 className="text-xs font-medium text-slate-500 mb-1">UPTIME</h4>
                          <p className="text-sm font-medium text-slate-900">
                            {deployment.uptime > 0 ? `${deployment.uptime.toFixed(1)} hours` : 'Stopped'}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-slate-500 mb-1">TOTAL COST</h4>
                          <p className="text-sm font-medium text-blue-600">
                            ${deployment.totalCost.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500">
                            ${deployment.pricePerHour}/hour
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="col-span-12 lg:col-span-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        {deployment.status === "running" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() => handleOpenSshKeysModal(deployment)}
                            >
                              <Key className="w-4 h-4 mr-2" />
                              Upload SSH Keys
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() => handleAction(deployment, "pause")}
                            >
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() => handleAction(deployment, "stop")}
                            >
                              <Square className="w-4 h-4 mr-2" />
                              Stop
                            </Button>
                          </>
                        )}

                        {deployment.status === "paused" && (
                          <Button
                            size="sm"
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => handleAction(deployment, "resume")}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Resume
                          </Button>
                        )}

                        {(deployment.status === "pausing" || deployment.status === "resuming" || deployment.status === "stopping") && (
                          <Button size="sm" variant="outline" className="w-full" disabled>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            {deployment.status === "pausing" && "Pausing..."}
                            {deployment.status === "resuming" && "Resuming..."}
                            {deployment.status === "stopping" && "Stopping..."}
                          </Button>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500">
                          Created: {new Date(deployment.createdAt).toLocaleDateString()}
                        </p>
                        {deployment.lastStarted && (
                          <p className="text-xs text-slate-500">
                            Last started: {new Date(deployment.lastStarted).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Stop Deployment?</AlertDialogTitle>
              <AlertDialogDescription>
                This will stop the deployment <strong>{selectedDeployment?.name}</strong>.
                You can resume it later from the deployments page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmAction}>
                Stop
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* SSH Keys Upload Modal */}
        <AlertDialog open={isSshKeysModalOpen} onOpenChange={setIsSshKeysModalOpen}>
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Upload SSH Public Keys</AlertDialogTitle>
              <AlertDialogDescription>
                Add SSH public keys to access your deployment. You can add multiple keys (one per line).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4">
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Only upload PUBLIC keys (id_rsa.pub, id_ed25519.pub, etc.).
                  Never share your private keys!
                </AlertDescription>
              </Alert>
              <textarea
                className="w-full h-48 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ... user@host&#10;ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIG... user@host"
                value={sshKeys}
                onChange={(e) => setSshKeys(e.target.value)}
                disabled={isUploadingSshKeys}
              />
              <p className="text-xs text-slate-500 mt-2">
                Enter one or more SSH public keys, one per line
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isUploadingSshKeys}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUploadSshKeys}
                disabled={isUploadingSshKeys}
              >
                {isUploadingSshKeys ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Upload Keys
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}