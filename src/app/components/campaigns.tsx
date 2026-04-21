import { useState } from "react";
import { Plus, TrendingUp, Users, Calendar, Target } from "lucide-react";
import { ModelParametersModal } from "./model-parameters-modal";
import { CreateCampaignModal } from "./create-campaign-modal";
import { CampaignDetailModal } from "./campaign-detail-modal";

// Mock campaign data
const mockCampaigns = [
  {
    id: "1",
    title: "Train LLaMA 3.1 70B for Medical Research",
    description: "We're training a specialized version of LLaMA 3.1 70B on medical research papers and clinical data to assist healthcare professionals with diagnostics and treatment recommendations. This model will be released as open source to benefit the medical community worldwide.",
    category: "LLM Training",
    creator: "Dr. Sarah Chen",
    
    gpuModel: "H100",
    instanceCount: 1024,
    duration: 37,
    durationUnit: "days",
    maxPricePerHour: 1.78,
    
    templateName: "LLaMA 3.1 Training",
    templateLanguage: "Python",
    
    fundingGoal: 1600000,
    currentFunding: 856000,
    contributors: 342,
    status: "active",
    
    publicResults: true,
    openSource: true,
    
    createdAt: "2026-01-15",
    deadline: "2026-03-15",
  },
  {
    id: "2",
    title: "Fine-tune GPT-4 for Legal Document Analysis",
    description: "Training a specialized legal AI to analyze contracts, case law, and legal documents. The model will help lawyers and legal professionals save time on document review and legal research.",
    category: "LLM Fine-tuning",
    creator: "LegalTech AI",
    
    gpuModel: "A100",
    instanceCount: 256,
    duration: 14,
    durationUnit: "days",
    maxPricePerHour: 1.20,
    
    templateName: "GPT-4 Fine-tuning",
    templateLanguage: "Python",
    
    fundingGoal: 120960,
    currentFunding: 98450,
    contributors: 127,
    status: "active",
    
    publicResults: true,
    openSource: false,
    
    createdAt: "2026-01-20",
    deadline: "2026-02-28",
  },
  {
    id: "3",
    title: "Stable Diffusion XL - Anime Art Generator",
    description: "Training Stable Diffusion XL on high-quality anime artwork to create a specialized model for anime artists and enthusiasts. The model will be able to generate consistent character designs and artwork in various anime styles.",
    category: "Image Generation",
    creator: "AnimeAI Collective",
    
    gpuModel: "RTX 5090",
    instanceCount: 64,
    duration: 21,
    durationUnit: "days",
    maxPricePerHour: 0.45,
    
    templateName: "Stable Diffusion XL",
    templateLanguage: "Python",
    
    fundingGoal: 14515,
    currentFunding: 14680,
    contributors: 891,
    status: "funded",
    
    publicResults: true,
    openSource: true,
    
    createdAt: "2026-01-05",
    deadline: "2026-02-10",
  },
  {
    id: "4",
    title: "Mistral 7B for Code Generation",
    description: "Fine-tuning Mistral 7B specifically for code generation, debugging, and documentation. Optimized for JavaScript, Python, and Rust development workflows.",
    category: "LLM Fine-tuning",
    creator: "DevTools AI",
    
    gpuModel: "RTX 4090",
    instanceCount: 32,
    duration: 10,
    durationUnit: "days",
    maxPricePerHour: 0.35,
    
    templateName: "Mistral 7B",
    templateLanguage: "Python",
    
    fundingGoal: 2688,
    currentFunding: 1245,
    contributors: 58,
    status: "active",
    
    publicResults: true,
    openSource: true,
    
    createdAt: "2026-01-25",
    deadline: "2026-02-25",
  },
  {
    id: "5",
    title: "Climate Research LLM - 70B Parameters",
    description: "Training a large language model on climate science papers, environmental data, and climate models to assist researchers in understanding and predicting climate change patterns.",
    category: "Research",
    creator: "Climate Science Initiative",
    
    gpuModel: "H100",
    instanceCount: 512,
    duration: 30,
    durationUnit: "days",
    maxPricePerHour: 1.85,
    
    templateName: "LLaMA 3.1 Training",
    templateLanguage: "Python",
    
    fundingGoal: 684000,
    currentFunding: 312000,
    contributors: 176,
    status: "active",
    
    publicResults: true,
    openSource: true,
    
    createdAt: "2026-01-10",
    deadline: "2026-03-10",
  },
];

export function Campaigns() {
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [isParametersModalOpen, setIsParametersModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modelData, setModelData] = useState<any>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("trending");

  const handleParametersContinue = (data: { modelParameters: number; datasetTokens: number; estimatedFLOPs: number }) => {
    setModelData(data);
    setIsParametersModalOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleCreateCampaign = (campaignData: any) => {
    const newCampaign = {
      ...campaignData,
      id: String(campaigns.length + 1),
      creator: "You",
      currentFunding: 0,
      contributors: 0,
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + parseInt(campaignData.campaignDuration) * 24 * 60 * 60 * 1000).toISOString(),
      templateName: mockCampaigns[0].templateName,
      templateLanguage: "Python",
      modelParameters: modelData?.modelParameters,
      datasetTokens: modelData?.datasetTokens,
      estimatedFLOPs: modelData?.estimatedFLOPs,
    };
    setCampaigns([newCampaign, ...campaigns]);
    setModelData(null);
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "active") return campaign.status === "active";
    if (selectedFilter === "funded") return campaign.status === "funded";
    return campaign.category === selectedFilter;
  });

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    if (sortBy === "trending") {
      return (b.currentFunding / b.fundingGoal) - (a.currentFunding / a.fundingGoal);
    }
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "ending") {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    return 0;
  });

  const totalFunded = campaigns.reduce((sum, c) => sum + c.currentFunding, 0);
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const totalContributors = campaigns.reduce((sum, c) => sum + c.contributors, 0);

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 mb-2">Crowdfunding Campaigns</h1>
              <p className="text-slate-600">Support LLM training projects through community funding</p>
            </div>
            <button
              onClick={() => setIsParametersModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Create Campaign
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Total Funded</div>
              <div className="text-2xl font-semibold text-slate-900">
                ${(totalFunded / 1000000).toFixed(2)}M
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Active Campaigns</div>
              <div className="text-2xl font-semibold text-green-600">{activeCampaigns}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Total Contributors</div>
              <div className="text-2xl font-semibold text-blue-600">{totalContributors}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Success Rate</div>
              <div className="text-2xl font-semibold text-slate-900">87%</div>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "funded", label: "Funded" },
                { value: "LLM Training", label: "LLM Training" },
                { value: "LLM Fine-tuning", label: "Fine-tuning" },
                { value: "Image Generation", label: "Image Gen" },
                { value: "Research", label: "Research" }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    selectedFilter === filter.value
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="trending">Trending</option>
              <option value="newest">Newest</option>
              <option value="ending">Ending Soon</option>
            </select>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedCampaigns.map(campaign => {
            const fundingPercentage = (campaign.currentFunding / campaign.fundingGoal) * 100;
            const daysLeft = Math.max(0, Math.floor((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

            return (
              <div
                key={campaign.id}
                onClick={() => setSelectedCampaign(campaign)}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-slate-900 mb-1 pr-4">{campaign.title}</h3>
                    <p className="text-sm text-slate-600">by {campaign.creator}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    campaign.status === "active" ? "bg-green-100 text-green-700" :
                    campaign.status === "funded" ? "bg-blue-100 text-blue-700" :
                    "bg-slate-100 text-slate-700"
                  }`}>
                    {campaign.status}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {campaign.description}
                </p>

                {/* Hardware Info */}
                <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-slate-400" />
                    <div className="text-xs">
                      <div className="text-slate-500">GPU</div>
                      <div className="font-medium text-slate-900">{campaign.instanceCount}x {campaign.gpuModel}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div className="text-xs">
                      <div className="text-slate-500">Duration</div>
                      <div className="font-medium text-slate-900">{campaign.duration} {campaign.durationUnit}</div>
                    </div>
                  </div>
                </div>

                {/* Funding Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-lg font-semibold text-slate-900">
                        ${(campaign.currentFunding / 1000).toFixed(0)}K
                      </span>
                      <span className="text-sm text-slate-500">
                        of ${(campaign.fundingGoal / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <span className="text-sm font-medium text-blue-600">
                      {fundingPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        fundingPercentage >= 100 ? "bg-green-600" : "bg-blue-600"
                      }`}
                      style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Users className="w-4 h-4" />
                      <span>{campaign.contributors}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>{daysLeft} days left</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                    {campaign.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {sortedCampaigns.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No campaigns found</h3>
            <p className="text-slate-600 mb-4">
              {selectedFilter === "all" 
                ? "Be the first to create a crowdfunding campaign"
                : `No ${selectedFilter} campaigns at the moment`
              }
            </p>
            {selectedFilter === "all" && (
              <button
                onClick={() => setIsParametersModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create Campaign
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <ModelParametersModal
        isOpen={isParametersModalOpen}
        onClose={() => setIsParametersModalOpen(false)}
        onContinue={handleParametersContinue}
      />

      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setModelData(null);
        }}
        onSubmit={handleCreateCampaign}
        modelData={modelData}
      />

      <CampaignDetailModal
        isOpen={!!selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
        campaign={selectedCampaign}
      />
    </div>
  );
}
