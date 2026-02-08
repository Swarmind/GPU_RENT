import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { WalletButton } from "./wallet-button";
import { AntHiveLogo } from "./anthive-logo";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <AntHiveLogo className="w-10 h-10" />
            <span className="text-xl font-semibold text-slate-900">AntHive</span>
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>

          {/* Desktop Navigation */}
          <nav
            className={`${
              isMenuOpen ? "block" : "hidden"
            } md:flex items-center gap-6 mt-4 md:mt-0`}
          >
            <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition">Pricing</a>
            <Link to="/instances" className="text-slate-600 hover:text-slate-900 transition">Instances</Link>
            <Link to="/templates" className="text-slate-600 hover:text-slate-900 transition">Templates</Link>
            <Link to="/machines" className="text-slate-600 hover:text-slate-900 transition">Machines</Link>
            <Link to="/campaigns" className="text-slate-600 hover:text-slate-900 transition">Campaigns</Link>
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition">Features</a>
            <WalletButton />
          </nav>
        </div>
      </div>
    </header>
  );
}