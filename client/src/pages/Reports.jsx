import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, TrendingDown, PiggyBank, Calendar } from "lucide-react";
import API from "../utils/axios";
import toast from "react-hot-toast";

const COLORS = ["#6c63ff","#06b6d4","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6"];
const CATEGORY_LABELS = { FOOD:"Food",TRANSPORT:"Transport",HOUSING:"Housing",ENTERTAINMENT:"Entertainment",TRAVEL:"Travel",HEALTH:"Health",SHOPPING:"Shopping",MISCELLANEOUS:"Misc",SALARY:"Salary",INVESTMENTS:"Investments" };
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function Reports() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => { fetchData(); }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [monthlyRes, categoryRes, summaryRes] = await Promise.all([
        API.get("/graph/monthly"),
        API.get(`/graph/categories?month=${selectedMonth}&year=${selectedYear}`),
        API.get(`/transactions/summary?month=${selectedMonth}&year=${selectedYear}`),
      ]);
      setMonthlyData(monthlyRes.data.data);
      setCategoryData(categoryRes.data.data);
      setSummary(summaryRes.data.summary);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Financial insights and analytics</p>
        </div>
        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <select className="input-field w-auto text-sm" value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="input-field w-auto text-sm" value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Total Income</span>
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <TrendingUp size={18} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">₹{parseFloat(summary?.totalIncome || 0).toLocaleString("en-IN")}</p>
          <p className="text-xs text-gray-400 mt-1">{MONTHS[selectedMonth - 1]} {selectedYear}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Total Expenses</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <TrendingDown size={18} className="text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-500">₹{parseFloat(summary?.totalExpense || 0).toLocaleString("en-IN")}</p>
          <p className="text-xs text-gray-400 mt-1">{MONTHS[selectedMonth - 1]} {selectedYear}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Net Savings</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <PiggyBank size={18} className="text-blue-500" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${(summary?.netSavings || 0) >= 0 ? "text-blue-600" : "text-red-500"}`}>
            ₹{parseFloat(summary?.netSavings || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gray-400 mt-1">{MONTHS[selectedMonth - 1]} {selectedYear}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bar Chart */}
        <div className="card p-6">
          <h3 className="font-semibold text-navy mb-1">6-Month Overview</h3>
          <p className="text-gray-400 text-xs mb-4">Income vs Expenses trend</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                formatter={(val) => [`₹${val.toLocaleString("en-IN")}`, ""]}
              />
              <Bar dataKey="income" fill="#6c63ff" radius={[4,4,0,0]} name="Income" />
              <Bar dataKey="expense" fill="#fca5a5" radius={[4,4,0,0]} name="Expense" />
              <Bar dataKey="savings" fill="#34d399" radius={[4,4,0,0]} name="Savings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="card p-6">
          <h3 className="font-semibold text-navy mb-1">Spending by Category</h3>
          <p className="text-gray-400 text-xs mb-4">{MONTHS[selectedMonth - 1]} {selectedYear}</p>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val) => [`₹${val.toLocaleString("en-IN")}`, ""]} />
                <Legend formatter={(val) => CATEGORY_LABELS[val] || val} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No expense data for this month</div>
          )}
        </div>
      </div>

      {/* Category Breakdown Table */}
      {categoryData.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-navy mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {categoryData.sort((a, b) => b.amount - a.amount).map((item, i) => {
              const total = categoryData.reduce((sum, c) => sum + c.amount, 0);
              const pct = ((item.amount / total) * 100).toFixed(1);
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-700">{CATEGORY_LABELS[item.category] || item.category}</span>
                    <div className="flex gap-3">
                      <span className="text-gray-400">{pct}%</span>
                      <span className="font-semibold text-navy">₹{item.amount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}