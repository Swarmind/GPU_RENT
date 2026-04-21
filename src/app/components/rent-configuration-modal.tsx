import { useState, useEffect } from "react";
import { X, Clock, DollarSign, Zap } from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { API_BASE_URL } from "../config/api";

interface RentConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance: {
    id: string;
    gpuName: string;
    gpuCount: number;
    vram: number;
    location: string;
    pricePerHour: number;
    maxDuration?: string;
  };
  selectedTemplateId?: number;
  onRentSuccess?: () => void;
}

interface Template {
  id: number;
  name: string;
  description?: string;
  image_path?: string;
  template_name?: string;
  template_description?: string;
  vram_required_gb?: number;
  docker_server_name?: string;
  docker_username?: string;
  docker_password?: string;
  disk_space_mb?: number;
  is_private?: boolean;
  docker_options?: string;
  ports?: string[];
  environment_variables?: string[];
  readme?: string;
  on_start_script?: string;
  extra_filters?: string[];
}

const DURATION_PRESETS = [
  { label: "15 Minutes", minutes: 15 },
  { label: "1 Hour", minutes: 60 },
  { label: "3 Hours", minutes: 180 },
  { label: "6 Hours", minutes: 360 },
  { label: "12 Hours", minutes: 720 },
  { label: "1 Day", minutes: 1440 },
  { label: "3 Days", minutes: 4320 },
  { label: "1 Week", minutes: 10080 },
  { label: "1 Month", minutes: 43200 },
];

export function RentConfigurationModal({
  isOpen,
  onClose,
  instance,
  selectedTemplateId,
  onRentSuccess,
}: RentConfigurationModalProps) {
  console.log('🔵 RentConfigurationModal rendered, isOpen:', isOpen);

  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    selectedTemplateId?.toString() || ""
  );
  const [duration, setDuration] = useState<string>("60"); // in minutes
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch templates
  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/templates`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch templates");
        }

        const data = await response.json();
        console.log("Templates response:", data);

        // Handle response format: { items: [...], pagination: {...} }
        let templatesArray = [];
        if (data.items && Array.isArray(data.items)) {
          templatesArray = data.items;
        } else if (Array.isArray(data)) {
          templatesArray = data;
        } else if (data.templates && Array.isArray(data.templates)) {
          templatesArray = data.templates;
        }

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

        setTemplates(mappedTemplates);

        // Set selected template if provided
        if (selectedTemplateId && !selectedTemplate) {
          setSelectedTemplate(selectedTemplateId.toString());
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast.error("Failed to load templates");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [isOpen, user, selectedTemplateId]);

  const calculateCost = () => {
    const minutes = parseInt(duration) || 0;
    const hours = minutes / 60;
    return (hours * instance.pricePerHour).toFixed(2);
  };

  const formatDuration = () => {
    const minutes = parseInt(duration) || 0;
    if (minutes < 60) return `${minutes} minutes`;
    if (minutes < 1440) return `${(minutes / 60).toFixed(1)} hours`;
    return `${(minutes / 1440).toFixed(1)} days`;
  };

  // Parse machine's max duration from string like "720 mins" or "N/A"
  const getMachineMaxDurationMinutes = (): number | null => {
    if (!instance.maxDuration || instance.maxDuration === "N/A") {
      return null; // No limit
    }
    const match = instance.maxDuration.match(/(\d+)\s*mins?/i);
    return match ? parseInt(match[1]) : null;
  };

  // Validate if button should be disabled and get error message
  const getValidationError = (): string | null => {
    if (!selectedTemplate) {
      return "Please select a template";
    }
    if (!duration || parseInt(duration) <= 0) {
      return "Please select a duration";
    }

    const machineMaxMinutes = getMachineMaxDurationMinutes();
    const selectedMinutes = parseInt(duration);

    if (machineMaxMinutes !== null && selectedMinutes > machineMaxMinutes) {
      return `Duration exceeds machine limit (${instance.maxDuration})`;
    }

    return null;
  };

  const validationError = getValidationError();
  const isButtonDisabled = validationError !== null || isSubmitting;

  // Debug logging
  useEffect(() => {
    console.log('=== RENT BUTTON DEBUG ===');
    console.log('selectedTemplate:', selectedTemplate);
    console.log('duration:', duration);
    console.log('instance.maxDuration:', instance.maxDuration);
    console.log('validationError:', validationError);
    console.log('isButtonDisabled:', isButtonDisabled);
    console.log('isSubmitting:', isSubmitting);
    console.log('========================');
  }, [selectedTemplate, duration, validationError, isButtonDisabled, isSubmitting]);

  const handleRent = async () => {
    console.log('🟢 handleRent clicked!');
    console.log('selectedTemplate:', selectedTemplate);
    console.log('duration:', duration);
    console.log('user:', user);
    console.log('user.id:', user?.id);

    if (!selectedTemplate) {
      console.log('❌ No template selected');
      toast.error("Please select a template");
      return;
    }

    if (!duration || parseInt(duration) <= 0) {
      console.log('❌ Invalid duration');
      toast.error("Please select a valid duration");
      return;
    }

    console.log('✅ All validations passed, starting request...');
    setIsSubmitting(true);

    try {
      const requestBody = {
        machine_id: instance.id,
        template_id: parseInt(selectedTemplate),
      };

      console.log("📤 Creating deployment with:", requestBody);
      console.log("📤 URL:", `${API_BASE_URL}/deployments`);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add X-User-ID header if user is authenticated
      if (user?.id) {
        headers['X-User-ID'] = user.id;
        console.log("📤 Added X-User-ID header:", user.id);
      } else {
        console.log("📤 No user ID available for X-User-ID header");
      }

      console.log("📤 Request headers:", headers);

      const response = await fetch(`${API_BASE_URL}/deployments`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response ok:", response.ok);

      console.log("📥 Response status:", response.status);
      console.log("📥 Response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log("❌ Error response:", errorData);
        throw new Error(errorData.message || "Failed to create deployment");
      }

      const data = await response.json();
      console.log("✅ Deployment created successfully:", data);

      toast.success("Instance rented successfully!");

      // Close modal
      onClose();

      // Call success callback
      if (onRentSuccess) {
        onRentSuccess();
      }

      // Redirect to deployments page after a short delay
      setTimeout(() => {
        window.location.href = "/deployments";
      }, 1000);
    } catch (error) {
      console.error("❌ Error creating rent:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'N/A');
      toast.error(error instanceof Error ? error.message : "Failed to rent instance");
    } finally {
      console.log("🔚 Request finished, setting isSubmitting to false");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Configure Rental</h2>
            <p className="text-sm text-slate-600 mt-1">
              {instance.gpuCount}x {instance.gpuName} • {instance.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instance Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-600 mb-1">GPU Configuration</p>
                <p className="font-semibold text-slate-900">
                  {instance.gpuCount}x {instance.gpuName}
                </p>
                <p className="text-sm text-slate-600">{instance.vram}GB VRAM</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Hourly Rate</p>
                <p className="font-semibold text-blue-600 text-lg">
                  ${instance.pricePerHour.toFixed(3)}/hr
                </p>
              </div>
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template" className="text-sm font-medium">
              Template <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
              disabled={isLoading || isSubmitting}
            >
              <SelectTrigger id="template" className="w-full">
                <SelectValue placeholder={isLoading ? "Loading templates..." : "Select a template"} />
              </SelectTrigger>
              <SelectContent>
                {templates.length === 0 && !isLoading ? (
                  <SelectItem value="none" disabled>
                    No templates available
                  </SelectItem>
                ) : (
                  templates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name}
                      {template.description && (
                        <span className="text-xs text-slate-500 ml-2">
                          - {template.description}
                        </span>
                      )}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Choose a pre-configured environment with ML/AI frameworks
            </p>
          </div>

          {/* Duration Selection */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium">
              Rental Duration <span className="text-red-500">*</span>
            </Label>
            <Select value={duration} onValueChange={setDuration} disabled={isSubmitting}>
              <SelectTrigger id="duration" className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_PRESETS.map((preset) => (
                  <SelectItem key={preset.minutes} value={preset.minutes.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{preset.label}</span>
                      <span className="text-xs text-slate-500 ml-4">
                        ${((preset.minutes / 60) * instance.pricePerHour).toFixed(2)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              You can extend or terminate the rental at any time
            </p>
          </div>

          {/* Cost Summary */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Cost Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duration:
                </span>
                <span className="font-medium text-slate-900">{formatDuration()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Rate:</span>
                <span className="font-medium text-slate-900">
                  ${instance.pricePerHour.toFixed(3)}/hour
                </span>
              </div>
              <div className="h-px bg-slate-200 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-slate-900 font-semibold">Estimated Total:</span>
                <span className="text-2xl font-bold text-blue-600">${calculateCost()}</span>
              </div>
            </div>
          </div>

          {/* Info Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Instance will start immediately</p>
              <p className="text-blue-700">
                Your GPU instance will be provisioned and ready within 2-5 minutes. You'll receive
                connection details via email and in your Deployments dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          {/* Error message */}
          {validationError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">{validationError}</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleRent}
              disabled={isButtonDisabled}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Rental...
                </>
              ) : (
                <>Confirm Rental - ${calculateCost()}</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
