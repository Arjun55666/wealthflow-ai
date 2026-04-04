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
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
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
    toast.success("Signed out successfully");
    navigate("/login");
  };

  return (
    <div className="flex h-[100dvh] bg-[#090C13] text-gray-100 overflow-hidden selection:bg-primary/30">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-[#0C0F1A] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          sidebarOpen ? "translate-x-0 border-r border-white/5" : "-translate-x-full lg:translate-x-0 lg:border-r lg:border-white/5"
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 h-14 border-b border-white/5">
          <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shadow-[0_0_12px_oklch(0.60_0.22_278/0.3)] flex-shrink-0">
            <TrendingUp size={14} strokeWidth={2.5} />
          </div>
          <span className="text-white font-semibold tracking-wide text-[15px]">WealthFlow</span>
          <button
            className="ml-auto lg:hidden text-gray-500 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={17} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-3 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Navigation</p>
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-primary/12 text-primary"
                    : "text-gray-500 hover:bg-white/4 hover:text-gray-200"
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              {({ isActive }) => (
                <>
                  <Icon size={15} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2.5 p-2.5 mb-2 rounded-xl bg-white/3">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-semibold text-[13px] flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-200 text-[12px] font-medium truncate">{user?.name}</p>
              <p className="text-gray-600 text-[11px] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-[12px] font-medium text-gray-500 hover:bg-red-500/8 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={14} strokeWidth={2} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden overflow-y-hidden relative">

        <div className="absolute top-0 right-0 w-[50%] h-[40%] rounded-full bg-primary/4 blur-[120px] pointer-events-none" />

        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-[#0C0F1A]/95 border-b border-white/5 relative z-10 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-primary">
              <TrendingUp size={14} strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-white tracking-wide text-[15px]">WealthFlow</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -mr-2 text-gray-500 hover:text-white transition-colors"
          >
            <Menu size={19} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative z-10">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
