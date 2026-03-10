import { Search, Play, Edit, GitFork, Share2, Plus, MoreVertical, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { CreateTemplateModal } from "./create-template-modal";
import { useAuth } from "../contexts/auth-context";

const API_BASE_URL = 'https://launchpad.swarmind.ai';

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

const filterTabs = ["Recommended", "My Templates", "Recent", "Popular", "Serverless", "All"];
const tagFilters = ["Tags", "LM", "GPT", "Agent", "img", "PYTORCH", "AUTO", "AMY"];

export function Templates() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("All Templates");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
        console.log('=== FETCH TEMPLATES REQUEST ===');
        console.log('URL:', `${API_BASE_URL}/templates`);
        console.log('User authenticated:', !!user);
        console.log('User:', user);

        const response = await fetch(`${API_BASE_URL}/templates`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
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

        let data: Template[];
        try {
          data = JSON.parse(responseText);
          console.log('Response body (parsed):', data);
          
          // Handle null or non-array responses
          if (!data) {
            console.log('Response is null, using empty array');
            data = [];
          } else if (!Array.isArray(data)) {
            console.log('Response is not an array:', typeof data);
            console.log('Converting to array or using empty array');
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
          displayError = 'Network error: Cannot connect to launchpad.swarmind.ai. Please check CORS configuration.';
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
  }, [user, refreshKey]);

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
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                    activeTab === tab
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tag Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {tagFilters.map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-md text-sm hover:bg-slate-200 transition whitespace-nowrap"
                >
                  {tag}
                </button>
              ))}
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
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-slate-300 transition group bg-white"
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

                    {/* GitHub Link */}
                    <a 
                      href={template.repo}
                      className="text-sm text-blue-600 hover:underline mb-3 block truncate"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {template.repo}
                    </a>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mb-3">
                      <button
                        className="flex items-center justify-center gap-1.5 p-2 bg-slate-100 hover:bg-slate-200 rounded transition"
                        title="Run"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        onClick={() => setEditingTemplateId(template.id)}
                        className="flex items-center justify-center gap-1.5 p-2 bg-slate-100 hover:bg-slate-200 rounded transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="flex items-center justify-center gap-1.5 p-2 bg-slate-100 hover:bg-slate-200 rounded transition"
                        title="Fork"
                      >
                        <GitFork className="w-4 h-4" />
                      </button>
                      <button
                        className="flex items-center justify-center gap-1.5 p-2 bg-slate-100 hover:bg-slate-200 rounded transition ml-auto"
                        title="More"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
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
        onClose={() => setIsCreateModalOpen(false)} 
        onTemplateCreated={() => setRefreshKey(prev => prev + 1)}
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
    </section>
  );
}