import { Search, Play, Edit, GitFork, Share2, Plus, MoreVertical, ExternalLink } from "lucide-react";
import { useState } from "react";
import { CreateTemplateModal } from "./create-template-modal";

const templates = [
  {
    id: 1,
    name: "NVIDIA CUDA",
    badge: "Serverspace",
    repo: "https://github.com/runpod-workers/runpod-worker-comfy",
    tags: ["CUDA 12.6", "SSH", "Jupyter"],
    icon: "V"
  },
  {
    id: 2,
    name: "PyTorch (Veed)",
    badge: "Registered",
    repo: "https://github.com/runpod-workers/runpod-worker-comfy",
    tags: ["CUDA 12.6", "SSH", "Jupyter"],
    icon: "🔥"
  },
  {
    id: 3,
    name: "Ubuntu 22.04 (VM)",
    badge: "Serverspace",
    repo: "https://github.com/runpod-workers/runpod-worker-comfy",
    tags: ["CUDA 12.6", "SSH", "Jupyter"],
    icon: "🐳"
  },
  {
    id: 4,
    name: "Ubuntu Desktop (VM)",
    badge: "Registered",
    repo: "https://github.com/runpod-workers/runpod-worker-comfy",
    tags: ["SSH", "VNC", "Jupyter"],
    icon: "🐳"
  },
  {
    id: 5,
    name: "Linux Desktop Container",
    badge: "Registered",
    repo: "https://github.com/runpod-workers/runpod-worker-comfy",
    tags: ["SSH", "Jupyter"],
    icon: "V"
  },
  {
    id: 6,
    name: "Pinokio (Desktop)",
    badge: "CUDASOFT",
    repo: "https://github.com/runpod-workers/runpod-worker-comfy",
    tags: ["CUDA 12.6", "SSH", "Jupyter"],
    icon: "V"
  },
  {
    id: 7,
    name: "vLLM",
    badge: "Serverspace",
    repo: "https://github.com/runpod-workers/runpod-worker-vllm",
    tags: ["CUDA 12.6", "SSH", "Jupyter"],
    icon: "V"
  },
  {
    id: 8,
    name: "SGLang",
    badge: "Registered",
    repo: "https://github.com/runpod-workers/runpod-worker-sglang",
    tags: ["CUDA 12.6", "SSH", "Jupyter"],
    icon: "V"
  },
  {
    id: 9,
    name: "Llama.cpp",
    badge: "Serverspace",
    repo: "https://github.com/runpod-workers/runpod-worker-llama",
    tags: ["CUDA 12.6", "SSH", "Jupyter"],
    icon: "V"
  },
  {
    id: 10,
    name: "Ollama",
    badge: "Registered",
    repo: "https://github.com/runpod-workers/runpod-worker-ollama",
    tags: ["API", "SSH", "Jupyter"],
    icon: "V"
  },
  {
    id: 11,
    name: "Open WebUI (Ollama)",
    badge: "Registered",
    repo: "https://github.com/runpod-workers/runpod-worker-openwebui",
    tags: ["SSH", "Jupyter"],
    icon: "V"
  },
  {
    id: 12,
    name: "Octobaboss Text Gen UI & API",
    badge: "CUDASOFT",
    repo: "https://github.com/runpod-workers/runpod-worker-textgen",
    tags: ["CUDA 12.6", "SSH", "Jupyter"],
    icon: "V"
  }
];

const filterTabs = ["Recommended", "My Templates", "Recent", "Popular", "Serverless", "All"];
const tagFilters = ["Tags", "LM", "GPT", "Agent", "img", "PYTORCH", "AUTO", "AMY"];

export function Templates() {
  const [activeTab, setActiveTab] = useState("All Templates");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
          <div className="text-sm text-slate-600 mb-4">
            {templates.length} available templates
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
        </div>
      </div>

      <CreateTemplateModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </section>
  );
}