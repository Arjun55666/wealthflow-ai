import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, PiggyBank, Calendar } from "lucide-react";
import API from "../utils/axios";
import toast from "react-hot-toast";
import { COLORS, CATEGORY_LABELS, MONTHS, formatCurrency } from "../utils/constants";

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
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-[13px] text-gray-600 uppercase tracking-widest">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const netSavings = parseFloat(summary?.netSavings || 0);

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-400">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Analytics</h1>
          <p className="text-gray-500 text-[13px] mt-0.5">Detailed financial insights and reports</p>
        </div>

        <div className="flex items-center gap-2 bg-[#141928] border border-white/8 rounded-xl px-3 py-2">
          <Calendar size={13} className="text-gray-600" />
          <select
            className="bg-transparent border-none text-[13px] text-gray-300 focus:outline-none appearance-none cursor-pointer pr-2"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {MONTHS.map((m, i) => <option key={i} value={i + 1} className="bg-[#141928]">{m}</option>)}
          </select>
          <div className="w-px h-3.5 bg-white/10" />
          <select
            className="bg-transparent border-none text-[13px] text-gray-300 focus:outline-none appearance-none cursor-pointer pl-1"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map((y) => <option key={y} value={y} className="bg-[#141928]">{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-white/12 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/6 rounded-full blur-[24px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp size={14} className="text-green-400" />
            </div>
            <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest">Income</p>
          </div>
          <h3 className="text-[24px] font-semibold text-white tracking-tight">{formatCurrency(parseFloat(summary?.totalIncome || 0))}</h3>
          <p className="text-[12px] text-gray-600 mt-0.5">{MONTHS[selectedMonth - 1]} {selectedYear}</p>
        </div>

        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-white/12 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/6 rounded-full blur-[24px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
              <TrendingDown size={14} className="text-red-400" />
            </div>
            <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest">Expenses</p>
          </div>
          <h3 className="text-[24px] font-semibold text-white tracking-tight">{formatCurrency(parseFloat(summary?.totalExpense || 0))}</h3>
          <p className="text-[12px] text-gray-600 mt-0.5">{MONTHS[selectedMonth - 1]} {selectedYear}</p>
        </div>

        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-white/12 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/6 rounded-full blur-[24px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <PiggyBank size={14} className="text-primary" />
            </div>
            <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest">Net Savings</p>
          </div>
          <h3 className={`text-[24px] font-semibold tracking-tight ${netSavings >= 0 ? "text-white" : "text-red-400"}`}>
            {formatCurrency(netSavings)}
          </h3>
          <p className="text-[12px] text-gray-600 mt-0.5">{MONTHS[selectedMonth - 1]} {selectedYear}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card rounded-2xl p-5">
          <div className="mb-5">
            <h3 className="text-[14px] font-semibold text-gray-200">6-Month Cash Flow</h3>
            <p className="text-[12px] text-gray-600 mt-0.5">Income vs expenses over time</p>
          </div>
          <div className="h-[260px] w-full">
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
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} name="Income" />
                <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={28} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex flex-col">
          <div className="mb-3">
            <h3 className="text-[14px] font-semibold text-gray-200">Spending Breakdown</h3>
            <p className="text-[12px] text-gray-600 mt-0.5">By category for selected period</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {categoryData.length > 0 ? (
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={72}
                      outerRadius={100}
                      stroke="transparent"
                      strokeWidth={0}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0E1220', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '13px' }}
                      formatter={(val) => [formatCurrency(val), ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-600 text-[13px]">No spending data for this period</p>
            )}
          </div>
        </div>
      </div>

      {categoryData.length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="text-[14px] font-semibold text-gray-200">Category Breakdown</h3>
            <p className="text-[12px] text-gray-600 mt-0.5">Detailed spending by category</p>
          </div>
          <div className="p-5 space-y-5">
            {[...categoryData].sort((a, b) => b.amount - a.amount).map((item, i) => {
              const total = categoryData.reduce((sum, c) => sum + c.amount, 0);
              const pct = ((item.amount / total) * 100).toFixed(1);
              const color = COLORS[i % COLORS.length];

              return (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-[13px] font-medium text-gray-300">{CATEGORY_LABELS[item.category] || item.category}</span>
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-[13px] font-semibold text-white">{formatCurrency(item.amount)}</span>
                      <span className="text-[11px] text-gray-600 ml-2">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/4 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
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
