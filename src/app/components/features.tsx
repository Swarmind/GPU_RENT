import { Cloud, BarChart3, Lock, Wrench, Globe, Users } from "lucide-react";
import { Link } from "react-router";

const features = [
  {
    icon: Cloud,
    title: "Decentralized Marketplace",
    description: "Connect hardware providers with renters in a peer-to-peer marketplace. Competitive pricing and global availability.",
    color: "blue"
  },
  {
    icon: BarChart3,
    title: "Auto-Detected Hardware",
    description: "CLI tool automatically detects GPU specs, CPU, RAM, and network capabilities. Providers just set pricing and availability.",
    color: "green"
  },
  {
    icon: Lock,
    title: "Verified Machines",
    description: "Hardware verification ensures quality. Provider reputation system and reliability tracking built-in.",
    color: "red"
  },
  {
    icon: Wrench,
    title: "Pre-Configured Templates",
    description: "One-click deployment with LLaMA, Stable Diffusion, PyTorch, TensorFlow, and custom frameworks.",
    color: "purple"
  },
  {
    icon: Globe,
    title: "Community Crowdfunding",
    description: "Pool resources for expensive training jobs. Support open-source AI research and development.",
    color: "indigo"
  },
  {
    icon: Users,
    title: "Transparent Economics",
    description: "Pay per minute for rentals. Earn passive income as a provider. Track campaign funding in real-time.",
    color: "orange"
  }
];

const colorMap: Record<string, { bg: string; icon: string }> = {
  blue: { bg: "bg-blue-100", icon: "text-blue-600" },
  green: { bg: "bg-green-100", icon: "text-green-600" },
  red: { bg: "bg-red-100", icon: "text-red-600" },
  purple: { bg: "bg-purple-100", icon: "text-purple-600" },
  indigo: { bg: "bg-indigo-100", icon: "text-indigo-600" },
  orange: { bg: "bg-orange-100", icon: "text-orange-600" }
};

export function Features() {
  return (
    <section id="features" className="bg-white py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 text-slate-900">Why Choose AntHive</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            The complete platform for distributed GPU computing and AI training
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            const colors = colorMap[feature.color];
            
            return (
              <div key={feature.title} className="group">
                <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                  <Icon className={`w-7 h-7 ${colors.icon}`} />
                </div>
                <h3 className="text-xl mb-3 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl mb-4">Ready to start your AI journey?</h3>
          <p className="text-xl mb-8 text-blue-100">
            Join the decentralized GPU marketplace today
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/instances" className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition text-lg">
              Rent GPUs
            </Link>
            <Link to="/machines" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition text-lg">
              List Your Hardware
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}