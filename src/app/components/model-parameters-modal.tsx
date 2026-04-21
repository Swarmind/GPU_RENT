import { X, Info } from "lucide-react";
import { useState } from "react";

interface ModelParametersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (data: { modelParameters: number; datasetTokens: number; estimatedFLOPs: number }) => void;
}

export function ModelParametersModal({ isOpen, onClose, onContinue }: ModelParametersModalProps) {
  const [modelParameters, setModelParameters] = useState("");
  const [datasetTokens, setDatasetTokens] = useState("");
  const [useOptimalTokens, setUseOptimalTokens] = useState(true);

  // Calculate FLOPs using the formula: FLOPs ≈ 6 × N × D
  const calculateFLOPs = (params: number, tokens: number): number => {
    return 6 * params * tokens;
  };

  // Chinchilla optimal: D ≈ 20 × N
  const getOptimalTokens = (params: number): number => {
    return params * 20;
  };

  const paramsInBillions = parseFloat(modelParameters) || 0;
  const paramsTotal = paramsInBillions * 1e9;

  const tokensInBillions = useOptimalTokens
    ? getOptimalTokens(paramsTotal) / 1e9
    : parseFloat(datasetTokens) || 0;
  const tokensTotal = tokensInBillions * 1e9;

  const estimatedFLOPs = paramsTotal > 0 && tokensTotal > 0
    ? calculateFLOPs(paramsTotal, tokensTotal)
    : 0;

  const formatFLOPs = (flops: number): string => {
    if (flops === 0) return "0";
    if (flops >= 1e24) return `${(flops / 1e24).toFixed(2)} YottaFLOPs`;
    if (flops >= 1e21) return `${(flops / 1e21).toFixed(2)} ZettaFLOPs`;
    if (flops >= 1e18) return `${(flops / 1e18).toFixed(2)} ExaFLOPs`;
    if (flops >= 1e15) return `${(flops / 1e15).toFixed(2)} PetaFLOPs`;
    if (flops >= 1e12) return `${(flops / 1e12).toFixed(2)} TeraFLOPs`;
    return `${flops.toExponential(2)} FLOPs`;
  };

  const handleContinue = () => {
    if (paramsInBillions > 0) {
      onContinue({
        modelParameters: paramsInBillions,
        datasetTokens: tokensInBillions,
        estimatedFLOPs,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Model Training Calculator</h2>
            <p className="text-sm text-slate-500 mt-1">Estimate compute requirements for your training campaign</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">How it works</p>
              <p>
                We use the formula <strong>FLOPs ≈ 6 × N × D</strong> where N is the number of parameters
                and D is the dataset size in tokens. Following Chinchilla scaling laws, we recommend using
                approximately 20× more tokens than parameters for optimal training efficiency.
              </p>
            </div>
          </div>

          {/* Model Parameters Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Model Parameters (in billions)
            </label>
            <input
              type="number"
              value={modelParameters}
              onChange={(e) => setModelParameters(e.target.value)}
              placeholder="e.g., 7, 13, 70, 175"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.1"
            />
            <p className="text-xs text-slate-500 mt-1">
              Examples: LLaMA 2 (7B, 13B, 70B), GPT-3 (175B), GPT-4 (~1.8T)
            </p>
          </div>

          {/* Dataset Size Options */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Dataset Size (tokens)
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={useOptimalTokens}
                  onChange={() => setUseOptimalTokens(true)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-slate-900">
                    Use Optimal (Chinchilla) - Recommended
                  </div>
                  <div className="text-sm text-slate-600">
                    {paramsInBillions > 0
                      ? `${(getOptimalTokens(paramsTotal) / 1e9).toFixed(1)}B tokens (20× parameters)`
                      : "20× your model parameters"
                    }
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={!useOptimalTokens}
                  onChange={() => setUseOptimalTokens(false)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-900">Custom Dataset Size</div>
                  {!useOptimalTokens && (
                    <input
                      type="number"
                      value={datasetTokens}
                      onChange={(e) => setDatasetTokens(e.target.value)}
                      placeholder="Dataset size in billions"
                      className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.1"
                    />
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Results Display */}
          {paramsInBillions > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-slate-900">Estimated Compute Requirements</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Model Parameters</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {paramsInBillions.toFixed(1)}B
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 mb-1">Training Dataset</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {tokensInBillions.toFixed(1)}B tokens
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-300">
                <div className="text-xs text-slate-500 mb-1">Total Compute Required</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatFLOPs(estimatedFLOPs)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  ({estimatedFLOPs.toExponential(2)} FLOPs)
                </div>
              </div>

              {/* Reference Examples */}
              <div className="pt-3 border-t border-slate-200">
                <div className="text-xs text-slate-500 mb-2">Reference examples:</div>
                <div className="space-y-1 text-xs text-slate-600">
                  <div>• GPT-3 (175B): ~3.14 × 10²³ FLOPs</div>
                  <div>• LLaMA 2 (70B): ~8.4 × 10²³ FLOPs</div>
                  <div>• LLaMA 2 (7B): ~1.8 × 10²³ FLOPs</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={paramsInBillions <= 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-medium"
          >
            Continue to Campaign Details
          </button>
        </div>
      </div>
    </div>
  );
}
