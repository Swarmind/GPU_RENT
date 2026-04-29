import { Search, Server, Cpu, HardDrive, DollarSign, MapPin, Play, Pause, Trash2, ChevronLeft, ChevronRight, Loader2, AlertCircle, X, ChevronDown, Filter, Terminal, RefreshCw } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/auth-context";
import { useTemplate } from "../contexts/template-context";
import { RentConfigurationModal } from "./rent-configuration-modal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "./ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { API_BASE_URL } from "../config/api";

// Helper functions for price conversion
// USDC has 6 decimals

// Convert USD/hour to USDC wei/hour (for API filters)
function usdPerHourToWeiPerHour(usdPerHour: number): number {
  return Math.round(usdPerHour * 1_000_000);
}

// Convert USDC wei/second to USD/hour (for displaying prices from API)
function weiPerSecondToUsdPerHour(weiPerSecond: number): number {
  return (weiPerSecond * 3600) / 1_000_000;
}

export function Instances() {
  const { user } = useAuth();
  const { selectedTemplate, setSelectedTemplate } = useTemplate();
  const [instances, setInstances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Template selection
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Rent modal
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<any>(null);

  // UI filters (what user is editing in form - USD per hour)
  const [uiSearch, setUiSearch] = useState("");
  const [uiLocation, setUiLocation] = useState("");
  const [uiMinPrice, setUiMinPrice] = useState("");
  const [uiMaxPrice, setUiMaxPrice] = useState("");
  const [uiSortBy, setUiSortBy] = useState("updated_at");
  const [uiSortOrder, setUiSortOrder] = useState<"asc" | "desc">("desc");
  const [uiMinVram, setUiMinVram] = useState("");
  const [uiMaxVram, setUiMaxVram] = useState("");
  const [uiMinGpuCount, setUiMinGpuCount] = useState("");
  const [uiMaxGpuCount, setUiMaxGpuCount] = useState("");
  const [uiGpuModel, setUiGpuModel] = useState("");
  const [uiComputeApi, setUiComputeApi] = useState("");
  const [uiMinComputeCapability, setUiMinComputeCapability] = useState("");
  const [uiMaxDuration, setUiMaxDuration] = useState("");

  // Location autocomplete
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationInputRef = useRef<HTMLDivElement>(null);

  // Applied filters (used for API requests)
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [minVram, setMinVram] = useState("");
  const [maxVram, setMaxVram] = useState("");
  const [minGpuCount, setMinGpuCount] = useState("");
  const [maxGpuCount, setMaxGpuCount] = useState("");
  const [gpuModel, setGpuModel] = useState("");
  const [computeApi, setComputeApi] = useState("");
  const [minComputeCapability, setMinComputeCapability] = useState("");
  const [maxDuration, setMaxDuration] = useState("");

  // Apply filters function
  const handleSearch = () => {
    setSearch(uiSearch);
    setLocation(uiLocation);
    setMinPrice(uiMinPrice);
    setMaxPrice(uiMaxPrice);
    setSortBy(uiSortBy);
    setSortOrder(uiSortOrder);
    setMinVram(uiMinVram);
    setMaxVram(uiMaxVram);
    setMinGpuCount(uiMinGpuCount);
    setMaxGpuCount(uiMaxGpuCount);
    setGpuModel(uiGpuModel);
    setComputeApi(uiComputeApi);
    setMinComputeCapability(uiMinComputeCapability);
    setMaxDuration(uiMaxDuration);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Reset filters function
  const handleResetFilters = () => {
    setUiSearch("");
    setUiLocation("");
    setUiMinPrice("");
    setUiMaxPrice("");
    setUiSortBy("updated_at");
    setUiSortOrder("desc");
    setUiMinVram("");
    setUiMaxVram("");
    setUiMinGpuCount("");
    setUiMaxGpuCount("");
    setUiGpuModel("");
    setUiComputeApi("");
    setUiMinComputeCapability("");
    setUiMaxDuration("");
  };

  // Fetch location suggestions
  const fetchLocationSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/locations/suggest?q=${encodeURIComponent(query)}&limit=10`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const locations = (data.items || []).map((item: any) => item.location);
        setLocationSuggestions(locations);
      }
    } catch (err) {
      console.error('Failed to fetch location suggestions:', err);
      setLocationSuggestions([]);
    }
  };

  const handleLocationSelect = (location: string) => {
    setUiLocation(location);
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUiLocation(value);
    setShowSuggestions(true);
    fetchLocationSuggestions(value);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, location, minPrice, maxPrice, sortBy, sortOrder, minVram, maxVram, minGpuCount, maxGpuCount, gpuModel, computeApi, minComputeCapability, maxDuration]);

  // Fetch instances from real API
  useEffect(() => {
    const fetchInstances = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
        });

        // Add optional filters
        if (search) params.append('search', search);
        if (location) params.append('location', location);

        // Convert USD to USDC Wei for price filters
        if (minPrice) {
          const minPriceWei = usdPerHourToWeiPerHour(parseFloat(minPrice));
          params.append('min_price_per_hour', minPriceWei.toString());
        }
        if (maxPrice) {
          const maxPriceWei = usdPerHourToWeiPerHour(parseFloat(maxPrice));
          params.append('max_price_per_hour', maxPriceWei.toString());
        }

        if (sortBy) params.append('sort_by', sortBy);
        if (sortOrder) params.append('sort_order', sortOrder);

        // VRAM filters (in MB)
        if (minVram) params.append('min_vram_mb', (parseFloat(minVram) * 1024).toString());
        if (maxVram) params.append('max_vram_mb', (parseFloat(maxVram) * 1024).toString());

        if (minGpuCount) params.append('min_gpu_count', minGpuCount);
        if (maxGpuCount) params.append('max_gpu_count', maxGpuCount);
        if (gpuModel) params.append('gpu_model', gpuModel);
        if (computeApi) params.append('compute_api', computeApi);
        if (minComputeCapability) params.append('min_compute_capability', minComputeCapability);

        // Max duration in minutes
        if (maxDuration) params.append('max_duration_minutes', (parseFloat(maxDuration) * 24 * 60).toString());

        console.log('Fetching marketplace from:', `${API_BASE_URL}/marketplace?${params}`);

        const response = await fetch(`${API_BASE_URL}/marketplace?${params}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          console.error('Failed to fetch marketplace:', response.status);
          setInstances([]);
          setTotalPages(1);
          return;
        }

        const data = await response.json();
        console.log('Marketplace response:', data);

        // Map API response to UI format
        const machinesArray = data.items || data.machines || (Array.isArray(data) ? data : []);

        if (Array.isArray(machinesArray) && machinesArray.length > 0) {
          const mappedInstances = machinesArray.map((machine: any) => ({
            id: machine.id,
            machineId: machine.id,
            machineName: machine.name || "Unnamed Machine",
            location: machine.detected_geo || machine.request_location || "Unknown",
            gpuName: machine.hardware?.gpus?.[0]?.name || "Unknown GPU",
            gpuCount: machine.hardware?.gpus?.length || 0,
            vram: machine.hardware?.gpus?.[0]?.vram_mb ? Math.round(machine.hardware.gpus[0].vram_mb / 1024) : 0,
            vramUnit: "GB",
            cpu: machine.hardware?.cpu?.model_name || "Unknown CPU",
            cpuCores: machine.hardware?.cpu?.cores || 0,
            cpuSpeed: 0,
            ram: machine.ram_usable_bytes ? Math.round(machine.ram_usable_bytes / (1024 ** 3)) : 0,
            ramMax: machine.ram_total_bytes ? Math.round(machine.ram_total_bytes / (1024 ** 3)) : 0,
            storage: machine.hardware?.disks?.[0]?.size_bytes ? Math.round(machine.hardware.disks[0].size_bytes / (1024 ** 3)) : 0,
            storageType: "GB",
            diskName: machine.hardware?.disks?.[0]?.model || "Unknown",
            diskSize: "",
            bandwidth: machine.net_down_mbps || machine.hardware?.network?.download_speed || 0,
            bandwidthUnit: "Mbps",
            downloadSpeed: machine.net_down_mbps || machine.hardware?.network?.download_speed || 0,
            uploadSpeed: machine.net_up_mbps || machine.hardware?.network?.upload_speed || 0,
            uploadUnit: "Mbps",
            pricePerHour: machine.price_per_second ? weiPerSecondToUsdPerHour(machine.price_per_second) : 0,
            maxDuration: machine.rent_duration_minutes ? `${machine.rent_duration_minutes} mins` : "N/A",
            reliability: 0,
            verified: machine.approved || false,
            tflops: machine.hardware?.gpus?.[0]?.tflops || 0,
          }));

          setInstances(mappedInstances);
          setTotalPages(data.pagination?.total_pages || data.total_pages || Math.ceil((data.pagination?.total || data.total || mappedInstances.length) / limit));
        } else {
          setInstances([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Error fetching marketplace:', error);
        setInstances([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstances();
  }, [
    currentPage,
    limit,
    search,
    location,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
    minVram,
    maxVram,
    minGpuCount,
    maxGpuCount,
    gpuModel,
    computeApi,
    minComputeCapability,
    maxDuration,
  ]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers to show in pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Fetch templates
  useEffect(() => {
    if (!user) return;

    const fetchTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        const response = await fetch(`${API_BASE_URL}/templates`, {
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch templates");

        const data = await response.json();
        console.log('Templates response:', data);

        // Handle response format: { items: [...], pagination: {...} }
        let templatesArray = [];
        if (data.items && Array.isArray(data.items)) {
          templatesArray = data.items;
        } else if (Array.isArray(data)) {
          templatesArray = data;
        } else if (data.templates && Array.isArray(data.templates)) {
          templatesArray = data.templates;
        }

        console.log('templatesArray after parsing:', templatesArray);

        // Map API response to UI format
        const mappedTemplates = templatesArray.map((template: any) => ({
          id: template.id,
          name: template.template_name || template.name || "Unnamed Template",
          description: template.template_description || template.description || "",
          image_path: template.image_path,
          template_name: template.template_name,
          template_description: template.template_description,
          vram_required_gb: template.vram_required_gb,
          docker_server_name: template.docker_server_name,
          docker_username: template.docker_username,
          docker_password: template.docker_password,
          disk_space_mb: template.disk_space_mb,
          is_private: template.is_private,
          docker_options: template.docker_options,
          ports: template.ports,
          environment_variables: template.environment_variables,
          readme: template.readme,
          on_start_script: template.on_start_script,
          extra_filters: template.extra_filters,
        }));

        console.log('mappedTemplates:', mappedTemplates);
        console.log('Setting templates, count:', mappedTemplates.length);

        setTemplates(mappedTemplates);
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, [user]);

  const handleOpenTemplateSelector = () => {
    setIsTemplateSelectorOpen(true);
  };

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    setIsTemplateSelectorOpen(false);
  };

  const handleOpenRentModal = (instance: any) => {
    setSelectedInstance(instance);
    setIsRentModalOpen(true);
  };
  
  return (
    <div className="flex min-h-screen bg-slate-50 pt-16">
      {/* Left Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 fixed left-0 top-16 bottom-0 overflow-y-auto">
        <div className="p-4 pt-8">
          {/* Filter Options Header */}
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-700 shadow-[0_8px_16px_-12px_rgba(15,23,42,0.9)]">
            <Filter className="w-4 h-4" />
            <h3 className="text-sm font-medium text-white">Filter Options</h3>
          </div>

          {/* Search by Name */}
          <div className="mb-6">
            <label className="block text-xs text-white mb-2">Search by Name</label>
            <input
              type="text"
              value={uiSearch}
              onChange={(e) => setUiSearch(e.target.value)}
              placeholder="Machine name..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="block text-xs text-white mb-2">Location</label>
            <div ref={locationInputRef} className="relative">
              <input
                type="text"
                value={uiLocation}
                onChange={handleLocationChange}
                placeholder="e.g. US, Europe..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="off"
              />
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded shadow-lg max-h-60 overflow-y-auto">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleLocationSelect(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-700 text-xs text-slate-300 transition"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h4 className="text-sm text-white mb-4">Price Range ($/hr)</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-2">Min Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={uiMinPrice}
                  onChange={(e) => setUiMinPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs mb-2">Max Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={uiMaxPrice}
                  onChange={(e) => setUiMaxPrice(e.target.value)}
                  placeholder="10.00"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* VRAM Range (GB) */}
          <div className="mb-6">
            <h4 className="text-sm text-white mb-4">VRAM Range (GB)</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-2">Min VRAM</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={uiMinVram}
                  onChange={(e) => setUiMinVram(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs mb-2">Max VRAM</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={uiMaxVram}
                  onChange={(e) => setUiMaxVram(e.target.value)}
                  placeholder="128"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* GPU Count Range */}
          <div className="mb-6">
            <h4 className="text-sm text-white mb-4">GPU Count</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-2">Min GPUs</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={uiMinGpuCount}
                  onChange={(e) => setUiMinGpuCount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs mb-2">Max GPUs</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={uiMaxGpuCount}
                  onChange={(e) => setUiMaxGpuCount(e.target.value)}
                  placeholder="8"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* GPU Model */}
          <div className="mb-6">
            <label className="block text-xs text-white mb-2">GPU Model</label>
            <input
              type="text"
              value={uiGpuModel}
              onChange={(e) => setUiGpuModel(e.target.value)}
              placeholder="e.g. RTX 4090"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Compute API */}
          <div className="mb-6">
            <label className="block text-xs text-white mb-2">Compute API</label>
            <input
              type="text"
              value={uiComputeApi}
              onChange={(e) => setUiComputeApi(e.target.value)}
              placeholder="e.g. cuda"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Min Compute Capability */}
          <div className="mb-6">
            <label className="block text-xs text-white mb-2">Min Compute Capability</label>
            <input
              type="text"
              value={uiMinComputeCapability}
              onChange={(e) => setUiMinComputeCapability(e.target.value)}
              placeholder="e.g. 8.6"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Max Duration (days) */}
          <div className="mb-6">
            <label className="block text-xs text-white mb-2">Max Duration (days)</label>
            <input
              type="number"
              step="1"
              min="0"
              value={uiMaxDuration}
              onChange={(e) => setUiMaxDuration(e.target.value)}
              placeholder="30"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
        {/* Filters Bar */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
          <div className="flex items-center gap-3 flex-wrap mb-3">
            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Sort By:</span>
              <div className="relative">
                <select
                  value={uiSortBy}
                  onChange={(e) => setUiSortBy(e.target.value)}
                  className="px-3 py-1 pr-8 bg-slate-100 text-slate-600 text-xs rounded appearance-none cursor-pointer hover:bg-slate-200"
                >
                  <option value="price">Price</option>
                  <option value="updated_at">Recently Updated</option>
                  <option value="vram">VRAM</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Order:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setUiSortOrder("asc")}
                  className={`px-3 py-1 text-xs rounded transition ${
                    uiSortOrder === "asc"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  ASC
                </button>
                <button
                  onClick={() => setUiSortOrder("desc")}
                  className={`px-3 py-1 text-xs rounded transition ${
                    uiSortOrder === "desc"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  DESC
                </button>
              </div>
            </div>
          </div>

          {/* Search and Reset Buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            >
              <Search className="w-4 h-4" />
              <span>Apply Filters</span>
            </button>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition"
            >
              <X className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Instances List */}
        <div className="space-y-3">
          {instances.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
              <div className="text-slate-400 mb-2">
                <RefreshCw className={`w-12 h-12 mx-auto mb-4 ${isLoading ? 'animate-spin' : ''}`} />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {isLoading ? "Loading instances..." : "No instances found"}
              </h3>
              <p className="text-slate-600">
                {isLoading
                  ? "Please wait while we fetch available instances"
                  : "No GPU instances are currently available"
                }
              </p>
            </div>
          ) : (
            instances.map((instance) => (
            <div
              key={instance.id}
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-6">
                {/* GPU Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                    <Cpu className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">{instance.gpuName}</h3>
                    <div className="text-sm text-slate-600 space-y-1">
                      <div>
                        {instance.gpuCount > 1 && <span>{instance.gpuCount}x GPU • </span>}
                        <span>{instance.vram} GB VRAM</span>
                        <span> • {instance.tflops > 0 ? `${instance.tflops} TFLOPS` : 'TFLOPS: N/A'}</span>
                      </div>
                      <div className="text-slate-500">
                        CPU: {instance.cpu} ({instance.cpuCores} cores)
                      </div>
                      <div className="text-slate-500">
                        RAM: {instance.ram} GB / Storage: {instance.storage} GB
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{instance.location}</span>
                </div>

                {/* Network Speed */}
                <div className="text-center">
                  <div className="text-sm text-slate-500 mb-1">Network</div>
                  <div className="font-semibold text-slate-900">
                    {instance.downloadSpeed} Mbps ↓
                  </div>
                  <div className="text-xs text-slate-500">
                    {instance.uploadSpeed} Mbps ↑
                  </div>
                </div>

                {/* Duration */}
                {instance.maxDuration !== "N/A" && instance.maxDuration !== "0 mins" && (
                  <div className="text-center">
                    <div className="text-sm text-slate-500 mb-1">Max Duration</div>
                    <div className="font-semibold text-slate-900">
                      {instance.maxDuration}
                    </div>
                  </div>
                )}

                {/* Price & Rent */}
                <div className="text-right">
                  <div className="text-2xl font-semibold text-slate-900 mb-2">
                    ${instance.pricePerHour.toFixed(3)}<span className="text-sm text-slate-500">/hr</span>
                  </div>
                  <button
                    onClick={() => handleOpenRentModal(instance)}
                    className="px-6 py-2 text-sm font-medium rounded-lg transition bg-blue-600 text-white hover:bg-blue-700"
                  >
                    RENT
                  </button>
                </div>
              </div>
            </div>
          ))
          )}
        </div>

        {/* Pagination */}
        {instances.length > 0 && totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {getPageNumbers().map((page, index) => (
                <PaginationItem key={`${page}-${index}`}>
                  {page === '...' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page as number);
                      }}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) handlePageChange(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
        )}
      </main>

      {/* Template Selector Modal */}
      <Dialog open={isTemplateSelectorOpen} onOpenChange={setIsTemplateSelectorOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Template ({templates.length} available)</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {isLoadingTemplates ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : templates.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No templates available</p>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className="p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition"
                >
                  <h3 className="font-semibold text-slate-900 mb-1">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-slate-600">{template.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Rent Configuration Modal */}
      {selectedInstance && (
        <RentConfigurationModal
          isOpen={isRentModalOpen}
          onClose={() => setIsRentModalOpen(false)}
          instance={selectedInstance}
          selectedTemplateId={selectedTemplate?.id}
          onRentSuccess={() => {
            setIsRentModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
