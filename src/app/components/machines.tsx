import { useState, useEffect } from "react";
import { Plus, Server, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { EnrollmentTokenModal } from "./enrollment-token-modal";
import { useAuth } from "../contexts/auth-context";
import { API_BASE_URL } from "../config/api";

// Mock data removed - using real API calls only

// Helper function to map API response to UI format
function mapApiMachineToUI(apiMachine: any) {
  // Extract GPU information from hardware
  let gpuName = "GPU Info N/A";
  let gpuCount = 0;
  let totalVram = 0;
  
  if (apiMachine.hardware?.gpus && Array.isArray(apiMachine.hardware.gpus)) {
    const gpus = apiMachine.hardware.gpus;
    gpuCount = gpus.length;
    
    if (gpuCount > 0) {
      // Get the name of the first GPU
      const firstGpuName = gpus[0].name || "Unknown GPU";
      
      // Calculate total VRAM across all GPUs
      totalVram = gpus.reduce((sum: number, gpu: any) => sum + (gpu.vram_mb || 0), 0);
      
      // Format GPU name with count
      if (gpuCount === 1) {
        gpuName = firstGpuName;
      } else {
        // Check if all GPUs have the same name
        const allSameName = gpus.every((gpu: any) => gpu.name === firstGpuName);
        if (allSameName) {
          gpuName = `${gpuCount}x ${firstGpuName}`;
        } else {
          // Mixed GPUs
          gpuName = `${gpuCount}x Mixed GPUs`;
        }
      }
      
      console.log(`GPU mapping for "${apiMachine.name}":`, {
        gpuCount,
        gpuName,
        totalVramMB: totalVram,
        totalVramGB: Math.round(totalVram / 1024),
        rawGpus: gpus
      });
    }
  }
  
  // Extract CPU information
  const cpuCores = apiMachine.hardware?.cpu?.cores || 0;
  const cpuModelName = apiMachine.hardware?.cpu?.model_name || "CPU Info N/A";
  
  // Extract RAM information (convert from bytes to GB)
  const ramTotalGB = apiMachine.ram_total_bytes ? Math.round(apiMachine.ram_total_bytes / (1024 ** 3)) : 0;
  const ramUsableGB = apiMachine.ram_usable_bytes ? Math.round(apiMachine.ram_usable_bytes / (1024 ** 3)) : 0;
  
  // Extract storage information (convert from bytes to GB)
  const storage = apiMachine.hardware?.disks?.[0]?.size_bytes 
    ? Math.round(apiMachine.hardware.disks[0].size_bytes / (1024 ** 3)) 
    : 0;
  
  // Convert price from USDC wei/second to USD/hour
  // USDC has 6 decimals, so we divide by 1,000,000
  // Formula: (price_per_second * 3600) / 10^6
  const pricePerHour = apiMachine.price_per_second 
    ? (apiMachine.price_per_second * 3600) / 1_000_000 
    : 0;

  return {
    id: apiMachine.id || String(Math.random()),
    machineName: apiMachine.name || "Unnamed Machine",
    machineId: apiMachine.id || "N/A",
    location: apiMachine.detected_geo || apiMachine.request_location || "Unknown",
    gpuName: gpuName,
    gpuCount: gpuCount,
    tflops: 0, // Not provided by API
    vram: totalVram > 0 ? Math.round(totalVram / 1024) : 0, // Convert MB to GB
    vramUnit: "GB",
    cpu: cpuModelName,
    cpuCores: cpuCores,
    cpuSpeed: 0, // Not provided directly by API
    ram: ramUsableGB,
    ramMax: ramTotalGB,
    storage: storage,
    pricePerHour: pricePerHour,
    maxDuration: apiMachine.rent_duration_minutes ? `${apiMachine.rent_duration_minutes} mins` : "N/A",
    reliability: 0, // Not provided by API
    verified: apiMachine.approved || false,
    status: apiMachine.approved ? "active" : "inactive",
    rentals: 0, // Not provided by API
    revenue: 0, // Not provided by API
    // Additional API fields
    assignedIp: apiMachine.assigned_ip,
    updatedAt: apiMachine.updated_at,
  };
}

export function Machines() {
  const { user } = useAuth();
  const [machines, setMachines] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "rented" | "inactive">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Fetch machines from API
  useEffect(() => {
    fetchUserMachines();
  }, [user, currentPage]);

  const fetchUserMachines = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      const url = `${API_BASE_URL}/machines?${params}`;
      
      console.log('=== FETCHING USER MACHINES ===');
      console.log('User authenticated:', !!user);
      console.log('User ID:', user?.id);
      console.log('API URL:', url);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add X-User-ID header if user is authenticated
      if (user?.id) {
        headers['X-User-ID'] = user.id;
        console.log('Added X-User-ID header:', user.id);
      } else {
        console.log('No user ID available for X-User-ID header');
      }

      console.log('Request headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `Failed to fetch machines (${response.status})`;
        const contentType = response.headers.get('content-type');
        
        try {
          if (contentType?.includes('application/json')) {
            const errorData = await response.json();
            console.log('Error response (JSON):', errorData);
            errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage;
          } else {
            const textError = await response.text();
            console.log('Error response (text):', textError);
            if (textError) errorMessage = textError;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Response body:', data);

      // Handle different response formats
      let machinesArray: any[] = [];
      
      if (data.items && Array.isArray(data.items)) {
        // New API format with "items"
        console.log('✓ Fetched machines (items):', data.items.length);
        machinesArray = data.items;
      } else if (data.machines && Array.isArray(data.machines)) {
        // Old API format with "machines"
        console.log('✓ Fetched machines (machines):', data.machines.length);
        machinesArray = data.machines;
      } else if (Array.isArray(data)) {
        // Direct array response
        console.log('✓ Fetched machines (array):', data.length);
        machinesArray = data;
      } else {
        console.warn('Invalid response format, expected { items: [] }, { machines: [] } or array');
        setMachines([]);
        setTotalPages(1);
        console.log('==============================');
        return;
      }

      if (machinesArray.length === 0) {
        console.log('No machines found, showing empty state');
        setMachines([]);
      } else {
        const mappedMachines = machinesArray.map(mapApiMachineToUI);
        console.log('✓ Mapped machines:', mappedMachines);
        setMachines(mappedMachines);
      }

      // Set total pages if provided by API
      if (data.total) {
        setTotalPages(Math.ceil(data.total / limit));
      } else {
        setTotalPages(Math.ceil(machinesArray.length / limit));
      }

      console.log('==============================');

    } catch (err: any) {
      console.error('=== FETCH MACHINES ERROR ===');
      console.error('Error type:', err.name);
      console.error('Error message:', err.message);
      console.error('Full error:', err);
      console.error('============================');
      
      // Provide user-friendly error messages
      let userFriendlyMessage = err.message || 'Failed to fetch machines';
      
      if (err.message?.includes('sql: Scan error')) {
        userFriendlyMessage = 'Backend database error: The server is having trouble reading machine data. Please contact support or try again later.';
      } else if (err.message?.includes('NULL to string')) {
        userFriendlyMessage = 'Data integrity issue: Some machine records have missing required fields. Please contact support.';
      } else if (err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch')) {
        userFriendlyMessage = 'Network error: Cannot connect to the server. Please check your internet connection.';
      } else if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        userFriendlyMessage = 'Authentication required: Please log in to view your machines.';
      }
      
      setError(userFriendlyMessage);
      setMachines([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMachine = (machineData: any) => {
    const newMachine = {
      ...machineData,
      id: String(machines.length + 1),
      gpuName: `${machineData.gpuCount}x ${machineData.gpuModel}`,
      status: "active",
      rentals: 0,
      revenue: 0
    };
    setMachines([...machines, newMachine]);
  };

  const toggleMachineStatus = (id: string) => {
    setMachines(machines.map(machine => 
      machine.id === id 
        ? { ...machine, status: machine.status === "active" ? "inactive" : "active" }
        : machine
    ));
  };

  const deleteMachine = async (id: string) => {
    if (!confirm("Are you sure you want to remove this machine from the marketplace?")) {
      return;
    }

    try {
      const url = `${API_BASE_URL}/machines/${id}`;
      
      console.log('=== DELETING MACHINE ===');
      console.log('Machine ID:', id);
      console.log('API URL:', url);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add X-User-ID header if user is authenticated
      if (user?.id) {
        headers['X-User-ID'] = user.id;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        let errorMessage = `Failed to delete machine (${response.status})`;
        const contentType = response.headers.get('content-type');
        
        try {
          if (contentType?.includes('application/json')) {
            const errorData = await response.json();
            console.log('Delete error response (JSON):', errorData);
            errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage;
          } else {
            const textError = await response.text();
            console.log('Delete error response (text):', textError);
            if (textError) errorMessage = textError;
          }
        } catch (parseError) {
          console.error('Failed to parse delete error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      console.log('✓ Machine deleted successfully');
      console.log('========================');

      // Remove machine from local state
      setMachines(machines.filter(machine => machine.id !== id));
      
      // Optionally show success message
      alert('Machine deleted successfully');
      
    } catch (err: any) {
      console.error('=== DELETE MACHINE ERROR ===');
      console.error('Error:', err);
      console.error('===========================');
      
      alert(`Failed to delete machine: ${err.message}`);
    }
  };

  const filteredMachines = machines.filter(machine => {
    if (selectedFilter === "all") return true;
    return machine.status === selectedFilter;
  });

  const totalRevenue = machines.reduce((sum, machine) => sum + machine.revenue, 0);
  const activeMachines = machines.filter(m => m.status === "active").length;
  const rentedMachines = machines.filter(m => m.status === "rented").length;

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 mb-2">My Machines</h1>
              <p className="text-slate-600">Manage your machines available on the marketplace</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Add Machine
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Total Machines</div>
              <div className="text-2xl font-semibold text-slate-900">{machines.length}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Active</div>
              <div className="text-2xl font-semibold text-green-600">{activeMachines}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Currently Rented</div>
              <div className="text-2xl font-semibold text-blue-600">{rentedMachines}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Total Revenue</div>
              <div className="text-2xl font-semibold text-slate-900">${totalRevenue.toFixed(2)}</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-2">
            {[
              { value: "all", label: "All Machines" },
              { value: "active", label: "Active" },
              { value: "rented", label: "Rented" },
              { value: "inactive", label: "Inactive" }
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value as any)}
                className={`px-4 py-2 rounded text-sm transition ${
                  selectedFilter === filter.value
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your machines...</p>
          </div>
        )}

        {/* Machines List */}
        {!isLoading && (
          <div className="space-y-4">
            {filteredMachines.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <Server className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No machines found</h3>
                <p className="text-slate-600 mb-4">
                  {selectedFilter === "all" 
                    ? "Add your first machine to start earning on the marketplace"
                    : `No ${selectedFilter} machines at the moment`
                  }
                </p>
                {selectedFilter === "all" && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Add Machine
                  </button>
                )}
              </div>
            ) : (
              filteredMachines.map(machine => (
                <div
                  key={machine.id}
                  className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white border-2 border-slate-200 rounded flex items-center justify-center text-blue-600 text-xl flex-shrink-0">
                        S
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium text-slate-900">{machine.machineName}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${
                            machine.status === "active" 
                              ? "bg-green-50 text-green-700"
                              : machine.status === "rented"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {machine.status}
                          </span>
                          {machine.verified && (
                            <span className="px-2 py-1 rounded text-xs bg-purple-50 text-purple-700">
                              verified
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-500">
                          {machine.machineId} • {machine.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMachineStatus(machine.id)}
                        className={`p-2 rounded hover:bg-slate-100 transition ${
                          machine.status === "rented" ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={machine.status === "rented"}
                        title={machine.status === "active" ? "Deactivate" : "Activate"}
                      >
                        {machine.status === "active" ? (
                          <Power className="w-5 h-5 text-green-600" />
                        ) : (
                          <PowerOff className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      <button
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded transition"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteMachine(machine.id)}
                        className={`p-2 text-red-600 hover:bg-red-50 rounded transition ${
                          machine.status === "rented" ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={machine.status === "rented"}
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-5 gap-6 mb-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">GPU</div>
                      <div className="text-sm font-medium text-slate-900">{machine.gpuName}</div>
                      {machine.gpuCount > 0 && (
                        <div className="text-xs text-slate-500">{machine.gpuCount} GPU{machine.gpuCount > 1 ? 's' : ''}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">VRAM</div>
                      <div className="text-sm font-medium text-slate-900">
                        {machine.vram > 0 ? `${machine.vram} ${machine.vramUnit}` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">CPU</div>
                      <div className="text-sm font-medium text-slate-900 truncate" title={machine.cpu}>
                        {machine.cpu}
                      </div>
                      {machine.cpuCores > 0 && (
                        <div className="text-xs text-slate-500">{machine.cpuCores} cores</div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">RAM</div>
                      <div className="text-sm font-medium text-slate-900">
                        {machine.ram > 0 ? `${machine.ram} GB` : 'N/A'}
                      </div>
                      {machine.ramMax > 0 && machine.ramMax !== machine.ram && (
                        <div className="text-xs text-slate-500">/ {machine.ramMax} GB total</div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Storage</div>
                      <div className="text-sm font-medium text-slate-900">
                        {machine.storage > 0 ? `${machine.storage} GB` : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Price</div>
                        <div className="text-lg font-medium text-slate-900">
                          ${machine.pricePerHour.toFixed(3)}/hr
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Max Duration</div>
                        <div className="text-sm font-medium text-slate-900">{machine.maxDuration}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Reliability</div>
                        <div className="text-sm font-medium text-slate-900">{machine.reliability}%</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs text-slate-500 mb-1">Total Rentals</div>
                        <div className="text-sm font-medium text-slate-900">{machine.rentals}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500 mb-1">Revenue</div>
                        <div className="text-lg font-medium text-green-600">${machine.revenue.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Machine Modal */}
      <EnrollmentTokenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
