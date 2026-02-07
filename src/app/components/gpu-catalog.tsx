import { Check, Cpu, HardDrive, Gauge } from "lucide-react";

const gpuOptions = [
  {
    name: "RTX 3090",
    memory: "24GB GDDR6X",
    cores: "10,496 CUDA Cores",
    performance: "35.6 TFLOPS",
    price: "$1.20",
    features: [
      "Perfect for deep learning",
      "Fast training speeds",
      "Large memory bandwidth",
      "Ampere architecture"
    ]
  },
  {
    name: "A100 40GB",
    memory: "40GB HBM2",
    cores: "6,912 CUDA Cores",
    performance: "156 TFLOPS",
    price: "$2.80",
    popular: true,
    features: [
      "Multi-instance GPU support",
      "NVLink connectivity",
      "Tensor Core acceleration",
      "Enterprise-grade reliability"
    ]
  },
  {
    name: "H100 80GB",
    memory: "80GB HBM3",
    cores: "16,896 CUDA Cores",
    performance: "378 TFLOPS",
    price: "$4.50",
    features: [
      "Latest Hopper architecture",
      "FP8 Transformer Engine",
      "PCIe Gen5 support",
      "Maximum AI performance"
    ]
  },
  {
    name: "RTX 4090",
    memory: "24GB GDDR6X",
    cores: "16,384 CUDA Cores",
    performance: "82.6 TFLOPS",
    price: "$1.80",
    features: [
      "Ada Lovelace architecture",
      "DLSS 3.0 support",
      "RT Core Gen 3",
      "High efficiency"
    ]
  }
];

export function GpuCatalog() {
  return (
    <section id="pricing" className="container mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl mb-4 text-slate-900">Choose Your GPU</h2>
        <p className="text-xl text-slate-600">
          Select from our range of powerful GPUs. All prices are per hour.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {gpuOptions.map((gpu) => (
          <div
            key={gpu.name}
            className={`bg-white rounded-xl p-6 border-2 transition hover:shadow-lg ${
              gpu.popular
                ? "border-blue-500 relative"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            {gpu.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
                Most Popular
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-2xl mb-2 text-slate-900">{gpu.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl text-blue-600">{gpu.price}</span>
                <span className="text-slate-600">/hour</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-slate-700">
                <HardDrive className="w-4 h-4 text-slate-400" />
                <span className="text-sm">{gpu.memory}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Cpu className="w-4 h-4 text-slate-400" />
                <span className="text-sm">{gpu.cores}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Gauge className="w-4 h-4 text-slate-400" />
                <span className="text-sm">{gpu.performance}</span>
              </div>
            </div>

            <ul className="space-y-2 mb-6">
              {gpu.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-3 rounded-lg transition ${
                gpu.popular
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-slate-100 text-slate-900 hover:bg-slate-200"
              }`}
            >
              Deploy Now
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
