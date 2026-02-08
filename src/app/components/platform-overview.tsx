import { Server, Code, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router";

const platformFeatures = [
  {
    icon: Server,
    title: "GPU Instances",
    description: "Browse and rent high-performance GPUs from verified providers worldwide. Filter by specs, price, and location.",
    link: "/instances",
    linkText: "Browse Instances",
    color: "blue",
    stats: "1000+ GPUs available"
  },
  {
    icon: Code,
    title: "Ready Templates",
    description: "Pre-configured environments for LLaMA, Stable Diffusion, PyTorch, and more. Deploy in one click.",
    link: "/templates",
    linkText: "Explore Templates",
    color: "green",
    stats: "50+ templates"
  },
  {
    icon: Users,
    title: "List Your Hardware",
    description: "Hardware providers can connect machines, set pricing, and earn revenue from the marketplace.",
    link: "/machines",
    linkText: "Add Machines",
    color: "purple",
    stats: "Earn passive income"
  },
  {
    icon: TrendingUp,
    title: "Crowdfunding",
    description: "Launch or support campaigns to fund expensive LLM training projects. Pool community resources.",
    link: "/campaigns",
    linkText: "View Campaigns",
    color: "orange",
    stats: "$2.5M+ funded"
  }
];

const colorMap: Record<string, { bg: string; icon: string; button: string }> = {
  blue: { bg: "bg-blue-100", icon: "text-blue-600", button: "bg-blue-600 hover:bg-blue-700" },
  green: { bg: "bg-green-100", icon: "text-green-600", button: "bg-green-600 hover:bg-green-700" },
  purple: { bg: "bg-purple-100", icon: "text-purple-600", button: "bg-purple-600 hover:bg-purple-700" },
  orange: { bg: "bg-orange-100", icon: "text-orange-600", button: "bg-orange-600 hover:bg-orange-700" }
};

export function PlatformOverview() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 text-slate-900">Complete GPU Cloud Platform</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Everything you need to rent, provide, or crowdfund GPU compute resources
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {platformFeatures.map((feature) => {
            const Icon = feature.icon;
            const colors = colorMap[feature.color];
            
            return (
              <div key={feature.title} className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${colors.icon}`} />
                  </div>
                  <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {feature.stats}
                  </span>
                </div>
                <h3 className="text-2xl mb-3 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {feature.description}
                </p>
                <Link 
                  to={feature.link}
                  className={`inline-block px-6 py-3 ${colors.button} text-white rounded-lg transition`}
                >
                  {feature.linkText}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
