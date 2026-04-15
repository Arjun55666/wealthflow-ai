import { Link } from "react-router-dom";
import {
  TrendingUp, Scan, Bell, BarChart3, RefreshCw, Shield,
  ArrowRight, ChevronRight, Wallet, PieChart, Zap,
  CheckCircle2, Star, Brain, CreditCard
} from "lucide-react";

const NAV_LINKS = ["Features", "How it works", "Security"];

const FEATURES = [
  {
    icon: Scan,
    color: "from-violet-500/20 to-violet-600/5",
    border: "border-violet-500/20",
    iconColor: "text-violet-400",
    title: "AI Receipt Scanning",
    desc: "Upload any receipt photo and our AI instantly extracts the amount, merchant, category and date — no manual entry needed.",
  },
  {
    icon: Bell,
    color: "from-amber-500/20 to-amber-600/5",
    border: "border-amber-500/20",
    iconColor: "text-amber-400",
    title: "Smart Budget Alerts",
    desc: "Get email notifications when you hit 80% or 100% of your budget. Never overspend again with real-time tracking.",
  },
  {
    icon: BarChart3,
    color: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
    title: "Visual Reports",
    desc: "See your income vs expenses over 6 months with interactive charts. Understand your spending patterns at a glance.",
  },
  {
    icon: RefreshCw,
    color: "from-green-500/20 to-green-600/5",
    border: "border-green-500/20",
    iconColor: "text-green-400",
    title: "Recurring Transactions",
    desc: "Set up daily, weekly, monthly or yearly recurring transactions. EMIs, subscriptions and salaries handled automatically.",
  },
  {
    icon: Brain,
    color: "from-pink-500/20 to-pink-600/5",
    border: "border-pink-500/20",
    iconColor: "text-pink-400",
    title: "AI Financial Tips",
    desc: "Get personalized financial advice generated from your actual spending data — not generic one-size-fits-all tips.",
  },
  {
    icon: Shield,
    color: "from-cyan-500/20 to-cyan-600/5",
    border: "border-cyan-500/20",
    iconColor: "text-cyan-400",
    title: "Bank-Grade Security",
    desc: "JWT authentication, bcrypt password hashing, rate limiting and bot-shield protection keep your data safe.",
  },
];

const STEPS = [
  { num: "01", title: "Create your account", desc: "Sign up in seconds. Add your bank accounts with opening balances and optional monthly budget limits." },
  { num: "02", title: "Log your transactions", desc: "Add transactions manually or just upload a receipt photo — our AI fills in the details for you automatically." },
  { num: "03", title: "Watch your money grow", desc: "Track budgets in real time, get AI tips, and view monthly reports to make smarter financial decisions." },
];

const STATS = [
  { value: "70%", label: "Less manual entry with AI scanning" },
  { value: "80%", label: "Reduction in missed budget limits" },
  { value: "3s", label: "Average receipt scan time" },
  { value: "100%", label: "Free to start" },
];

const TESTIMONIALS = [
  { name: "Priya S.", role: "Freelancer", text: "The receipt scanner is a game changer. I just photo my bills and WealthFlow does the rest.", stars: 5 },
  { name: "Rohit M.", role: "Software Engineer", text: "Finally a finance app that doesn't feel like a spreadsheet. Clean, fast, and actually smart.", stars: 5 },
  { name: "Aisha K.", role: "Student", text: "The budget alerts saved me multiple times this month. The AI tips are surprisingly relevant too.", stars: 5 },
];

function MockDashboard() {
  return (
    <div className="w-full bg-[#0E1220] border border-white/10 rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7)]">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5 bg-[#141928]">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-3 text-[11px] text-gray-600 font-mono">wealthflow.replit.app/dashboard</span>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Balance", value: "₹2,45,800", color: "text-white" },
            { label: "This Month Income", value: "+₹85,000", color: "text-green-400" },
            { label: "This Month Expenses", value: "-₹32,450", color: "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="bg-[#141928] border border-white/5 rounded-xl p-3">
              <p className="text-[10px] text-gray-600 mb-1">{s.label}</p>
              <p className={`text-[15px] font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="bg-[#141928] border border-white/5 rounded-xl p-4">
          <p className="text-[11px] text-gray-500 mb-3 uppercase tracking-widest font-medium">Income vs Expenses — Last 6 Months</p>
          <div className="flex items-end gap-2 h-20">
            {[
              { inc: 60, exp: 35 }, { inc: 70, exp: 45 }, { inc: 55, exp: 30 },
              { inc: 80, exp: 50 }, { inc: 75, exp: 40 }, { inc: 90, exp: 38 },
            ].map((d, i) => (
              <div key={i} className="flex-1 flex items-end gap-0.5">
                <div className="flex-1 rounded-sm bg-green-500/40" style={{ height: `${d.inc}%` }} />
                <div className="flex-1 rounded-sm bg-red-500/40" style={{ height: `${d.exp}%` }} />
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-1 text-[10px] text-gray-600"><span className="w-2 h-2 rounded-sm bg-green-500/40 inline-block" />Income</span>
            <span className="flex items-center gap-1 text-[10px] text-gray-600"><span className="w-2 h-2 rounded-sm bg-red-500/40 inline-block" />Expenses</span>
          </div>
        </div>
        <div className="bg-[#141928] border border-white/5 rounded-xl p-3 space-y-2">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-medium mb-2">Recent Transactions</p>
          {[
            { desc: "Grocery Store", amt: "-₹1,240", cat: "Food", color: "text-red-400" },
            { desc: "Salary Credit", amt: "+₹85,000", cat: "Income", color: "text-green-400" },
            { desc: "Netflix", amt: "-₹649", cat: "Entertainment", color: "text-red-400" },
          ].map((t) => (
            <div key={t.desc} className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-gray-300">{t.desc}</p>
                <p className="text-[10px] text-gray-600">{t.cat}</p>
              </div>
              <span className={`text-[12px] font-semibold ${t.color}`}>{t.amt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="bg-[#090C13] text-gray-100 min-h-screen overflow-x-hidden selection:bg-primary/30">

      {/* Background glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-primary/5 blur-[160px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-600/4 blur-[140px] pointer-events-none" />

      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, oklch(0.60 0.22 278 / 0.08) 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }}
      />

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-[#090C13]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shadow-[0_0_20px_oklch(0.60_0.22_278/0.25)]">
            <TrendingUp size={16} className="text-primary" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-semibold text-white tracking-tight">WealthFlow <span className="text-primary">AI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`} className="text-[13px] text-gray-500 hover:text-gray-200 transition-colors duration-200">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-[13px] text-gray-400 hover:text-white transition-colors duration-200 px-3 py-1.5">Sign in</Link>
          <Link to="/register" className="bg-primary hover:bg-primary/90 text-white text-[13px] font-medium px-4 py-2 rounded-xl transition-all duration-200 shadow-[0_0_16px_oklch(0.60_0.22_278/0.3)] hover:shadow-[0_0_24px_oklch(0.60_0.22_278/0.4)] active:scale-95">
            Get started free
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 pt-36 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[12px] font-medium mb-6">
            <Zap size={12} />
            Powered by Groq AI — Receipt scanning in under 3 seconds
          </div>
          <h1 className="text-[42px] md:text-[64px] font-bold tracking-tight text-white leading-[1.1] mb-6">
            Your finances,{" "}
            <span className="bg-gradient-to-r from-primary via-violet-400 to-blue-400 bg-clip-text text-transparent">
              finally intelligent
            </span>
          </h1>
          <p className="text-[17px] text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            WealthFlow AI combines smart budgeting with AI-powered receipt scanning and personalized financial insights — so you always know where your money is going.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-7 py-3.5 rounded-xl text-[15px] transition-all duration-200 shadow-[0_0_32px_oklch(0.60_0.22_278/0.35)] hover:shadow-[0_0_48px_oklch(0.60_0.22_278/0.45)] active:scale-[0.98]"
            >
              Start for free <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/8 text-gray-200 font-medium px-7 py-3.5 rounded-xl text-[15px] border border-white/8 transition-all duration-200 active:scale-[0.98]"
            >
              Sign in <ChevronRight size={16} />
            </Link>
          </div>
          <p className="text-[12px] text-gray-600 mt-4">No credit card required · Free forever</p>
        </div>

        {/* Dashboard preview */}
        <div className="relative max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent rounded-3xl blur-2xl -z-10 scale-105" />
          <MockDashboard />
        </div>
      </section>

      {/* STATS */}
      <section className="relative z-10 py-16 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-[38px] md:text-[46px] font-bold text-white tracking-tight leading-none mb-2">{s.value}</p>
              <p className="text-[13px] text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary text-[12px] font-semibold uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-[32px] md:text-[44px] font-bold text-white tracking-tight mb-4">Everything you need to master your money</h2>
          <p className="text-gray-500 text-[16px] max-w-2xl mx-auto">Built for people who want real insights, not just another expense tracker.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`relative rounded-2xl border ${f.border} bg-gradient-to-br ${f.color} p-6 hover:scale-[1.02] transition-transform duration-300 group overflow-hidden`}
            >
              <div className="absolute inset-0 bg-[#090C13]/60 rounded-2xl" />
              <div className="relative z-10">
                <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center mb-4 ${f.iconColor} group-hover:scale-110 transition-transform duration-200`}>
                  <f.icon size={18} />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 md:px-12 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-[12px] font-semibold uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-[32px] md:text-[44px] font-bold text-white tracking-tight mb-4">Up and running in minutes</h2>
            <p className="text-gray-500 text-[16px]">No complex setup. No spreadsheets. Just results.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%+16px)] w-[calc(100%-32px)] h-px bg-gradient-to-r from-white/10 to-transparent" />
                )}
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                  <span className="text-[18px] font-bold text-primary">{s.num}</span>
                </div>
                <h3 className="text-[16px] font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI HIGHLIGHT */}
      <section className="relative z-10 py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden border border-white/8 bg-gradient-to-br from-[#0E1220] to-[#0C0F1A] p-10 md:p-16">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/8 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/6 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[12px] font-medium mb-5">
                <Brain size={12} /> Groq AI powered
              </div>
              <h2 className="text-[30px] md:text-[38px] font-bold text-white tracking-tight mb-4 leading-tight">
                Scan a receipt.<br />
                <span className="text-primary">Done in 3 seconds.</span>
              </h2>
              <p className="text-gray-400 text-[15px] leading-relaxed mb-6">
                Powered by Llama 4 Vision via Groq, WealthFlow reads your receipt photo and automatically fills in the amount, merchant name, category and date — with near-perfect accuracy.
              </p>
              <ul className="space-y-3">
                {["Supports JPEG and PNG receipts", "Auto-selects the right spending category", "Works with restaurant, grocery and utility bills", "Also generates personalized money-saving tips"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-[13px] text-gray-400">
                    <CheckCircle2 size={14} className="text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <div className="bg-[#141928] border border-white/6 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <Scan size={20} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-gray-200">Receipt scanned successfully</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">BigBasket · ₹1,840 · Food & Dining · Today</p>
                </div>
                <CheckCircle2 size={16} className="text-green-400 ml-auto flex-shrink-0" />
              </div>
              <div className="bg-[#141928] border border-white/6 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Bell size={20} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-gray-200">Budget alert sent</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">Savings account · 83% of ₹60,000 used</p>
                </div>
                <CheckCircle2 size={16} className="text-green-400 ml-auto flex-shrink-0" />
              </div>
              <div className="bg-[#141928] border border-white/6 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-pink-500/15 border border-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <Brain size={20} className="text-pink-400" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-gray-200">AI tip generated</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">You spent 40% more on dining this month</p>
                </div>
                <CheckCircle2 size={16} className="text-green-400 ml-auto flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative z-10 py-24 px-6 md:px-12 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary text-[12px] font-semibold uppercase tracking-widest mb-3">What users say</p>
            <h2 className="text-[32px] md:text-[40px] font-bold text-white tracking-tight">People love WealthFlow</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-[#0E1220] border border-white/6 rounded-2xl p-6 hover:border-white/10 transition-colors duration-300">
                <div className="flex gap-0.5 mb-4">
                  {Array(t.stars).fill(0).map((_, i) => (
                    <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-[13px] text-gray-400 leading-relaxed mb-5">"{t.text}"</p>
                <div>
                  <p className="text-[13px] font-semibold text-white">{t.name}</p>
                  <p className="text-[11px] text-gray-600">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="relative z-10 py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div>
            <p className="text-primary text-[12px] font-semibold uppercase tracking-widest mb-3">Security</p>
            <h2 className="text-[32px] md:text-[40px] font-bold text-white tracking-tight mb-4 leading-tight">Your data is locked down</h2>
            <p className="text-gray-400 text-[15px] leading-relaxed mb-8">We take security seriously. WealthFlow uses the same security practices as production financial applications.</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: "JWT Authentication" },
                { icon: CreditCard, label: "bcrypt Password Hashing" },
                { icon: Zap, label: "Rate Limiting" },
                { icon: CheckCircle2, label: "Bot Shield Protection" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 text-[13px] text-gray-400">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center flex-shrink-0">
                    <item.icon size={14} className="text-primary" />
                  </div>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#0E1220] border border-white/8 rounded-2xl p-6 space-y-4">
            {[
              { label: "Password encryption", status: "AES-256 + bcrypt", ok: true },
              { label: "Session tokens", status: "JWT with expiry", ok: true },
              { label: "API rate limiting", status: "100 req / 15 min", ok: true },
              { label: "Bot protection", status: "Arcjet shield active", ok: true },
              { label: "Database", status: "PostgreSQL with ACID", ok: true },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <span className="text-[13px] text-gray-400">{row.label}</span>
                <span className="flex items-center gap-1.5 text-[12px] text-green-400 font-medium">
                  <CheckCircle2 size={12} />
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 py-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 to-violet-600/5 p-14">
            <div className="absolute inset-0 bg-[#090C13]/60" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/15 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-6 shadow-[0_0_32px_oklch(0.60_0.22_278/0.3)]">
                <TrendingUp size={24} className="text-primary" strokeWidth={2.5} />
              </div>
              <h2 className="text-[32px] md:text-[44px] font-bold text-white tracking-tight mb-4">Start tracking smarter today</h2>
              <p className="text-gray-400 text-[16px] mb-8 max-w-xl mx-auto">Join users who've taken control of their finances with WealthFlow AI. It's free, private, and takes 30 seconds to set up.</p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-8 py-4 rounded-xl text-[15px] transition-all duration-200 shadow-[0_0_40px_oklch(0.60_0.22_278/0.4)] hover:shadow-[0_0_56px_oklch(0.60_0.22_278/0.5)] active:scale-[0.98]"
              >
                Create free account <ArrowRight size={16} />
              </Link>
              <p className="text-[12px] text-gray-600 mt-4">Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
              <TrendingUp size={13} className="text-primary" strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-semibold text-gray-400">WealthFlow AI</span>
          </div>
          <p className="text-[12px] text-gray-600">Built with Node.js, React, PostgreSQL &amp; Groq AI</p>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-[12px] text-gray-600 hover:text-gray-400 transition-colors">Sign in</Link>
            <Link to="/register" className="text-[12px] text-gray-600 hover:text-gray-400 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
