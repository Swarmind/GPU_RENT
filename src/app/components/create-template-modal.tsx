import { X, Plus, ChevronDown, Lock, LockOpen, HelpCircle, Check, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/auth-context";
import { useTemplate } from "../contexts/template-context";
import { useNavigate } from "react-router";

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateCreated?: () => void;
  templateId?: number; // If provided, modal is in edit mode
  templateData?: any; // If provided, pre-fill form with this data (for forking)
}

const API_BASE_URL = 'https://launchpad.swarmind.ai';

export function CreateTemplateModal({ isOpen, onClose, onTemplateCreated, templateId, templateData }: CreateTemplateModalProps) {
  const { user } = useAuth();
  const { setSelectedTemplate } = useTemplate();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"config" | "readme">("config");
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [dockerOptions, setDockerOptions] = useState("");
  const [portType, setPortType] = useState<"tcp" | "udp" | "not_specified">("not_specified");
  const [hostPort, setHostPort] = useState("");
  const [containerPort, setContainerPort] = useState("");
  const [ports, setPorts] = useState<string[]>([]);
  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string }>>([
    { key: "", value: "" }
  ]);
  const [showPorts, setShowPorts] = useState(true);
  const [showEnvVars, setShowEnvVars] = useState(true);
  const [onStartScript, setOnStartScript] = useState("");
  const [extraFilters, setExtraFilters] = useState<Array<{ key: string; value: string }>>([
    { key: "", value: "" }
  ]);
  const [dockerServer, setDockerServer] = useState("");
  const [dockerUsername, setDockerUsername] = useState("");
  const [dockerToken, setDockerToken] = useState("");
  const [versionTag, setVersionTag] = useState("latest");
  const [diskSize, setDiskSize] = useState("8");
  const [diskUnit, setDiskUnit] = useState("GB");
  const [isPrivate, setIsPrivate] = useState(true);
  const [vramRequired, setVramRequired] = useState("");
  const [maxPricePerHour, setMaxPricePerHour] = useState("");
  const [showDockerAuth, setShowDockerAuth] = useState(false);
  
  // API states
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTemplate, setIsFetchingTemplate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdTemplateId, setCreatedTemplateId] = useState<number | null>(null);
  const [readme, setReadme] = useState("");

  // Fetch template data when in edit mode
  useEffect(() => {
    if (!isOpen || !templateId) return;

    const fetchTemplate = async () => {
      setIsFetchingTemplate(true);
      setError(null);

      try {
        console.log('=== FETCH TEMPLATE REQUEST ===');
        console.log('Template ID:', templateId);
        console.log('URL:', `${API_BASE_URL}/templates/${templateId}`);

        const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(user?.id && { 'X-USER-ID': user.id.toString() }),
          },
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
          throw new Error(`Failed to fetch template (${response.status})`);
        }

        const template = await response.json();
        console.log('Template data:', template);

        // Populate form fields
        setTemplateName(template.template_name || "");
        setDescription(template.template_description || "");
        setImagePath(template.image_path || "");
        setDockerOptions(template.docker_options || "");
        setDockerServer(template.docker_server_name || "");
        setDockerUsername(template.docker_username || "");
        setPorts(template.ports || []);
        setOnStartScript(template.on_start_script || "");

        // Convert extra_filters from array to key-value pairs
        if (template.extra_filters && template.extra_filters.length > 0) {
          const parsedFilters = template.extra_filters.map((filter: string) => {
            const [key, ...valueParts] = filter.split('=');
            return { key, value: valueParts.join('=') };
          });
          setExtraFilters(parsedFilters);
        } else {
          setExtraFilters([{ key: "", value: "" }]);
        }

        setIsPrivate(template.is_private !== undefined ? template.is_private : true);
        setReadme(template.readme || "");
        
        // Show Docker Auth section if credentials exist
        if (template.docker_server_name || template.docker_username) {
          setShowDockerAuth(true);
        }

        // Convert environment variables from array to key-value pairs
        if (template.environment_variables && template.environment_variables.length > 0) {
          const parsedEnvVars = template.environment_variables.map((env: string) => {
            const [key, ...valueParts] = env.split('=');
            return { key, value: valueParts.join('=') };
          });
          setEnvVars(parsedEnvVars);
        }

        // Convert disk space MB to GB/TB
        if (template.disk_space_mb) {
          if (template.disk_space_mb >= 1024) {
            setDiskSize(String(template.disk_space_mb / 1024));
            setDiskUnit("TB");
          } else {
            setDiskSize(String(template.disk_space_mb));
            setDiskUnit("GB");
          }
        }

        // Convert price from cents to dollars
        if (template.max_price_per_hour_cents) {
          setMaxPricePerHour(String(template.max_price_per_hour_cents / 100));
        }

        if (template.vram_required_gb) {
          setVramRequired(String(template.vram_required_gb));
        }

        console.log('✓ Template loaded successfully');
        console.log('==============================');

      } catch (err: any) {
        console.error('=== FETCH TEMPLATE ERROR ===');
        console.error('Error:', err);
        console.error('============================');
        setError(`Failed to load template: ${err.message}`);
      } finally {
        setIsFetchingTemplate(false);
      }
    };

    fetchTemplate();
  }, [isOpen, templateId]);

  // Pre-fill form with templateData when forking
  useEffect(() => {
    if (!isOpen || !templateData || templateId) return;

    setTemplateName(templateData.template_name || "");
    setDescription(templateData.template_description || "");
    setImagePath(templateData.image_path || "");
    setDockerOptions(templateData.docker_options || "");
    setDockerServer(templateData.docker_server_name || "");
    setDockerUsername(templateData.docker_username || "");
    setPorts(templateData.ports || []);
    setOnStartScript(templateData.on_start_script || "");
    setReadme(templateData.readme || "");
    setIsPrivate(templateData.is_private !== undefined ? templateData.is_private : true);

    // Convert extra_filters from array to key-value pairs
    if (templateData.extra_filters && templateData.extra_filters.length > 0) {
      const parsedFilters = templateData.extra_filters.map((filter: string) => {
        const [key, ...valueParts] = filter.split('=');
        return { key, value: valueParts.join('=') };
      });
      setExtraFilters(parsedFilters);
    } else {
      setExtraFilters([{ key: "", value: "" }]);
    }

    // Convert environment variables from array to key-value pairs
    if (templateData.environment_variables && templateData.environment_variables.length > 0) {
      const parsedEnvVars = templateData.environment_variables.map((env: string) => {
        const [key, ...valueParts] = env.split('=');
        return { key, value: valueParts.join('=') };
      });
      setEnvVars(parsedEnvVars);
    } else {
      setEnvVars([{ key: "", value: "" }]);
    }

    // Convert disk space MB to GB/TB
    if (templateData.disk_space_mb) {
      if (templateData.disk_space_mb >= 1024) {
        setDiskSize(String(templateData.disk_space_mb / 1024));
        setDiskUnit("TB");
      } else {
        setDiskSize(String(templateData.disk_space_mb));
        setDiskUnit("GB");
      }
    }

    if (templateData.vram_required_gb) {
      setVramRequired(String(templateData.vram_required_gb));
    }

    if (templateData.docker_server_name || templateData.docker_username) {
      setShowDockerAuth(true);
    }
  }, [isOpen, templateData, templateId]);

  if (!isOpen) return null;

  const handleAddEnvVar = () => {
    setEnvVars([...envVars, { key: "", value: "" }]);
  };

  const handleEnvVarChange = (index: number, field: "key" | "value", value: string) => {
    const newEnvVars = [...envVars];
    newEnvVars[index][field] = value;
    setEnvVars(newEnvVars);
  };

  const handleRemoveEnvVar = (index: number) => {
    const newEnvVars = [...envVars];
    newEnvVars.splice(index, 1);
    setEnvVars(newEnvVars);
  };

  const handleAddExtraFilter = () => {
    setExtraFilters([...extraFilters, { key: "", value: "" }]);
  };

  const handleExtraFilterChange = (index: number, field: "key" | "value", value: string) => {
    const newFilters = [...extraFilters];
    newFilters[index][field] = value;
    setExtraFilters(newFilters);
  };

  const handleRemoveExtraFilter = (index: number) => {
    const newFilters = [...extraFilters];
    newFilters.splice(index, 1);
    setExtraFilters(newFilters);
  };

  const handleAddPort = () => {
    if (hostPort && containerPort) {
      if (portType === "not_specified") {
        // Add both TCP and UDP ports
        setPorts([...ports, `${hostPort}:${containerPort}:tcp`, `${hostPort}:${containerPort}:udp`]);
      } else {
        // Add single port with specified protocol
        setPorts([...ports, `${hostPort}:${containerPort}:${portType}`]);
      }
      setHostPort("");
      setContainerPort("");
    }
  };

  const handleRemovePort = (index: number) => {
    const newPorts = [...ports];
    newPorts.splice(index, 1);
    setPorts(newPorts);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Convert disk size to MB
      let diskSpaceMb = parseInt(diskSize);
      if (diskUnit === "TB") {
        diskSpaceMb = diskSpaceMb * 1024;
      }

      // Convert price to cents
      const maxPricePerHourCents = maxPricePerHour ? 
        Math.round(parseFloat(maxPricePerHour) * 100) : 0;

      // Filter out empty environment variables
      const filteredEnvVars = envVars.filter(env => env.key && env.value);

      // Filter out empty extra filters
      const filteredExtraFilters = extraFilters.filter(filter => filter.key && filter.value);

      const requestPayload = {
        template_name: templateName,
        template_description: description,
        image_path: imagePath,
        docker_options: dockerOptions,
        docker_server_name: dockerServer || undefined,
        docker_username: dockerUsername || undefined,
        docker_password: dockerToken || undefined,
        environment_variables: filteredEnvVars.length > 0 ?
          filteredEnvVars.map(env => `${env.key}=${env.value}`) : [],
        ports: ports,
        extra_filters: filteredExtraFilters.length > 0 ?
          filteredExtraFilters.map(filter => `${filter.key}=${filter.value}`) : [],
        disk_space_mb: diskSpaceMb,
        is_private: isPrivate,
        vram_required_gb: vramRequired ? parseInt(vramRequired) : 0,
        max_price_per_hour_cents: maxPricePerHourCents,
        on_start_script: onStartScript || undefined,
        readme: readme || undefined,
      };

      const isEditMode = !!templateId;
      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode ? `${API_BASE_URL}/templates/${templateId}` : `${API_BASE_URL}/templates`;

      console.log(`=== ${isEditMode ? 'UPDATE' : 'CREATE'} TEMPLATE REQUEST ===`);
      console.log('URL:', url);
      console.log('Method:', method);
      console.log('Payload:', requestPayload);
      console.log('User authenticated:', !!user);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id && { 'X-USER-ID': user.id.toString() }),
        },
        credentials: 'include',
        body: JSON.stringify(requestPayload),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} template (${response.status})`;
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

      // Handle UPDATE response (204 No Content)
      if (isEditMode && response.status === 204) {
        console.log('✓ Template updated successfully');
        console.log('==============================');
        setSuccess(`Template updated successfully!`);
        
        setTimeout(() => {
          onClose();
          setSuccess(null);
          if (onTemplateCreated) {
            onTemplateCreated();
          }
        }, 2000);
        return;
      }

      // Handle CREATE response (with body)
      const responseText = await response.text();
      console.log('Response body (raw):', responseText);

      if (!responseText) {
        throw new Error('Empty response from server');
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Response body (parsed):', data);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      if (data.id !== undefined) {
        console.log('✓ Template created successfully with ID:', data.id);
        console.log('==============================');
        setCreatedTemplateId(data.id);
        setSuccess(`Template created successfully! ID: ${data.id}`);
        
        // Reset form after 2 seconds and close
        setTimeout(() => {
          onClose();
          // Reset all form fields
          setTemplateName("");
          setDescription("");
          setImagePath("");
          setDockerOptions("");
          setHostPort("");
          setContainerPort("");
          setPorts([]);
          setEnvVars([{ key: "", value: "" }]);
          setOnStartScript("");
          setExtraFilters([{ key: "", value: "" }]);
          setDockerServer("");
          setDockerUsername("");
          setDockerToken("");
          setDiskSize("8");
          setDiskUnit("GB");
          setIsPrivate(true);
          setVramRequired("");
          setMaxPricePerHour("");
          setSuccess(null);
          setCreatedTemplateId(null);
          // Call the onTemplateCreated callback if provided
          if (onTemplateCreated) {
            onTemplateCreated();
          }
        }, 2000);
      } else {
        console.warn('No ID in response:', data);
        throw new Error('No template ID in response');
      }

    } catch (err: any) {
      console.error(`=== ${templateId ? 'UPDATE' : 'CREATE'} TEMPLATE ERROR ===`);
      console.error('Error type:', err.name);
      console.error('Error message:', err.message);
      console.error('Full error:', err);
      console.error('============================');
      
      let displayError = err.message || `Failed to ${templateId ? 'update' : 'create'} template`;
      
      if (err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch')) {
        displayError = 'Network error: Cannot connect to launchpad.swarmind.ai. Please check CORS configuration.';
      } else if (err.message?.includes('JSON')) {
        displayError = 'Server returned invalid response. Please contact support.';
      }

      setError(displayError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAndUse = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Convert disk size to MB
      let diskSpaceMb = parseInt(diskSize);
      if (diskUnit === "TB") {
        diskSpaceMb = diskSpaceMb * 1024;
      }

      // Convert price to cents
      const maxPricePerHourCents = maxPricePerHour ?
        Math.round(parseFloat(maxPricePerHour) * 100) : 0;

      // Filter out empty environment variables
      const filteredEnvVars = envVars.filter(env => env.key && env.value);

      // Filter out empty extra filters
      const filteredExtraFilters = extraFilters.filter(filter => filter.key && filter.value);

      const requestPayload = {
        template_name: templateName,
        template_description: description,
        image_path: imagePath,
        docker_options: dockerOptions,
        docker_server_name: dockerServer || undefined,
        docker_username: dockerUsername || undefined,
        docker_password: dockerToken || undefined,
        environment_variables: filteredEnvVars.length > 0 ?
          filteredEnvVars.map(env => `${env.key}=${env.value}`) : [],
        ports: ports,
        extra_filters: filteredExtraFilters.length > 0 ?
          filteredExtraFilters.map(filter => `${filter.key}=${filter.value}`) : [],
        disk_space_mb: diskSpaceMb,
        is_private: isPrivate,
        vram_required_gb: vramRequired ? parseInt(vramRequired) : 0,
        max_price_per_hour_cents: maxPricePerHourCents,
        on_start_script: onStartScript || undefined,
        readme: readme || undefined,
      };

      console.log('=== CREATE & USE TEMPLATE REQUEST ===');
      console.log('URL:', `${API_BASE_URL}/templates`);
      console.log('Payload:', requestPayload);

      const response = await fetch(`${API_BASE_URL}/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id && { 'X-USER-ID': user.id.toString() }),
        },
        credentials: 'include',
        body: JSON.stringify(requestPayload),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `Failed to create template (${response.status})`;
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

      const responseText = await response.text();
      console.log('Response body (raw):', responseText);

      if (!responseText) {
        throw new Error('Empty response from server');
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Response body (parsed):', data);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      if (data.id !== undefined) {
        console.log('✓ Template created successfully with ID:', data.id);
        console.log('Saving to context and navigating to /marketplace');
        console.log('==============================');

        // Save template to context
        setSelectedTemplate(data);

        // Close modal
        onClose();

        // Navigate to marketplace page
        navigate('/marketplace');

        // Call the onTemplateCreated callback if provided
        if (onTemplateCreated) {
          onTemplateCreated();
        }
      } else {
        console.warn('No ID in response:', data);
        throw new Error('No template ID in response');
      }

    } catch (err: any) {
      console.error('=== CREATE & USE TEMPLATE ERROR ===');
      console.error('Error type:', err.name);
      console.error('Error message:', err.message);
      console.error('Full error:', err);
      console.error('============================');

      let displayError = err.message || 'Failed to create template';

      if (err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch')) {
        displayError = 'Network error: Cannot connect to launchpad.swarmind.ai. Please check CORS configuration.';
      } else if (err.message?.includes('JSON')) {
        displayError = 'Server returned invalid response. Please contact support.';
      }

      setError(displayError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl text-slate-900">
            {isFetchingTemplate ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                Loading template...
              </div>
            ) : (
              templateId ? 'Edit Template' : 'Create New Template'
            )}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 px-6 pt-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("config")}
            className={`pb-3 px-1 border-b-2 transition ${
              activeTab === "config"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Config
          </button>
          <button
            onClick={() => setActiveTab("readme")}
            className={`pb-3 px-1 border-b-2 transition ${
              activeTab === "readme"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            ReadMe
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* API Feedback */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {activeTab === "config" ? (
            <div className="space-y-8">
              {/* Identification */}
              <div>
                <h3 className="text-lg mb-4 text-slate-900">Identification</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-2">
                      Template Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Your Template Name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-2">
                      Template Description
                    </label>
                    <input
                      type="text"
                      placeholder="Short Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* On-start Script */}
              <div>
                <h3 className="text-lg mb-2 text-slate-900">On-start Script</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Bash commands that are invoked whenever your instance starts, see FAQ/Docs for details.
                </p>
                <textarea
                  value={onStartScript}
                  onChange={(e) => setOnStartScript(e.target.value)}
                  className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="#!/bin/bash&#10;# Your startup commands here"
                />
              </div>

              {/* Extra Filters */}
              <div>
                <h3 className="text-lg mb-2 text-slate-900">Extra Filters</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Additional filters to apply when selecting GPU instances
                </p>
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="space-y-2">
                    {extraFilters.map((filter, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Property"
                          value={filter.key}
                          onChange={(e) =>
                            handleExtraFilterChange(index, "key", e.target.value)
                          }
                          className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Value"
                          value={filter.value}
                          onChange={(e) =>
                            handleExtraFilterChange(index, "value", e.target.value)
                          }
                          className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {extraFilters.length > 1 && (
                          <button
                            onClick={() => handleRemoveExtraFilter(index)}
                            className="px-3 py-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={handleAddExtraFilter}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Filter
                    </button>
                  </div>
                </div>
              </div>

              {/* VRAM Required */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    VRAM Required (GB)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 8, 16, 24"
                    value={vramRequired}
                    onChange={(e) => setVramRequired(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Disk Space */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg text-slate-900">
                    Disk Space (Container + Volume)
                  </h3>
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-slate-700 mb-2">
                    Container disk size (8 GB - 1024 TB)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={diskSize}
                      onChange={(e) => setDiskSize(e.target.value)}
                      className="w-32 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="8"
                      max="1024"
                    />
                    <div className="relative">
                      <select
                        value={diskUnit}
                        onChange={(e) => setDiskUnit(e.target.value)}
                        className="appearance-none px-4 py-2.5 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                      >
                        <option value="GB">GB</option>
                        <option value="TB">TB</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Public/Private Toggle */}
              <div className="pt-4">
                <div className="flex gap-3 mb-3">
                  <button
                    onClick={() => setIsPrivate(false)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition ${
                      !isPrivate
                        ? "border-slate-300 bg-white"
                        : "border-transparent bg-slate-100"
                    }`}
                  >
                    <LockOpen className="w-5 h-5" />
                    <span>Public</span>
                  </button>
                  <button
                    onClick={() => setIsPrivate(true)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition ${
                      isPrivate
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-transparent bg-slate-100"
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                    <span>Private</span>
                  </button>
                </div>
                {!isPrivate && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ Public template:</strong> All data in this template will be visible to everyone. Do not include sensitive information such as passwords, API keys, or private credentials.
                    </p>
                  </div>
                )}
              </div>

              {/* Docker Repository */}
              <div>
                <h3 className="text-lg mb-4 text-slate-900">
                  Docker Repository And Environment
                </h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Image Path
                      </label>
                      <input
                        type="text"
                        placeholder="ex: pytorch/pytorch, ubuntu/ubuntu"
                        value={imagePath}
                        onChange={(e) => setImagePath(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-slate-500 mt-1.5">
                        Grab these from Docker Hub, GHCR, etc.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Version Tag
                      </label>
                      <input
                        type="text"
                        placeholder="latest"
                        value={versionTag}
                        onChange={(e) => setVersionTag(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 mb-2">
                      Docker Options
                    </label>
                    <input
                      type="text"
                      placeholder="Docker create/run options ex: -e TZ=UTC -p 8081:8081 -h hostname"
                      value={dockerOptions}
                      onChange={(e) => setDockerOptions(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Ports */}
                  <div className="border border-slate-200 rounded-lg p-4">
                    <button
                      onClick={() => setShowPorts(!showPorts)}
                      className="flex items-center justify-between w-full mb-3"
                    >
                      <span className="text-sm text-slate-700">Ports</span>
                      <ChevronDown
                        className={`w-4 h-4 transition ${
                          showPorts ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {showPorts && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Host Port (e.g. 8080)"
                            value={hostPort}
                            onChange={(e) => setHostPort(e.target.value)}
                            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="Container Port (e.g. 80)"
                            value={containerPort}
                            onChange={(e) => setContainerPort(e.target.value)}
                            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex border border-slate-300 rounded-lg overflow-hidden">
                            <button
                              onClick={() => setPortType("not_specified")}
                              className={`px-4 py-2.5 transition ${
                                portType === "not_specified"
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              Not specified
                            </button>
                            <button
                              onClick={() => setPortType("tcp")}
                              className={`px-4 py-2.5 transition ${
                                portType === "tcp"
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              TCP
                            </button>
                            <button
                              onClick={() => setPortType("udp")}
                              className={`px-4 py-2.5 transition ${
                                portType === "udp"
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              UDP
                            </button>
                          </div>
                          <button
                            onClick={handleAddPort}
                            className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                    {ports.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm text-slate-700">Added Ports:</h4>
                        <ul className="list-disc pl-5">
                          {ports.map((port, index) => (
                            <li key={index} className="flex items-center">
                              {port}
                              <button
                                onClick={() => handleRemovePort(index)}
                                className="ml-2 px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Environment Variables */}
                  <div className="border border-slate-200 rounded-lg p-4">
                    <button
                      onClick={() => setShowEnvVars(!showEnvVars)}
                      className="flex items-center justify-between w-full mb-3"
                    >
                      <span className="text-sm text-slate-700">
                        Environment Variables
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition ${
                          showEnvVars ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {showEnvVars && (
                      <div className="space-y-2">
                        {envVars.map((envVar, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Key"
                              value={envVar.key}
                              onChange={(e) =>
                                handleEnvVarChange(index, "key", e.target.value)
                              }
                              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="Value"
                              value={envVar.value}
                              onChange={(e) =>
                                handleEnvVarChange(index, "value", e.target.value)
                              }
                              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {envVars.length > 1 && (
                              <button
                                onClick={() => handleRemoveEnvVar(index)}
                                className="px-3 py-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={handleAddEnvVar}
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add Variable
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Docker Repository Authentication (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg text-slate-900">
                    Docker Repository Authentication (Optional)
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showDockerAuth}
                      onChange={(e) => setShowDockerAuth(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">
                      Enable Authentication
                    </span>
                  </label>
                </div>
                
                {showDockerAuth && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Server
                      </label>
                      <input
                        type="text"
                        placeholder="Server name (i.e: docker.io)"
                        value={dockerServer}
                        onChange={(e) => setDockerServer(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Docker Username
                      </label>
                      <input
                        type="text"
                        placeholder="Docker Login Username"
                        value={dockerUsername}
                        onChange={(e) => setDockerUsername(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Docker Access Token
                      </label>
                      <input
                        type="password"
                        placeholder="Docker Login Access Token"
                        value={dockerToken}
                        onChange={(e) => setDockerToken(e.target.value)}
                        disabled={!isPrivate}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                README
              </label>
              <textarea
                value={readme}
                onChange={(e) => setReadme(e.target.value)}
                placeholder="Add your README content here..."
                className="w-full h-96 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            disabled={isLoading}
          >
            Cancel
          </button>
          {!templateId && (
            <>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </div>
                ) : (
                  'Create'
                )}
              </button>
              <button
                onClick={handleCreateAndUse}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </div>
                ) : (
                  'Create & Use'
                )}
              </button>
            </>
          )}
          {templateId && (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || isFetchingTemplate}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </div>
              ) : (
                'Update Template'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}