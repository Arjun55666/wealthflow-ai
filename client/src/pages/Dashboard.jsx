import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Lightbulb, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import API from "../utils/axios";
import toast from "react-hot-toast";

const COLORS = ["#7C3AED", "#3B82F6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6", "#6366F1", "#14B8A6"];

const CATEGORY_LABELS = {
  FOOD: "Food & Dining", TRANSPORT: "Transportation", HOUSING: "Housing & Rent",
  ENTERTAINMENT: "Entertainment", TRAVEL: "Travel", HEALTH: "Healthcare",
  SHOPPING: "Shopping", MISCELLANEOUS: "Miscellaneous", SALARY: "Salary", INVESTMENTS: "Investments"
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [tip, setTip] = useState("");
  const [loading, setLoading] = useState(true);
  const [tipLoading, setTipLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [summaryRes, monthlyRes, categoryRes, txnRes, accountsRes] = await Promise.all([
        API.get("/transactions/summary"),
        API.get("/graph/monthly"),
        API.get("/graph/categories"),
        API.get("/transactions?limit=5"),
        API.get("/accounts"),
      ]);
      setSummary(summaryRes.data.summary);
      setMonthlyData(monthlyRes.data.data);
      setCategoryData(categoryRes.data.data);
      setRecentTxns(txnRes.data.transactions);
      setAccounts(accountsRes.data.accounts);

      // Fetch tip separately to not block main render
      fetchTip();
    } catch (err) {
      toast.error("Failed to load dashboard telemetry");
    } finally {
      setLoading(false);
    }
  };

  const fetchTip = async () => {
    setTipLoading(true);
    try {
      const tipRes = await API.get("/graph/tip");
      setTip(tipRes.data.tip);
    } catch {
      setTip("Diversify your portfolio to mitigate risk during market volatility.");
    } finally {
      setTipLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-mono tracking-widest uppercase">Initializing Telemetry...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Overview</h1>
          <p className="text-gray-400 text-[13px] mt-1 flex items-center gap-2">
            <Activity size={14} className="text-primary" />
            Live financial telemetry
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-[12px] uppercase tracking-wider font-semibold">Net Worth</p>
          <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(totalBalance)}</p>
        </div>
      </div>

      {/* AI Tip Card */}
      <div className="bg-gradient-to-r from-[#1A1A2E] to-[#111122] border border-primary/20 rounded-xl p-5 shadow-[0_0_20px_rgba(124,58,237,0.05)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 group-hover:bg-primary/20 transition-colors duration-700" />
        <div className="relative z-10 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            {tipLoading ? (
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <Lightbulb size={18} className="text-primary" />
            )}
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-primary uppercase tracking-wider mb-1">WealthFlow Intelligence</h3>
            {tipLoading ? (
              <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse mt-2" />
            ) : (
              <p className="text-gray-300 text-[14px] leading-relaxed">{tip}</p>
            )}
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5 group hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center text-green-500">
              <TrendingUp size={16} />
            </div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Income</span>
          </div>
          <div>
            <h4 className="text-2xl font-semibold text-white tracking-tight">
              {formatCurrency(parseFloat(summary?.totalIncome || 0))}
            </h4>
            <p className="text-[12px] text-gray-500 mt-1">Current period</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 group hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center text-red-500">
              <TrendingDown size={16} />
            </div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Expenses</span>
          </div>
          <div>
            <h4 className="text-2xl font-semibold text-white tracking-tight">
              {formatCurrency(parseFloat(summary?.totalExpense || 0))}
            </h4>
            <p className="text-[12px] text-gray-500 mt-1">Current period</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 group hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-500">
              <PiggyBank size={16} />
            </div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Net Savings</span>
          </div>
          <div>
            <h4 className={`text-2xl font-semibold tracking-tight ${(summary?.netSavings || 0) >= 0 ? "text-white" : "text-red-400"}`}>
              {formatCurrency(parseFloat(summary?.netSavings || 0))}
            </h4>
            <p className="text-[12px] text-gray-500 mt-1">Current period</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Chart */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[14px] font-semibold text-gray-200">Cash Flow (6M)</h3>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(val) => `₹${val/1000}k`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#0D111A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(val) => [formatCurrency(val), ""]}
                />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="glass-card rounded-xl p-6 flex flex-col">
          <h3 className="text-[14px] font-semibold text-gray-200 mb-2">Outflows by Category</h3>
          <p className="text-[12px] text-gray-500 mb-6">Current period</p>
          
          <div className="flex-1 flex flex-col justify-center">
            {categoryData.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={categoryData} 
                      dataKey="amount" 
                      nameKey="category" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60} 
                      outerRadius={80} 
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth={2}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0D111A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      formatter={(val) => [formatCurrency(val), ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-sm text-gray-500">
                Insufficient data
              </div>
            )}
            
            {/* Top 3 categories legend */}
            {categoryData.length > 0 && (
              <div className="mt-4 space-y-2">
                {categoryData.sort((a,b) => b.amount - a.amount).slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-400">{CATEGORY_LABELS[item.category] || item.category}</span>
                    </div>
                    <span className="font-medium text-gray-200">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ledger Preview */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-gray-200">Recent Ledger Entries</h3>
          <a href="/transactions" className="text-[12px] text-primary hover:text-primary/80 transition-colors font-medium">View Complete Ledger</a>
        </div>
        
        {recentTxns.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-[13px]">No entries recorded</div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentTxns.map((txn) => (
              <div key={txn.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-[#141923] border ${txn.type === 'INCOME' ? 'border-green-500/20 text-green-500' : 'border-red-500/20 text-red-500'}`}>
                    {txn.type === "INCOME" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-gray-200">{txn.description || CATEGORY_LABELS[txn.category] || txn.category}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-500">{new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-700" />
                      <span className="text-[11px] text-gray-500">{txn.account?.name || 'Unknown Account'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-[14px] font-semibold font-mono ${txn.type === "INCOME" ? "text-green-400" : "text-gray-200"}`}>
                    {txn.type === "INCOME" ? "+" : "-"}{formatCurrency(parseFloat(txn.amount))}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-wider">{txn.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}