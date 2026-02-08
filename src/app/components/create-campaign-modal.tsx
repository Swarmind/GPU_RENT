import { X } from "lucide-react";
import { useState } from "react";

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (campaign: any) => void;
}

// Mock templates from the Templates page
const availableTemplates = [
  { id: "1", name: "LLaMA 3.1 Training", language: "Python" },
  { id: "2", name: "GPT-4 Fine-tuning", language: "Python" },
  { id: "3", name: "Stable Diffusion XL", language: "Python" },
  { id: "4", name: "Mistral 7B", language: "Python" },
  { id: "5", name: "Custom PyTorch", language: "Python" },
];

const gpuOptions = [
  "H100",
  "A100",
  "RTX 5090",
  "RTX 4090",
  "RTX PRO 6000",
  "V100",
];

export function CreateCampaignModal({ isOpen, onClose, onSubmit }: CreateCampaignModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "LLM Training",
    
    // Hardware Requirements
    gpuModel: "H100",
    instanceCount: "",
    duration: "",
    durationUnit: "days",
    maxPricePerHour: "",
    
    // Template
    templateId: "",
    
    // Funding
    fundingGoal: "",
    campaignDuration: "",
    campaignDurationUnit: "days",
    
    // Additional Info
    publicResults: true,
    openSource: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const calculateEstimatedCost = () => {
    const instances = parseInt(formData.instanceCount) || 0;
    const duration = parseInt(formData.duration) || 0;
    const pricePerHour = parseFloat(formData.maxPricePerHour) || 0;
    
    let hours = duration;
    if (formData.durationUnit === "days") hours = duration * 24;
    if (formData.durationUnit === "months") hours = duration * 24 * 30;
    
    return instances * hours * pricePerHour;
  };

  const estimatedCost = calculateEstimatedCost();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      fundingGoal: formData.fundingGoal || estimatedCost.toString(),
      estimatedCost,
      currentFunding: 0,
      contributors: 0,
      status: "active",
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Create Crowdfunding Campaign</h2>
            <p className="text-sm text-slate-500 mt-1">Launch a campaign to crowdfund your LLM training</p>
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
          {/* Campaign Information */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Campaign Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Campaign Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Train LLaMA 3.1 70B for Medical Research"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your project, its goals, and why it needs crowdfunding..."
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LLM Training">LLM Training</option>
                  <option value="LLM Fine-tuning">LLM Fine-tuning</option>
                  <option value="Image Generation">Image Generation</option>
                  <option value="Research">Research</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hardware Requirements */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Hardware Requirements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  GPU Model <span className="text-red-500">*</span>
                </label>
                <select
                  name="gpuModel"
                  value={formData.gpuModel}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {gpuOptions.map(gpu => (
                    <option key={gpu} value={gpu}>{gpu}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Number of Instances <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="instanceCount"
                  value={formData.instanceCount}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1024"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Duration <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    min="1"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="37"
                  />
                  <select
                    name="durationUnit"
                    value={formData.durationUnit}
                    onChange={handleChange}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Max Price per Hour per Instance <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    name="maxPricePerHour"
                    value={formData.maxPricePerHour}
                    onChange={handleChange}
                    required
                    min="0"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1.78"
                  />
                  <span className="text-slate-500">/hr</span>
                </div>
              </div>
            </div>

            {/* Estimated Cost Display */}
            {estimatedCost > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Estimated Total Cost:</span>
                  <span className="text-2xl font-semibold text-blue-600">
                    ${estimatedCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {formData.instanceCount}x {formData.gpuModel} × {formData.duration} {formData.durationUnit} × ${formData.maxPricePerHour}/hr
                </p>
              </div>
            )}
          </div>

          {/* Template Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Training Template</h3>
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                Select Template <span className="text-red-500">*</span>
              </label>
              <select
                name="templateId"
                value={formData.templateId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a template...</option>
                {availableTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.language})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-2">
                Select the training template that will be used for this campaign
              </p>
            </div>
          </div>

          {/* Funding Details */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Funding Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Funding Goal (USD)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    name="fundingGoal"
                    value={formData.fundingGoal}
                    onChange={handleChange}
                    min="0"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={estimatedCost > 0 ? estimatedCost.toFixed(2) : "Auto-calculated"}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Leave blank to use estimated cost
                </p>
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Campaign Duration <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="campaignDuration"
                    value={formData.campaignDuration}
                    onChange={handleChange}
                    required
                    min="1"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="30"
                  />
                  <select
                    name="campaignDurationUnit"
                    value={formData.campaignDurationUnit}
                    onChange={handleChange}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                  </select>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  How long will the campaign run?
                </p>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Additional Options</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="publicResults"
                  checked={formData.publicResults}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Share training results publicly</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="openSource"
                  checked={formData.openSource}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Release trained model as open source</span>
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
              Create Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
