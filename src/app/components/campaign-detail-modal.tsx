import { X, Calendar, Users, Target, Zap, Check } from "lucide-react";
import { useState } from "react";

interface CampaignDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: any;
}

export function CampaignDetailModal({ isOpen, onClose, campaign }: CampaignDetailModalProps) {
  const [contributionAmount, setContributionAmount] = useState("");

  if (!isOpen || !campaign) return null;

  const fundingPercentage = (campaign.currentFunding / campaign.fundingGoal) * 100;
  const daysLeft = Math.max(0, Math.floor((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle contribution logic
    alert(`Contributing $${contributionAmount} to ${campaign.title}`);
    setContributionAmount("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex-1 pr-8">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-semibold text-slate-900">{campaign.title}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                campaign.status === "active" ? "bg-green-100 text-green-700" :
                campaign.status === "funded" ? "bg-blue-100 text-blue-700" :
                "bg-slate-100 text-slate-700"
              }`}>
                {campaign.status}
              </span>
            </div>
            <p className="text-sm text-slate-500">by {campaign.creator}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="col-span-2 space-y-6">
              {/* Funding Progress */}
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <div className="mb-4">
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <div className="text-3xl font-semibold text-slate-900">
                        ${campaign.currentFunding.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-500">
                        of ${campaign.fundingGoal.toLocaleString()} goal
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold text-blue-600">
                        {fundingPercentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-500">funded</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-900">{campaign.contributors}</div>
                      <div className="text-sm text-slate-500">Contributors</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-900">{daysLeft} days</div>
                      <div className="text-sm text-slate-500">Remaining</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-slate-900 mb-3">About This Campaign</h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {campaign.description}
                </p>
              </div>

              {/* Hardware Requirements */}
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Hardware Requirements</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">GPU Model</div>
                      <div className="font-medium text-slate-900">{campaign.gpuModel}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Instances</div>
                      <div className="font-medium text-slate-900">{campaign.instanceCount}x</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Duration</div>
                      <div className="font-medium text-slate-900">{campaign.duration} {campaign.durationUnit}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">$</span>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Max Price/Hr</div>
                      <div className="font-medium text-slate-900">${campaign.maxPricePerHour}/hr</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Training Template</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{campaign.templateName}</div>
                    <div className="text-sm text-slate-500">Framework: {campaign.templateLanguage}</div>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded text-sm">
                    {campaign.templateLanguage}
                  </span>
                </div>
              </div>

              {/* Additional Info */}
              {(campaign.publicResults || campaign.openSource) && (
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Commitments</h3>
                  <div className="space-y-2">
                    {campaign.publicResults && (
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Check className="w-4 h-4 text-green-600" />
                        Training results will be shared publicly
                      </div>
                    )}
                    {campaign.openSource && (
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Check className="w-4 h-4 text-green-600" />
                        Trained model will be released as open source
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Contribution */}
            <div className="col-span-1">
              <div className="sticky top-24">
                {/* Contribution Card */}
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Support This Campaign</h3>
                  
                  <form onSubmit={handleContribute} className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Contribution Amount (USD)
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="1"
                          value={contributionAmount}
                          onChange={(e) => setContributionAmount(e.target.value)}
                          required
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="100.00"
                        />
                      </div>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      {[50, 100, 500].map(amount => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setContributionAmount(amount.toString())}
                          className="px-3 py-2 border border-slate-300 rounded-lg text-sm hover:border-blue-500 hover:bg-blue-50 transition"
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Contribute Now
                    </button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Your contribution helps:</span>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Fund GPU compute time</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Support open research</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Advance AI development</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="mt-4 text-center">
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                    {campaign.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
