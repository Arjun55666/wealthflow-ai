import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, TrendingUp, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../utils/axios";
import toast from "react-hot-toast";

const InputField = ({ icon: Icon, rightElement, ...props }) => (
  <div className="flex items-center bg-[#141928] border border-white/[0.08] rounded-xl transition-all duration-200 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 group">
    <div className="pl-3.5 pr-2 flex items-center flex-shrink-0">
      <Icon size={15} className="text-gray-600 group-focus-within:text-primary/70 transition-colors duration-200" />
    </div>
    <input
      {...props}
      className="flex-1 min-w-0 bg-transparent py-2.5 pr-3 text-[14px] text-white placeholder:text-gray-600 focus:outline-none"
    />
    {rightElement}
  </div>
);

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please enter your email and password");
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-[#090C13] text-gray-100 relative overflow-hidden selection:bg-primary/30">

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/6 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-600/4 blur-[120px] pointer-events-none" />

      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle, oklch(0.60 0.22 278 / 0.06) 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      <div className="w-full max-w-[400px] relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-500 ease-out">

        <div className="text-center mb-8">
          <div className="relative inline-flex mb-5">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shadow-[0_0_32px_oklch(0.60_0.22_278/0.25)]">
              <TrendingUp size={22} className="text-primary" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight text-white mb-1.5">WealthFlow</h1>
          <p className="text-gray-500 text-[14px]">Sign in to your account</p>
        </div>

        <div className="bg-[#0E1220]/90 backdrop-blur-2xl rounded-2xl border border-white/6 p-7 shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-gray-400 block tracking-wide">Email address</label>
              <InputField
                icon={Mail}
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-gray-400 block tracking-wide">Password</label>
              <InputField
                icon={Lock}
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pr-3.5 flex items-center text-gray-600 hover:text-gray-400 transition-colors focus:outline-none flex-shrink-0"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-2.5 px-4 text-[14px] font-medium flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none shadow-[0_0_24px_oklch(0.60_0.22_278/0.25)] hover:shadow-[0_0_32px_oklch(0.60_0.22_278/0.35)]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[13px] text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
