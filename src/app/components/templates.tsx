import { Search, Play, Edit, GitFork, Share2, Plus, MoreVertical, ExternalLink, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { CreateTemplateModal } from "./create-template-modal";
import { TemplateDetailModal } from "./template-detail-modal";
import { useAuth } from "../contexts/auth-context";
import { useTemplate } from "../contexts/template-context";
import { useNavigate } from "react-router";
import { API_BASE_URL } from "../config/api";

interface Template {
  id: number;
  template_name: string;
  template_description?: string;
  image_path: string;
  docker_options?: string;
  docker_server_name?: string;
  docker_username?: string;
  docker_password?: string;
  environment_variables?: string[];
  ports?: string[];
  extra_filters?: string[];
  disk_space_mb?: number;
  is_private?: boolean;
  max_price_per_hour_cents?: number;
  on_start_script?: string;
  readme?: string;
  vram_required_gb?: number;
  user_id?: number;
}

const mockTemplates = [
  {
    id: 1,
    template_name: "NVIDIA CUDA",
    badge: "Serverspace",
    repo: "https://github.com/runpod-workers/runpod-worker-comfy",
    tags: ["CUDA 12.6", "SSH", "Jupyter"],
    icon: "V"
  },
  {
    id: 2,
    template_name: "PyTorch (Veed)",
    badge: "Registered",
    repo: "https://github.com/runpod-workers/runpod-worker-comfy",
    tags: ["CUDA 12.6", "SSH", "Jupyter"],
    icon: "🔥"
  },
  {
    id: 3,
    template_name: "Ubuntu 22.04 (VM)",
    badge: "Serverspace",
    repo: "https://github.com/runpod-workers/runpod-worker-comfy",
    tags: ["CUDA 12.6", "SSH", "Jupyter"],
    icon: "🐳"
  },
  {
    id: 4,
    template_name: "Ubuntu Desktop (VM)",
    badge: "Registered",
    repo: "https://github.com/runpod-workers/runpod-worker-comfy",
    tags: ["SSH", "VNC", "Jupyter"],
    icon: "🐳"
  },
  {
    id: 5,
    template_name: "Linux Desktop Container",
    badge: "Registered",
    repo: "https://github.com/runpod-workers/runpod-worker-comfy",
    tags: ["SSH", "Jupyter"],
    icon: "V"
  },
  {
    id: 6,
    template_name: "Pinokio (Desktop)",
    badge: "CUDASOFT",
    repo: "https://github.com/runpod-workers/runpod-worker-comfy",
    tags: ["CUDA 12.6", "SSH", "Jupyter"],
    icon: "V"
  },
  {
    id: 7,
    template_name: "vLLM",
    badge: "Serverspace",
    repo: "https://github.com/runpod-workers/runpod-worker-vllm",
    tags: ["CUDA 12.6", "SSH", "Jupyter"],
    icon: "V"
  },
  {
    id: 8,
    template_name: "SGLang",
    badge: "Registered",
    repo: "https://github.com/runpod-workers/runpod-worker-sglang",
    tags: ["CUDA 12.6", "SSH", "Jupyter"],
    icon: "V"
  },
  {
    id: 9,
    template_name: "Llama.cpp",
    badge: "Serverspace",
    repo: "https://github.com/runpod-workers/runpod-worker-llama",
    tags: ["CUDA 12.6", "SSH", "Jupyter"],
    icon: "V"
  },
  {
    id: 10,
    template_name: "Ollama",
    badge: "Registered",
    repo: "https://github.com/runpod-workers/runpod-worker-ollama",
    tags: ["API", "SSH", "Jupyter"],
    icon: "V"
  },
  {
    id: 11,
    template_name: "Open WebUI (Ollama)",
    badge: "Registered",
    repo: "https://github.com/runpod-workers/runpod-worker-openwebui",
    tags: ["SSH", "Jupyter"],
    icon: "V"
  },
  {
    id: 12,
    template_name: "Octobaboss Text Gen UI & API",
    badge: "CUDASOFT",
    repo: "https://github.com/runpod-workers/runpod-worker-textgen",
    tags: ["CUDA 12.6", "SSH", "Jupyter"],
    icon: "V"
  }
];

export function Templates() {
  const { user } = useAuth();
  const { setSelectedTemplate } = useTemplate();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20); // Items per page
  const [showPrivateOnly, setShowPrivateOnly] = useState(false);
  const [selectedTemplateDetail, setSelectedTemplateDetail] = useState<any>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [forkingTemplate, setForkingTemplate] = useState<any>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const handleTemplateClick = async (templateId: number) => {
    if (!user) {
      // For mock data, just use the existing template
      const template = templates.find(t => t.id === templateId);
      setSelectedTemplateDetail(template);
      return;
    }

    setIsLoadingDetail(true);
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id && { 'X-USER-ID': user.id.toString() }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch template details (${response.status})`);
      }

      const data = await response.json();
      console.log('Template detail:', data);
      setSelectedTemplateDetail(data);
    } catch (err: any) {
      console.error('Error fetching template details:', err);
      // Fallback to using the list data
      const template = templates.find(t => t.id === templateId);
      setSelectedTemplateDetail(template);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleForkTemplate = (template: any) => {
    // Prepare template data for forking (create a copy)
    setForkingTemplate({
      ...template,
      template_name: `${template.template_name} (Copy)`,
      is_private: true, // Make fork private by default
      // Clear sensitive data
      docker_password: '',
      // Clear environment variable values but keep keys
      environment_variables: (template.environment_variables || []).map((env: string) => {
        const [key] = env.split('=');
        return `${key}=`;
      }),
    });
    setEditingTemplateId(null); // Clear editing mode when forking
    setIsCreateModalOpen(true);
  };

  const handleEditTemplate = (templateId: number) => {
    setEditingTemplateId(templateId);
    setForkingTemplate(null); // Clear forking data when editing
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!user) return;

    try {
      console.log('=== DELETE TEMPLATE REQUEST ===');
      console.log('Template ID:', templateId);
      console.log('URL:', `${API_BASE_URL}/templates/${templateId}`);

      const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id && { 'X-USER-ID': user.id.toString() }),
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`Failed to delete template (${response.status})`);
      }

      console.log('✓ Template deleted successfully');
      console.log('==============================');

      // Refresh template list
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      console.error('=== DELETE TEMPLATE ERROR ===');
      console.error('Error:', err);
      console.error('============================');
      setError(`Failed to delete template: ${err.message}`);
    }
  };

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, showPrivateOnly]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdownId !== null) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdownId]);

  useEffect(() => {
    const fetchTemplates = async () => {
      // If user is not logged in, use mock data
      if (!user) {
        console.log('=== TEMPLATES: User not authenticated, using mock data ===');
        setTemplates(mockTemplates);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Build query parameters
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
        });

        // Add search parameter if present
        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim());
        }

        // Add is_private parameter only when filtering for private templates
        if (showPrivateOnly) {
          params.append('is_private', 'true');
        }

        const url = `${API_BASE_URL}/templates?${params.toString()}`;
        
        console.log('=== FETCH TEMPLATES REQUEST ===');
        console.log('URL:', url);
        console.log('Page:', currentPage);
        console.log('Limit:', limit);
        console.log('Search:', searchQuery);
        console.log('Show Private Only:', showPrivateOnly);
        console.log('User authenticated:', !!user);
        console.log('User:', user);

        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(user?.id && { 'X-USER-ID': user.id.toString() }),
          },
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          let errorMessage = `Failed to fetch templates (${response.status})`;
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

        let data: any;
        try {
          const parsed = JSON.parse(responseText);
          console.log('Response body (parsed):', parsed);

          // Handle different response formats
          if (!parsed) {
            console.log('Response is null, using empty array');
            data = [];
          } else if (Array.isArray(parsed)) {
            // Direct array response
            console.log('Response is array, count:', parsed.length);
            data = parsed;
          } else if (parsed.items && Array.isArray(parsed.items)) {
            // Response with items property: { items: [...], pagination: {...} }
            console.log('Response has items array, count:', parsed.items.length);
            data = parsed.items;

            // Handle pagination if present
            if (parsed.pagination) {
              console.log('Pagination info:', parsed.pagination);
              setTotalPages(parsed.pagination.total_pages || 1);
            }
          } else {
            console.log('Response is not an array and has no items:', typeof parsed);
            console.log('Using empty array');
            data = [];
          }

          console.log('Number of templates:', data.length);
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError);
          throw new Error('Invalid JSON response from server');
        }

        // Transform API data to display format
        const transformedTemplates = data.map((template) => ({
          id: template.id,
          name: template.template_name,
          template_name: template.template_name,
          description: template.template_description,
          badge: template.is_private ? "Private" : "Public",
          repo: template.image_path ? `Image: ${template.image_path}` : "No image path",
          tags: [
            ...(template.ports || []).slice(0, 3),
            ...(template.environment_variables || []).slice(0, 2).map(env => env.split('=')[0]),
          ].slice(0, 3),
          icon: template.image_path?.includes('pytorch') ? '🔥' : 
                template.image_path?.includes('ubuntu') ? '🐳' : 
                template.image_path?.includes('cuda') ? 'V' : '📦',
          // Keep original data for detail view
          ...template
        }));

        console.log('✓ Templates loaded successfully:', transformedTemplates.length);
        console.log('Transformed templates:', transformedTemplates);
        console.log('==============================');
        
        setTemplates(transformedTemplates);

      } catch (err: any) {
        console.error('=== FETCH TEMPLATES ERROR ===');
        console.error('Error type:', err.name);
        console.error('Error message:', err.message);
        console.error('Full error:', err);
        console.error('============================');
        
        let displayError = err.message || 'Failed to fetch templates';

        if (err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch')) {
          displayError = `Network error: Cannot connect to API (${API_BASE_URL}). Check proxy/CORS configuration.`;
        } else if (err.message?.includes('JSON')) {
          displayError = 'Server returned invalid response. Please contact support.';
        }
        
        setError(displayError);
        // Fallback to mock data on error
        console.log('Falling back to mock data due to error');
        setTemplates(mockTemplates);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [user, refreshKey, currentPage, searchQuery, showPrivateOnly]);

  return (
    <section className="bg-slate-50 py-20">
      <div className="container mx-auto px-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl text-slate-900">Templates</h2>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                New
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Show My Templates Checkbox */}
            <div className="flex items-center gap-2 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrivateOnly}
                  onChange={(e) => setShowPrivateOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Show only my templates</span>
              </label>
            </div>
          </div>

          {/* Templates Grid */}
          {error && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-700">{error}</p>
                <p className="text-xs text-yellow-600 mt-1">Showing mock data instead.</p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-600">Loading templates...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="text-sm text-slate-600 mb-4">
                {templates.length} available templates
                {!user && <span className="text-slate-400 ml-2">(mock data - login to see your templates)</span>}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateClick(template.id)}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-blue-400 transition group bg-white cursor-pointer"
                  >
                    {/* Header with badge and icon */}
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-2 py-0.5 bg-slate-900 text-white text-xs rounded">
                        {template.badge}
                      </span>
                      <div className="text-2xl font-bold text-slate-900">
                        {template.icon}
                      </div>
                    </div>

                    {/* Template Name */}
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-slate-900 group-hover:text-blue-600 transition">
                        {template.name}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mb-3">
                      <button
                        className="flex items-center justify-center gap-1.5 p-2 bg-slate-100 hover:bg-slate-200 rounded transition"
                        title="Run"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTemplate(template);
                          navigate('/marketplace');
                        }}
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                      {template.is_private && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTemplateId(template.id);
                          }}
                          className="flex items-center justify-center gap-1.5 p-2 bg-slate-100 hover:bg-slate-200 rounded transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {!template.is_private && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleForkTemplate(template);
                          }}
                          className="flex items-center justify-center gap-1.5 p-2 bg-slate-100 hover:bg-slate-200 rounded transition"
                          title="Fork"
                        >
                          <GitFork className="w-4 h-4" />
                        </button>
                      )}
                      {user && template.user_id === user.id && (
                      <div className="relative ml-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === template.id ? null : template.id);
                          }}
                          className="flex items-center justify-center gap-1.5 p-2 bg-slate-100 hover:bg-slate-200 rounded transition"
                          title="More"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openDropdownId === template.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTemplate(template.id);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Are you sure you want to delete template "${template.template_name}"?`)) {
                                  handleDeleteTemplate(template.id);
                                }
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex gap-1 flex-wrap">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setForkingTemplate(null);
        }}
        onTemplateCreated={() => {
          setRefreshKey(prev => prev + 1);
          setForkingTemplate(null);
        }}
        templateData={forkingTemplate}
      />
      
      {editingTemplateId && (
        <CreateTemplateModal 
          isOpen={true}
          templateId={editingTemplateId}
          onClose={() => setEditingTemplateId(null)} 
          onTemplateCreated={() => {
            setRefreshKey(prev => prev + 1);
            setEditingTemplateId(null);
          }}
        />
      )}

      <TemplateDetailModal
        isOpen={!!selectedTemplateDetail}
        onClose={() => setSelectedTemplateDetail(null)}
        template={selectedTemplateDetail}
        isLoading={isLoadingDetail}
        onForkTemplate={handleForkTemplate}
        onEditTemplate={handleEditTemplate}
        onDeleteTemplate={handleDeleteTemplate}
      />
    </section>
  );
}