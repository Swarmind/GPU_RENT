import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { WalletButton } from "./wallet-button";
import { AntHiveLogo } from "./anthive-logo";
import { useAuth } from "../contexts/auth-context";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

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
            
            {/* Auth Buttons or User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Get started
                  </Button>
                </Link>
              </div>
            )}
            
            <WalletButton />
          </nav>
        </div>
      </div>
    </header>
  );
}