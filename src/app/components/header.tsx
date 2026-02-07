import { Menu, X, Server } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import logo from "figma:asset/5ae972dd1a4a99358196b6e67a4827180a6a439a.png";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="SwarMind" className="w-10 h-10" />
            <span className="text-xl font-semibold text-slate-900">SwarMind</span>
          </Link>
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        <nav
          className={`${
            isMenuOpen ? "block" : "hidden"
          } md:flex items-center gap-8 mt-4 md:mt-0`}
        >
          <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition">Pricing</a>
          <Link to="/templates" className="text-slate-600 hover:text-slate-900 transition">Templates</Link>
          <a href="#features" className="text-slate-600 hover:text-slate-900 transition">Features</a>
          <a href="#docs" className="text-slate-600 hover:text-slate-900 transition">Documentation</a>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Get Started
          </button>
        </nav>
      </div>
    </header>
  );
}