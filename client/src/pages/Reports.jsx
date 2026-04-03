import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, TrendingDown, PiggyBank, Calendar, Filter } from "lucide-react";
import API from "../utils/axios";
import toast from "react-hot-toast";

const COLORS = ["#7C3AED", "#3B82F6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6", "#6366F1", "#14B8A6"];
const CATEGORY_LABELS = { FOOD:"Food & Dining", TRANSPORT:"Transportation", HOUSING:"Housing & Rent", ENTERTAINMENT:"Entertainment", TRAVEL:"Travel", HEALTH:"Healthcare", SHOPPING:"Shopping", MISCELLANEOUS:"Miscellaneous", SALARY:"Salary", INVESTMENTS:"Investments" };
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
      toast.error("Failed to compile analytics");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-mono tracking-widest uppercase">Compiling Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Analytics</h1>
          <p className="text-gray-400 text-[13px] mt-1">Deep institutional insights and reporting</p>
        </div>
        
        <div className="flex items-center gap-3 bg-[#141923] p-1.5 rounded-lg border border-white/5">
          <div className="flex items-center gap-2 pl-3">
            <Calendar size={14} className="text-gray-500" />
          </div>
          <select 
            className="bg-transparent border-none text-[13px] text-white focus:outline-none appearance-none pr-4 cursor-pointer" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {MONTHS.map((m, i) => <option key={i} value={i + 1} className="bg-[#141923]">{m}</option>)}
          </select>
          <div className="w-[1px] h-4 bg-white/10" />
          <select 
            className="bg-transparent border-none text-[13px] text-white focus:outline-none appearance-none pl-2 pr-4 cursor-pointer" 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map((y) => <option key={y} value={y} className="bg-[#141923]">{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/2" />
          <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Period Inflows</p>
          <h3 className="text-3xl font-semibold text-white tracking-tight font-mono">{formatCurrency(parseFloat(summary?.totalIncome || 0))}</h3>
        </div>

        <div className="glass-card rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/2" />
          <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Period Outflows</p>
          <h3 className="text-3xl font-semibold text-white tracking-tight font-mono">{formatCurrency(parseFloat(summary?.totalExpense || 0))}</h3>
        </div>

        <div className="glass-card rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/2" />
          <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Net Period Yield</p>
          <h3 className={`text-3xl font-semibold tracking-tight font-mono ${(summary?.netSavings || 0) >= 0 ? "text-primary" : "text-red-400"}`}>
            {formatCurrency(parseFloat(summary?.netSavings || 0))}
          </h3>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trailing 6M Trend */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-[14px] font-semibold text-gray-200 mb-6">Trailing 6M Trend</h3>
          <div className="h-[300px] w-full">
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
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={30} name="Inflows" />
                <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={30} name="Outflows" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Allocation */}
        <div className="glass-card rounded-xl p-6 flex flex-col">
          <h3 className="text-[14px] font-semibold text-gray-200 mb-6">Capital Allocation</h3>
          <div className="flex-1 flex items-center justify-center">
            {categoryData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={categoryData} 
                      dataKey="amount" 
                      nameKey="category" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={80} 
                      outerRadius={110} 
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
              <p className="text-gray-500 text-[13px]">Insufficient data for allocation visualization</p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      {categoryData.length > 0 && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="text-[14px] font-semibold text-gray-200">Line-Item Allocation Breakdown</h3>
          </div>
          <div className="p-6 space-y-6">
            {categoryData.sort((a, b) => b.amount - a.amount).map((item, i) => {
              const total = categoryData.reduce((sum, c) => sum + c.amount, 0);
              const pct = ((item.amount / total) * 100).toFixed(1);
              const color = COLORS[i % COLORS.length];
              
              return (
                <div key={i} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                      <span className="text-[13px] font-medium text-gray-200">{CATEGORY_LABELS[item.category] || item.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] font-mono font-semibold text-white">{formatCurrency(item.amount)}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{pct}% of total outflows</div>
                    </div>
                  </div>
                  <div className="w-full bg-[#141923] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${pct}%`, backgroundColor: color }} 
                    />
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