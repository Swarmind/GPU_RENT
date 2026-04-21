import { Zap, Shield, Clock } from "lucide-react";
import { Link } from "react-router";

export function Hero() {
  return (
    <section className="container mx-auto px-6 py-20">
      <div className="text-center max-w-4xl mx-auto mb-16">
        <h1 className="text-5xl md:text-6xl mb-6 text-slate-900">
          Decentralized GPU Marketplace for AI & ML
        </h1>
        <p className="text-xl text-slate-600 mb-8">
          Rent GPUs, share your hardware, or crowdfund LLM training. Access powerful compute resources with pre-configured templates and instant deployment.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/marketplace" className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg">
            Browse Marketplace
          </Link>
          <Link to="/campaigns" className="px-8 py-4 bg-white text-slate-900 rounded-lg border-2 border-slate-200 hover:border-slate-300 transition text-lg">
            View Campaigns
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-20">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl mb-3 text-slate-900">Instant Deployment</h3>
          <p className="text-slate-600">
            Launch GPU instances in seconds with pre-configured ML/AI templates. No setup, no waiting.
          </p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl mb-3 text-slate-900">Earn with Your Hardware</h3>
          <p className="text-slate-600">
            Connect your machines to the marketplace and earn passive income by renting out your GPUs.
          </p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-xl mb-3 text-slate-900">Crowdfund LLM Training</h3>
          <p className="text-slate-600">
            Pool resources to train large language models. Fund or support research campaigns.
          </p>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-xl">
        <img 
          src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwY2VudGVyJTIwc2VydmVycyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzY5NzIzMDUyfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Data center servers"
          className="w-full h-96 object-cover"
        />
      </div>
    </section>
  );
}