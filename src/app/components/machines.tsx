import { useState } from "react";
import { Plus, Server, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { AddMachineModal } from "./add-machine-modal";

// Mock machine data for the provider
const mockMachines = [
  {
    id: "1",
    machineName: "GPU Server Alpha",
    machineId: "best:2097334",
    location: "Spain, ES",
    gpuName: "1x RTX 5090",
    gpuCount: 1,
    tflops: 100.1,
    vram: 32,
    vramUnit: "GB",
    cpu: "ROME/X32/GM.2T",
    cpuCores: 32,
    cpuSpeed: 2.0,
    ram: 49485,
    ramMax: 201762,
    storage: 92,
    pricePerHour: 0.378,
    maxDuration: "5 mos, 2d",
    reliability: 99.28,
    verified: true,
    status: "active",
    rentals: 24,
    revenue: 217.34
  },
  {
    id: "2",
    machineName: "GPU Server Beta",
    machineId: "best:2382573",
    location: "Michigan, US",
    gpuName: "1x RTX PRO 6000",
    gpuCount: 1,
    tflops: 93.6,
    vram: 96,
    vramUnit: "GB",
    cpu: "K10-PG DZ4 Serries",
    cpuCores: 64,
    cpuSpeed: 3.4,
    ram: 92251,
    ramMax: 92251,
    storage: 134,
    pricePerHour: 0.738,
    maxDuration: "10 days",
    reliability: 99.73,
    verified: true,
    status: "active",
    rentals: 18,
    revenue: 398.52
  },
  {
    id: "3",
    machineName: "GPU Server Gamma",
    machineId: "best:2482573",
    location: "Michigan, US",
    gpuName: "2x RTX PRO 6000",
    gpuCount: 2,
    tflops: 187.1,
    vram: 96,
    vramUnit: "GB",
    cpu: "K10-PG DZ4 Serries",
    cpuCores: 64,
    cpuSpeed: 3.4,
    ram: 91377,
    ramMax: 92051,
    storage: 248,
    pricePerHour: 1.472,
    maxDuration: "10 days",
    reliability: 99.43,
    verified: true,
    status: "rented",
    rentals: 12,
    revenue: 531.84
  }
];

export function Machines() {
  const [machines, setMachines] = useState(mockMachines);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "rented" | "inactive">("all");

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

  const deleteMachine = (id: string) => {
    if (confirm("Are you sure you want to remove this machine from the marketplace?")) {
      setMachines(machines.filter(machine => machine.id !== id));
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
        </div>

        {/* Machines List */}
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
                    <div className="text-xs text-slate-500">{machine.tflops} TFLOPS</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">VRAM</div>
                    <div className="text-sm font-medium text-slate-900">
                      {machine.vram} {machine.vramUnit}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">CPU</div>
                    <div className="text-sm font-medium text-slate-900">{machine.cpuCores} cores</div>
                    <div className="text-xs text-slate-500">{machine.cpuSpeed} GHz</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">RAM</div>
                    <div className="text-sm font-medium text-slate-900">
                      {machine.ram} / {machine.ramMax} MBps
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Storage</div>
                    <div className="text-sm font-medium text-slate-900">{machine.storage} GB</div>
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
      </div>

      {/* Add Machine Modal */}
      <AddMachineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddMachine}
      />
    </div>
  );
}
