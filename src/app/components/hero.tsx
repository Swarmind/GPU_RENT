import { Zap, Shield, Clock } from "lucide-react";

export function Hero() {
  return (
    <section className="container mx-auto px-6 py-20">
      <div className="text-center max-w-4xl mx-auto mb-16">
        <h1 className="text-5xl md:text-6xl mb-6 text-slate-900">
          High-Performance GPU Rentals for AI & ML
        </h1>
        <p className="text-xl text-slate-600 mb-8">
          Access powerful GPU instances on-demand. Scale your deep learning workloads with enterprise-grade infrastructure.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg">
            Start Computing
          </button>
          <button className="px-8 py-4 bg-white text-slate-900 rounded-lg border-2 border-slate-200 hover:border-slate-300 transition text-lg">
            View Pricing
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-20">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl mb-3 text-slate-900">Instant Deployment</h3>
          <p className="text-slate-600">
            Launch GPU instances in seconds. No setup, no waiting. Start training your models immediately.
          </p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl mb-3 text-slate-900">Enterprise Security</h3>
          <p className="text-slate-600">
            Bank-grade encryption and isolated environments. Your data and models stay private and secure.
          </p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-xl mb-3 text-slate-900">Pay Per Minute</h3>
          <p className="text-slate-600">
            Only pay for what you use. No long-term commitments or upfront costs required.
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
