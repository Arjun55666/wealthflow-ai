import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Lightbulb, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import API from "../utils/axios";
import toast from "react-hot-toast";

const COLORS = ["#6c63ff", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

const CATEGORY_LABELS = {
  FOOD: "Food", TRANSPORT: "Transport", HOUSING: "Housing",
  ENTERTAINMENT: "Entertainment", TRAVEL: "Travel", HEALTH: "Health",
  SHOPPING: "Shopping", MISCELLANEOUS: "Misc", SALARY: "Salary", INVESTMENTS: "Investments"
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [tip, setTip] = useState("");
  const [loading, setLoading] = useState(true);

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

      // Fetch tip separately (might be slow)
      try {
        const tipRes = await API.get("/graph/tip");
        setTip(tipRes.data.tip);
      } catch {
        setTip("Track your expenses regularly to identify areas where you can save more.");
      }
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm font-medium">Total Balance</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <Wallet size={18} className="text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-navy">₹{totalBalance.toLocaleString("en-IN")}</p>
          <p className="text-xs text-gray-400 mt-1">{accounts.length} account(s)</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm font-medium">Income</span>
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <TrendingUp size={18} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">₹{parseFloat(summary?.totalIncome || 0).toLocaleString("en-IN")}</p>
          <p className="text-xs text-gray-400 mt-1">This month</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm font-medium">Expenses</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <TrendingDown size={18} className="text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-500">₹{parseFloat(summary?.totalExpense || 0).toLocaleString("en-IN")}</p>
          <p className="text-xs text-gray-400 mt-1">This month</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm font-medium">Savings</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <PiggyBank size={18} className="text-blue-500" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${(summary?.netSavings || 0) >= 0 ? "text-blue-600" : "text-red-500"}`}>
            ₹{parseFloat(summary?.netSavings || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gray-400 mt-1">This month</p>
        </div>
      </div>

      {/* AI Tip */}
      {tip && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-4 flex gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Lightbulb size={18} color="white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-purple-800 mb-1">AI Financial Tip</p>
            <p className="text-sm text-purple-700">{tip}</p>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold text-navy mb-1">Income vs Expenses</h3>
          <p className="text-gray-400 text-xs mb-4">Last 6 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                formatter={(val) => [`₹${val.toLocaleString("en-IN")}`, ""]}
              />
              <Bar dataKey="income" fill="#6c63ff" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#fca5a5" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card p-6">
          <h3 className="font-semibold text-navy mb-1">By Category</h3>
          <p className="text-gray-400 text-xs mb-4">This month</p>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`₹${val.toLocaleString("en-IN")}`, ""]} />
                <Legend formatter={(val) => CATEGORY_LABELS[val] || val} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No expense data</div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-navy">Recent Transactions</h3>
          <a href="/transactions" className="text-primary text-sm font-medium hover:underline">View all</a>
        </div>
        {recentTxns.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {recentTxns.map((txn) => (
              <div key={txn.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.type === "INCOME" ? "bg-green-50" : "bg-red-50"}`}>
                  {txn.type === "INCOME"
                    ? <ArrowUpRight size={18} className="text-green-500" />
                    : <ArrowDownRight size={18} className="text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy truncate">{txn.description || txn.category}</p>
                  <p className="text-xs text-gray-400">{txn.account?.name} · {new Date(txn.date).toLocaleDateString("en-IN")}</p>
                </div>
                <span className={`text-sm font-semibold ${txn.type === "INCOME" ? "text-green-600" : "text-red-500"}`}>
                  {txn.type === "INCOME" ? "+" : "-"}₹{parseFloat(txn.amount).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}