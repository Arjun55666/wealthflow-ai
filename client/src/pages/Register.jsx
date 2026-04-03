import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, TrendingUp, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../utils/axios";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please complete all fields");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must meet minimum security requirements (8+ chars)");
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", form);
      login(data.user, data.token);
      toast.success(`Terminal initialized for ${data.user.name}`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-[#0A0D14] text-gray-100 relative overflow-hidden selection:bg-primary/30">
      
      {/* Abstract background elements */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[150px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none mix-blend-screen" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-xl bg-[#0D111A] border border-white/10 mx-auto flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(124,58,237,0.15)] relative group">
            <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md group-hover:bg-primary/30 transition-colors duration-500" />
            <TrendingUp size={24} className="text-primary relative z-10" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Initialize Terminal</h1>
          <p className="text-gray-400 text-[15px]">Setup your institutional-grade workspace</p>
        </div>

        {/* Card */}
        <div className="bg-[#0D111A]/80 backdrop-blur-xl rounded-2xl border border-white/5 p-8 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-gray-400 block">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User size={16} className="text-gray-500 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full bg-[#141923] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-[14px] text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-gray-400 block">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-500 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full bg-[#141923] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-[14px] text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="name@domain.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-gray-400 block">Master Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-500 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-[#141923] border border-white/10 rounded-lg py-2.5 pl-10 pr-11 text-[14px] text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono tracking-wider"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg py-2.5 px-4 text-[14px] font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-2 shadow-[0_0_20px_rgba(124,58,237,0.2)]" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Provisioning Workspace...</span>
                </>
              ) : (
                <>
                  <span>Create Workspace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[13px] text-gray-500">
            Already provisioned?{" "}
            <Link to="/login" className="text-primary hover:text-primary-foreground font-medium transition-colors">
              Access Terminal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}