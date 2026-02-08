import { useState } from "react";
import { Filter, RefreshCw, Terminal, ChevronDown } from "lucide-react";

// Mock instance data
const instances = [
  {
    id: "m:45198",
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
    storageType: "ports",
    diskName: "WD_BLACK SN850...",
    diskSize: "1193 GB",
    bandwidth: 198.9,
    bandwidthUnit: "GiB/s",
    downloadSpeed: 3253,
    uploadSpeed: 376,
    uploadUnit: "Gb/s",
    reliability: 99.28,
    maxDuration: "5 mos, 2d",
    pricePerHour: 0.378,
    verified: true
  },
  {
    id: "m:46844",
    machineId: "best:2382573",
    location: "Michigan, US",
    gpuName: "1x RTX PRO 6...",
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
    storageType: "ports",
    diskName: "SAMSUNG MZQL...",
    diskSize: "2819 MB/s",
    bandwidth: 279.4,
    bandwidthUnit: "GiB/s",
    downloadSpeed: 2757,
    uploadSpeed: 99,
    uploadUnit: "Gb/s",
    reliability: 99.73,
    maxDuration: "10 days",
    pricePerHour: 0.738,
    verified: true
  },
  {
    id: "m:69572",
    machineId: "best:2482573",
    location: "Michigan, US",
    gpuName: "2x RTX PRO 6...",
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
    storageType: "ports",
    diskName: "SAMSUNG MZQL...",
    diskSize: "4880 MB/s",
    bandwidth: 558.4,
    bandwidthUnit: "GiB/s",
    downloadSpeed: 5764,
    uploadSpeed: 99,
    uploadUnit: "Gb/s",
    reliability: 99.43,
    maxDuration: "10 days",
    pricePerHour: 1.472,
    verified: true
  },
  {
    id: "m:78574",
    machineId: "best:243591",
    location: "Sweden, SE",
    gpuName: "1x RTX PRO 6...",
    gpuCount: 1,
    tflops: 119.0,
    vram: 96,
    vramUnit: "GB",
    cpu: "GDSGT48 FPG8A",
    cpuCores: 32,
    cpuSpeed: 3.4,
    ram: 94347,
    ramMax: 94445,
    storage: 14,
    storageType: "ports",
    diskName: "Micron_7400_MT...",
    diskSize: "16828 MB/s",
    bandwidth: 283.0,
    bandwidthUnit: "GiB/s",
    downloadSpeed: 2845,
    uploadSpeed: 99,
    uploadUnit: "Gb/s",
    reliability: 99.29,
    maxDuration: "1 mon, 1d",
    pricePerHour: 0.821,
    verified: true
  },
  {
    id: "m:37483",
    machineId: "best:645293",
    location: "Poland, PL",
    gpuName: "2x RTX PRO 6...",
    gpuCount: 2,
    tflops: 237.9,
    vram: 96,
    vramUnit: "GB",
    cpu: "TURN2DZ4G-2L",
    cpuCores: 64,
    cpuSpeed: 3.4,
    ram: 94419,
    ramMax: 94319,
    storage: 2490,
    storageType: "ports",
    diskName: "KINGSTON SEDC...",
    diskSize: "5255 MB/s",
    bandwidth: 562.5,
    bandwidthUnit: "GiB/s",
    downloadSpeed: 3634,
    uploadSpeed: 97,
    uploadUnit: "Gb/s",
    reliability: 97.69,
    maxDuration: "5 mon",
    pricePerHour: 1.421,
    verified: true
  },
  {
    id: "m:23593",
    machineId: "best:1350343",
    location: "Spain, ES",
    gpuName: "2x RTX 5090",
    gpuCount: 2,
    tflops: 215.2,
    vram: 32,
    vramUnit: "GB",
    cpu: "S8D/S5/GM/E",
    cpuCores: 16,
    cpuSpeed: 3.4,
    ram: 49486,
    ramMax: 49486,
    storage: 691,
    storageType: "ports",
    diskName: "nvme",
    diskSize: "2265 MB/s",
    bandwidth: 347.1,
    bandwidthUnit: "GiB/s",
    downloadSpeed: 451,
    uploadSpeed: 99,
    uploadUnit: "Gb/s",
    reliability: 99.87,
    maxDuration: "5 days",
    pricePerHour: 0.805,
    verified: true
  },
  {
    id: "m:51959",
    machineId: "best:2745571",
    location: "California, US",
    gpuName: "2x RTX 5080",
    gpuCount: 2,
    tflops: 106.3,
    vram: 16,
    vramUnit: "GB",
    cpu: "AMZ EC2",
    cpuCores: 8,
    cpuSpeed: 2.7,
    ram: 4591,
    ramMax: 4591,
    storage: 198,
    storageType: "ports",
    diskName: "nvme",
    diskSize: "1504 MB/s",
    bandwidth: 167.5,
    bandwidthUnit: "GiB/s",
    downloadSpeed: 711,
    uploadSpeed: 99,
    uploadUnit: "Gb/s",
    reliability: 99.64,
    maxDuration: "1 day",
    pricePerHour: 0.236,
    verified: true
  }
];

export function Instances() {
  const [hostReliability, setHostReliability] = useState(90);
  const [maxDuration, setMaxDuration] = useState(7);
  const [showSecureCloud, setShowSecureCloud] = useState(false);
  const [unverifiedMachines, setUnverifiedMachines] = useState(false);
  const [incompatibleMachines, setIncompatibleMachines] = useState(false);
  const [unavailableOffers, setUnavailableOffers] = useState(false);
  const [staticIP, setStaticIP] = useState(false);
  const [gpuFilter, setGpuFilter] = useState("ANY");
  const [demandFilter, setDemandFilter] = useState("On-Demand");
  const [gpuTypeFilter, setGpuTypeFilter] = useState("Any GPU");
  const [locationFilter, setLocationFilter] = useState("Planet Earth");
  const [sortFilter, setSortFilter] = useState("Auto Sort");

  return (
    <div className="flex min-h-screen bg-slate-50 pt-16">
      {/* Left Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 fixed left-0 top-16 bottom-0 overflow-y-auto">
        <div className="p-4">
          {/* Filter Options Header */}
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-700">
            <Filter className="w-4 h-4" />
            <h3 className="text-sm font-medium text-white">Filter Options</h3>
          </div>

          {/* Show Secure Cloud Only */}
          <div className="mb-6">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm">Show Secure Cloud Only</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showSecureCloud}
                  onChange={(e) => setShowSecureCloud(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>
          </div>

          {/* Availability Section */}
          <div className="mb-6">
            <h4 className="text-sm text-white mb-4">Availability</h4>
            
            {/* Host Reliability */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">Host Reliability</span>
                <span className="text-xs text-blue-400">{hostReliability}.00%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={hostReliability}
                onChange={(e) => setHostReliability(Number(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Max Instance Duration */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">Max Instance Duration</span>
                <span className="text-xs text-blue-400">{maxDuration} days</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={maxDuration}
                onChange={(e) => setMaxDuration(Number(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* Machine Options */}
          <div className="mb-6">
            <h4 className="text-sm text-white mb-4">Machine Options</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={unverifiedMachines}
                  onChange={(e) => setUnverifiedMachines(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span>Unverified Machines</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={incompatibleMachines}
                  onChange={(e) => setIncompatibleMachines(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span>Incompatible Machines</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={unavailableOffers}
                  onChange={(e) => setUnavailableOffers(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span>Unavailable Offers</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={staticIP}
                  onChange={(e) => setStaticIP(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span>Static IP Address</span>
              </label>
            </div>
          </div>

          {/* Min Cuda Version */}
          <div className="mb-6">
            <label className="block text-xs text-white mb-2">Min Cuda Version</label>
            <div className="relative">
              <select className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>ESI - 11.0.3</option>
                <option>11.0</option>
                <option>11.1</option>
                <option>12.0</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* CLI Link */}
          <div className="mt-8 pt-4 border-t border-slate-700">
            <a href="#" className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300">
              <Terminal className="w-4 h-4" />
              <span>CLI</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6">
        {/* Template Selection */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 flex items-center justify-between">
          <span className="text-slate-600">No template selected</span>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Select Template
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* GPU Count Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">#GPUs:</span>
              <div className="flex gap-1">
                {["ANY", "1X", "2X", "4X", "8X", "9X+"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setGpuFilter(option)}
                    className={`px-3 py-1 text-xs rounded transition ${
                      gpuFilter === option
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Demand Filter */}
            <div className="relative">
              <select
                value={demandFilter}
                onChange={(e) => setDemandFilter(e.target.value)}
                className="px-3 py-1 pr-8 bg-slate-100 text-slate-600 text-xs rounded appearance-none cursor-pointer hover:bg-slate-200"
              >
                <option>On-Demand</option>
                <option>Spot</option>
                <option>Reserved</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>

            {/* GPU Type Filter */}
            <div className="relative">
              <select
                value={gpuTypeFilter}
                onChange={(e) => setGpuTypeFilter(e.target.value)}
                className="px-3 py-1 pr-8 bg-slate-100 text-slate-600 text-xs rounded appearance-none cursor-pointer hover:bg-slate-200"
              >
                <option>Any GPU</option>
                <option>RTX 5090</option>
                <option>RTX 5080</option>
                <option>RTX PRO</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>

            {/* Location Filter */}
            <div className="relative">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-3 py-1 pr-8 bg-slate-100 text-slate-600 text-xs rounded appearance-none cursor-pointer hover:bg-slate-200"
              >
                <option>Planet Earth</option>
                <option>North America</option>
                <option>Europe</option>
                <option>Asia</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort Filter */}
            <div className="relative ml-auto">
              <select
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
                className="px-3 py-1 pr-8 bg-slate-100 text-slate-600 text-xs rounded appearance-none cursor-pointer hover:bg-slate-200"
              >
                <option>Auto Sort</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Performance</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Instances List */}
        <div className="space-y-3">
          {instances.map((instance) => (
            <div
              key={instance.id}
              className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Machine ID & GPU Info */}
                <div className="col-span-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-white border-2 border-slate-200 rounded flex items-center justify-center text-blue-600 text-xl flex-shrink-0">
                      S
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-slate-500">{instance.id}</div>
                      <div className="text-xs text-slate-400 mb-1">{instance.machineId}</div>
                      <h3 className="text-sm font-medium text-slate-900 mb-1">{instance.gpuName}</h3>
                      <div className="text-xs text-slate-600">
                        <span className="font-medium">{instance.tflops}</span> TFLOPS
                      </div>
                      <div className="text-xs text-slate-500">Max CUDA: 13.0</div>
                    </div>
                  </div>
                </div>

                {/* Specs */}
                <div className="col-span-3">
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-slate-900 font-medium">{instance.vram} {instance.vramUnit}</span>
                      <span className="text-slate-400"> Vram</span>
                    </div>
                    <div>
                      <span className="text-slate-900 font-medium">{instance.cpu}</span>
                    </div>
                    <div className="text-slate-500">
                      PCIe G:{instance.cpuCores}x {instance.cpuSpeed} GHz
                    </div>
                    <div>
                      <span className="text-slate-900 font-medium">
                        {instance.ram} MBps / {instance.ramMax} MBps
                      </span>
                    </div>
                    <div className="text-slate-500">
                      AMD EPYC {instance.cpu.split('/')[1] || '7xxx'}
                    </div>
                  </div>
                </div>

                {/* Storage & Network */}
                <div className="col-span-2">
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-slate-900 font-medium">
                        ø{instance.ram} MBps<br />
                        ø{instance.ramMax} MBps
                      </span>
                    </div>
                    <div className="text-slate-500 mt-2">
                      {instance.storage} {instance.storageType}
                    </div>
                    <div className="text-slate-900 font-medium">{instance.diskName}</div>
                    <div className="text-slate-500">{instance.diskSize}</div>
                  </div>
                </div>

                {/* Bandwidth */}
                <div className="col-span-2">
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-slate-900 font-medium text-lg">{instance.bandwidth}</span>
                      <span className="text-slate-500 text-xs"> {instance.bandwidthUnit}</span>
                    </div>
                    <div className="text-slate-500">
                      {instance.downloadSpeed} {instance.uploadUnit}↓ / {instance.uploadSpeed} {instance.uploadUnit}↑
                    </div>
                  </div>
                </div>

                {/* Reliability & Duration */}
                <div className="col-span-1">
                  <div className="space-y-1 text-xs">
                    <div className={`px-2 py-1 rounded text-center ${
                      instance.verified ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {instance.verified ? "verified" : "unverified"}
                    </div>
                    <div className="text-slate-500 mt-2">Max Duration</div>
                    <div className="text-slate-900 font-medium">{instance.maxDuration}</div>
                    <div className="text-slate-500 mt-1">Reliability</div>
                    <div className="text-slate-900 font-medium">{instance.reliability}%</div>
                  </div>
                </div>

                {/* Price & Rent Button */}
                <div className="col-span-1 text-right">
                  <div className="text-lg font-medium text-slate-900 mb-1">
                    ${instance.pricePerHour.toFixed(3)}/hr
                  </div>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition">
                    RENT
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}