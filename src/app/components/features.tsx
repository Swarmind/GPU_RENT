import { Cloud, BarChart3, Lock, Wrench, Globe, Users } from "lucide-react";

const features = [
  {
    icon: Cloud,
    title: "Cloud-Native Infrastructure",
    description: "Built on cutting-edge cloud architecture for maximum reliability and performance. Automatic scaling and load balancing included.",
    color: "blue"
  },
  {
    icon: BarChart3,
    title: "Real-Time Monitoring",
    description: "Track GPU utilization, memory usage, and performance metrics in real-time with our intuitive dashboard.",
    color: "green"
  },
  {
    icon: Lock,
    title: "Advanced Security",
    description: "Enterprise-grade encryption, isolated environments, and compliance with SOC 2, GDPR, and HIPAA standards.",
    color: "red"
  },
  {
    icon: Wrench,
    title: "Pre-Configured Environments",
    description: "Choose from TensorFlow, PyTorch, JAX, and more. Custom Docker images supported for maximum flexibility.",
    color: "purple"
  },
  {
    icon: Globe,
    title: "Global Data Centers",
    description: "Deploy in regions across North America, Europe, and Asia. Low latency guaranteed with our global network.",
    color: "indigo"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share resources, manage permissions, and collaborate seamlessly with your team on ML projects.",
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
          <h2 className="text-4xl mb-4 text-slate-900">Built for Performance</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Everything you need to train, deploy, and scale your AI models in production.
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
          <h3 className="text-3xl mb-4">Ready to accelerate your AI development?</h3>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of developers and researchers using our platform
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition text-lg">
              Get Started Free
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition text-lg">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
