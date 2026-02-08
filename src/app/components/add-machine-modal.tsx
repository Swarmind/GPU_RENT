import { X } from "lucide-react";
import { useState } from "react";

interface AddMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (machine: any) => void;
}

export function AddMachineModal({ isOpen, onClose, onSubmit }: AddMachineModalProps) {
  const [formData, setFormData] = useState({
    // Identification - EDITABLE
    machineName: "",
    machineId: "",
    location: "",
    
    // GPU Specs - AUTO-DETECTED
    gpuModel: "RTX 5090",
    gpuCount: 1,
    vram: "32",
    tflops: "100.1",
    cudaVersion: "13.0",
    
    // CPU Specs - AUTO-DETECTED
    cpuModel: "AMD EPYC 7xxx",
    cpuCores: "32",
    cpuSpeed: "3.4",
    
    // Memory & Storage - AUTO-DETECTED
    ram: "49485",
    ramMax: "201762",
    storage: "1000",
    storageType: "NVMe",
    diskName: "WD_BLACK SN850",
    diskSpeed: "1193",
    
    // Network - AUTO-DETECTED
    bandwidth: "198.9",
    downloadSpeed: "3253",
    uploadSpeed: "376",
    
    // Pricing & Availability - EDITABLE
    pricePerHour: "",
    maxDuration: "",
    reliability: "99.0",
    
    // Status - AUTO-DETECTED
    verified: false,
    staticIP: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Add New Machine</h2>
            <p className="text-sm text-slate-500 mt-1">Hardware specs will be auto-detected by CLI tool</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Machine Identification */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Machine Identification</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Machine Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="machineName"
                  value={formData.machineName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My GPU Server 1"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Machine ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="machineId"
                  value={formData.machineId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="best:2097334"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="California, US"
                />
              </div>
            </div>
          </div>

          {/* GPU Specifications */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-900 mb-2">GPU Specifications</h3>
            <p className="text-sm text-slate-500 mb-4">Auto-detected by CLI tool</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  GPU Model
                </label>
                <input
                  type="text"
                  name="gpuModel"
                  value={formData.gpuModel}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  placeholder="Auto-detected"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  GPU Count
                </label>
                <input
                  type="number"
                  name="gpuCount"
                  value={formData.gpuCount}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  placeholder="Auto-detected"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  VRAM (GB)
                </label>
                <input
                  type="number"
                  name="vram"
                  value={formData.vram}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  placeholder="Auto-detected"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  TFLOPS
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="tflops"
                  value={formData.tflops}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  placeholder="Auto-detected"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Max CUDA Version
                </label>
                <input
                  type="text"
                  name="cudaVersion"
                  value={formData.cudaVersion}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  placeholder="Auto-detected"
                />
              </div>
            </div>
          </div>

          {/* CPU Specifications */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-900 mb-2">CPU Specifications</h3>
            <p className="text-sm text-slate-500 mb-4">Auto-detected by CLI tool</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  CPU Model
                </label>
                <input
                  type="text"
                  name="cpuModel"
                  value={formData.cpuModel}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  placeholder="Auto-detected"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  CPU Cores
                </label>
                <input
                  type="number"
                  name="cpuCores"
                  value={formData.cpuCores}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  placeholder="Auto-detected"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  CPU Speed (GHz)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="cpuSpeed"
                  value={formData.cpuSpeed}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  placeholder="Auto-detected"
                />
              </div>
            </div>
          </div>

          {/* Memory & Storage */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Memory & Storage</h3>
            <p className="text-sm text-slate-500 mb-4">Auto-detected by CLI tool</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  RAM (MBps)
                </label>
                <input
                  type="number"
                  name="ram"
                  value={formData.ram}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  placeholder="Auto-detected"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Max RAM (MBps)
                </label>
                <input
                  type="number"
                  name="ramMax"
                  value={formData.ramMax}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  placeholder="Auto-detected"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Storage (GB)
                </label>
                <input
                  type="number"
                  name="storage"
                  value={formData.storage}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  placeholder="Auto-detected"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Storage Type
                </label>
                <input
                  type="text"
                  name="storageType"
                  value={formData.storageType}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  placeholder="Auto-detected"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Disk Name
                </label>
                <input
                  type="text"
                  name="diskName"
                  value={formData.diskName}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  placeholder="Auto-detected"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Disk Speed (MB/s)
                </label>
                <input
                  type="text"
                  name="diskSpeed"
                  value={formData.diskSpeed}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  placeholder="Auto-detected"
                />
              </div>
            </div>
          </div>

          {/* Network Specifications */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Network Specifications</h3>
            <p className="text-sm text-slate-500 mb-4">Auto-detected by CLI tool</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Bandwidth (GiB/s)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="bandwidth"
                  value={formData.bandwidth}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  placeholder="Auto-detected"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Download Speed (Gb/s)
                </label>
                <input
                  type="number"
                  name="downloadSpeed"
                  value={formData.downloadSpeed}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  placeholder="Auto-detected"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Upload Speed (Gb/s)
                </label>
                <input
                  type="number"
                  name="uploadSpeed"
                  value={formData.uploadSpeed}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  placeholder="Auto-detected"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Availability */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Pricing & Availability</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Price per Hour ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.001"
                  name="pricePerHour"
                  value={formData.pricePerHour}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.378"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Max Duration <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="maxDuration"
                  value={formData.maxDuration}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5 mos, 2d"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Expected Reliability (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="reliability"
                  value={formData.reliability}
                  disabled
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  placeholder="Auto-calculated"
                />
                <p className="text-xs text-slate-500 mt-1">Calculated based on uptime history</p>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Additional Options</h3>
            <p className="text-sm text-slate-500 mb-4">Auto-detected by CLI tool</p>
            <div className="space-y-3">
              <label className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                <input
                  type="checkbox"
                  name="verified"
                  checked={formData.verified}
                  disabled
                  className="w-4 h-4 rounded border-slate-300 text-blue-600"
                />
                <span className="text-sm text-slate-500">Machine is verified (requires manual approval)</span>
              </label>
              <label className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                <input
                  type="checkbox"
                  name="staticIP"
                  checked={formData.staticIP}
                  disabled
                  className="w-4 h-4 rounded border-slate-300 text-blue-600"
                />
                <span className="text-sm text-slate-500">Static IP Address available (auto-detected)</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-slate-600 hover:text-slate-900 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add Machine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}