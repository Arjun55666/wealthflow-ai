import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Lightbulb, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import API from "../utils/axios";
import toast from "react-hot-toast";
import { COLORS, CATEGORY_LABELS, formatCurrency } from "../utils/constants";

const StatCard = ({ icon: Icon, iconBg, iconColor, label, value, sub }) => (
  <div className="glass-card rounded-2xl p-5 group hover:border-white/12 transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon size={16} className={iconColor} />
      </div>
      <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-[22px] font-semibold text-white tracking-tight">{value}</p>
    <p className="text-[12px] text-gray-600 mt-1">{sub}</p>
  </div>
);

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [tip, setTip] = useState("");
  const [loading, setLoading] = useState(true);
  const [tipLoading, setTipLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

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
      fetchTip();
    } catch {
      toast.error("Failed to load dashboard data");
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-[13px] text-gray-600 uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-400">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-[13px] mt-0.5">Your financial overview at a glance</p>
        </div>
        <div className="sm:text-right">
          <p className="text-[11px] text-gray-600 uppercase tracking-widest font-semibold mb-0.5">Total Balance</p>
          <p className="text-[22px] font-bold text-white tracking-tight">{formatCurrency(totalBalance)}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/8 via-primary/5 to-transparent border border-primary/15 rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative z-10 flex gap-3 items-start">
          <div className="w-9 h-9 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            {tipLoading ? (
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <Lightbulb size={16} className="text-primary" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-primary uppercase tracking-widest mb-1.5">AI Insight</p>
            {tipLoading ? (
              <div className="space-y-1.5">
                <div className="h-3.5 skeleton rounded w-full" />
                <div className="h-3.5 skeleton rounded w-2/3" />
              </div>
            ) : (
              <p className="text-gray-300 text-[13px] leading-relaxed">{tip}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={TrendingUp}
          iconBg="bg-green-500/10"
          iconColor="text-green-400"
          label="Income"
          value={formatCurrency(parseFloat(summary?.totalIncome || 0))}
          sub="This period"
        />
        <StatCard
          icon={TrendingDown}
          iconBg="bg-red-500/10"
          iconColor="text-red-400"
          label="Expenses"
          value={formatCurrency(parseFloat(summary?.totalExpense || 0))}
          sub="This period"
        />
        <StatCard
          icon={PiggyBank}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
          label="Net Savings"
          value={formatCurrency(parseFloat(summary?.netSavings || 0))}
          sub="This period"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[14px] font-semibold text-gray-200">Cash Flow</h3>
              <p className="text-[12px] text-gray-600 mt-0.5">Last 6 months</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" /> Income</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" /> Expenses</span>
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4B5563', fontSize: 11 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4B5563', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#0E1220', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                  itemStyle={{ color: '#9CA3AF' }}
                  formatter={(val) => [formatCurrency(val), ""]}
                />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex flex-col">
          <div className="mb-3">
            <h3 className="text-[14px] font-semibold text-gray-200">Spending by Category</h3>
            <p className="text-[12px] text-gray-600 mt-0.5">Current period</p>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {categoryData.length > 0 ? (
              <>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={72}
                        stroke="transparent"
                        strokeWidth={0}
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0E1220', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '12px' }}
                        formatter={(val) => [formatCurrency(val), ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-2">
                  {[...categoryData].sort((a, b) => b.amount - a.amount).slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-gray-400 truncate">{CATEGORY_LABELS[item.category] || item.category}</span>
                      </div>
                      <span className="font-medium text-gray-300 ml-2">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[160px] text-[13px] text-gray-600">
                No data yet
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-gray-200">Recent Transactions</h3>
          <a href="/transactions" className="text-[12px] text-primary hover:text-primary/75 transition-colors font-medium">
            View all
          </a>
        </div>

        {recentTxns.length === 0 ? (
          <div className="py-12 text-center text-gray-600 text-[13px]">No transactions yet</div>
        ) : (
          <div className="divide-y divide-white/4">
            {recentTxns.map((txn) => (
              <div key={txn.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.015] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${txn.type === "INCOME" ? "bg-green-500/8 border-green-500/15 text-green-400" : "bg-gray-500/8 border-white/6 text-gray-400"}`}>
                    {txn.type === "INCOME" ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-gray-200 leading-snug">
                      {txn.description || CATEGORY_LABELS[txn.category] || txn.category}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-600">
                        {new Date(txn.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="w-0.5 h-0.5 rounded-full bg-gray-700" />
                      <span className="text-[11px] text-gray-600">{txn.account?.name || "Unknown"}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className={`text-[13px] font-semibold ${txn.type === "INCOME" ? "text-green-400" : "text-gray-200"}`}>
                    {txn.type === "INCOME" ? "+" : "−"}{formatCurrency(parseFloat(txn.amount))}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5 uppercase tracking-wide">{CATEGORY_LABELS[txn.category] || txn.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
