import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  BarChart3,
  LogOut,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { path: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { path: "/accounts", icon: Wallet, label: "Accounts" },
  { path: "/reports", icon: BarChart3, label: "Analytics" },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Securely logged out");
    navigate("/login");
  };

  return (
    <div className="flex h-[100dvh] bg-[#0A0D14] text-gray-100 overflow-hidden selection:bg-primary/30">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0D111A] border-r border-white/5 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-white/5">
          <div className="w-8 h-8 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(124,58,237,0.3)]">
            <TrendingUp size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-white font-semibold tracking-wide text-[15px] leading-none">WealthFlow</h1>
            <p className="text-gray-500 text-[10px] uppercase tracking-wider mt-1">Terminal</p>
          </div>
          <button 
            className="ml-auto lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Menu</div>
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-white/5 bg-[#0D111A]">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center text-white font-medium text-sm shadow-inner">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-200 text-[13px] font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-[11px] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-[13px] font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} strokeWidth={2} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Subtle background glow */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 h-16 bg-[#0D111A] border-b border-white/5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <TrendingUp size={16} strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-white tracking-wide text-[15px]">WealthFlow</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -mr-2 text-gray-400 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative z-10 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}