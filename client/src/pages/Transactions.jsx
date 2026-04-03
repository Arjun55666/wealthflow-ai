import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Filter, Upload, X, RefreshCw, ChevronLeft, ChevronRight, Search, FileText } from "lucide-react";
import API from "../utils/axios";
import toast from "react-hot-toast";

const CATEGORIES = ["SALARY", "INVESTMENTS", "FOOD", "TRANSPORT", "HOUSING", "ENTERTAINMENT", "TRAVEL", "HEALTH", "SHOPPING", "MISCELLANEOUS"];
const CATEGORY_LABELS = { FOOD: "Food & Dining", TRANSPORT: "Transportation", HOUSING: "Housing & Rent", ENTERTAINMENT: "Entertainment", TRAVEL: "Travel", HEALTH: "Healthcare", SHOPPING: "Shopping", MISCELLANEOUS: "Misc", SALARY: "Salary", INVESTMENTS: "Investments" };
const INTERVALS = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [filters, setFilters] = useState({ type: "", category: "", startDate: "", endDate: "" });
  const [page, setPage] = useState(1);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    type: "EXPENSE", amount: "", description: "", date: new Date().toISOString().split("T")[0],
    category: "FOOD", accountId: "", isRecurring: false, recurringInterval: "MONTHLY",
  });

  useEffect(() => { fetchAccounts(); }, []);
  useEffect(() => { fetchTransactions(); }, [page, filters]);

  const fetchAccounts = async () => {
    try {
      const { data } = await API.get("/accounts");
      setAccounts(data.accounts);
      if (data.accounts.length > 0) setForm((f) => ({ ...f, accountId: data.accounts[0].id }));
    } catch { toast.error("Failed to sync accounts"); }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, ...filters });
      Object.keys(filters).forEach((k) => { if (!filters[k]) params.delete(k); });
      const { data } = await API.get(`/transactions?${params}`);
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch { toast.error("Failed to sync ledger"); }
    finally { setLoading(false); }
  };

  const handleScanReceipt = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    const toastId = toast.loading("AI analyzing receipt...", { style: { background: '#1A1A2E', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } });
    try {
      const formData = new FormData();
      formData.append("receipt", file);
      const { data } = await API.post("/receipts/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const d = data.data;
      setForm((f) => ({
        ...f,
        amount: d.amount || f.amount,
        description: d.description || f.description,
        category: d.category || f.category,
        date: d.date || f.date,
        type: "EXPENSE",
      }));
      toast.success("Receipt data extracted", { id: toastId });
    } catch {
      toast.error("Extraction failed, please input manually", { id: toastId });
    } finally { 
      setScanning(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.accountId) return toast.error("Amount and Account are required");
    setSubmitting(true);
    try {
      await API.post("/transactions", form);
      toast.success("Entry recorded");
      setShowModal(false);
      setForm({ type: "EXPENSE", amount: "", description: "", date: new Date().toISOString().split("T")[0], category: "FOOD", accountId: accounts[0]?.id || "", isRecurring: false, recurringInterval: "MONTHLY" });
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record entry");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this ledger entry?")) return;
    try {
      await API.delete(`/transactions/${id}`);
      toast.success("Entry removed");
      fetchTransactions();
    } catch { toast.error("Failed to remove entry"); }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Ledger</h1>
          <p className="text-gray-400 text-[13px] mt-1">Transaction history and recording</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-[13px] font-medium flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(124,58,237,0.2)] active:scale-95"
        >
          <Plus size={16} /> New Entry
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="glass-card rounded-xl p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <select 
              className="w-full bg-[#141923] border border-white/10 rounded-lg py-2 pl-3 pr-8 text-[13px] text-white appearance-none focus:outline-none focus:border-primary/50"
              value={filters.type}
              onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}
            >
              <option value="">All Flow Types</option>
              <option value="INCOME">Inflows</option>
              <option value="EXPENSE">Outflows</option>
            </select>
          </div>
          <div className="relative">
            <select 
              className="w-full bg-[#141923] border border-white/10 rounded-lg py-2 pl-3 pr-8 text-[13px] text-white appearance-none focus:outline-none focus:border-primary/50"
              value={filters.category}
              onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>
          <input 
            type="date" 
            className="w-full bg-[#141923] border border-white/10 rounded-lg py-2 px-3 text-[13px] text-white focus:outline-none focus:border-primary/50"
            value={filters.startDate}
            onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1); }} 
          />
          <input 
            type="date" 
            className="w-full bg-[#141923] border border-white/10 rounded-lg py-2 px-3 text-[13px] text-white focus:outline-none focus:border-primary/50"
            value={filters.endDate}
            onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1); }} 
          />
        </div>
        {(filters.type || filters.category || filters.startDate || filters.endDate) && (
          <button 
            onClick={() => { setFilters({ type: "", category: "", startDate: "", endDate: "" }); setPage(1); }}
            className="px-3 py-2 text-[12px] text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Ledger Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-gray-500 gap-3">
            <FileText size={32} className="text-gray-600" opacity={0.5} />
            <p className="text-[14px]">No ledger entries match your criteria</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#141923] text-gray-400 border-b border-white/5">
                  <tr>
                    <th className="px-5 py-3 font-medium uppercase tracking-wider text-[11px]">Date</th>
                    <th className="px-5 py-3 font-medium uppercase tracking-wider text-[11px]">Description</th>
                    <th className="px-5 py-3 font-medium uppercase tracking-wider text-[11px]">Category</th>
                    <th className="px-5 py-3 font-medium uppercase tracking-wider text-[11px]">Account</th>
                    <th className="px-5 py-3 font-medium uppercase tracking-wider text-[11px] text-right">Amount</th>
                    <th className="px-5 py-3 font-medium w-[60px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-5 py-3 text-gray-400 whitespace-nowrap">
                        {new Date(txn.date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3 text-gray-200 font-medium">
                        <div className="flex items-center gap-2">
                          {txn.description || "—"}
                          {txn.isRecurring && (
                            <RefreshCw size={12} className="text-primary/70" />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#1A1A2E] text-gray-300 border border-white/10">
                          {CATEGORY_LABELS[txn.category] || txn.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400">{txn.account?.name}</td>
                      <td className={`px-5 py-3 text-right font-mono font-medium ${txn.type === "INCOME" ? "text-green-400" : "text-gray-200"}`}>
                        {txn.type === "INCOME" ? "+" : "-"}{formatCurrency(parseFloat(txn.amount))}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button 
                          onClick={() => handleDelete(txn.id)}
                          className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-4 border-t border-white/5 flex items-center justify-between bg-[#141923]/50">
              <p className="text-[12px] text-gray-500">
                Showing page <span className="text-gray-300">{pagination.page}</span> of <span className="text-gray-300">{pagination.totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage((p) => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  className="p-1.5 rounded bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} 
                  disabled={page === pagination.totalPages}
                  className="p-1.5 rounded bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          <div className="relative bg-[#0D111A] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-[16px] font-semibold text-white tracking-tight">Record Entry</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {/* Receipt Scan Button */}
              <div 
                className="mb-5 p-4 border border-dashed border-primary/30 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group"
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleScanReceipt} />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    {scanning ? <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Upload size={18} />}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-gray-200">
                      {scanning ? "Processing via AI..." : "Scan Receipt"}
                    </p>
                    <p className="text-[12px] text-gray-500">Auto-extract details from image</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type Toggle */}
                <div className="flex p-1 bg-[#141923] rounded-lg border border-white/5">
                  <button 
                    type="button"
                    onClick={() => setForm({ ...form, type: "EXPENSE" })}
                    className={`flex-1 py-2 text-[12px] font-medium rounded-md transition-all ${form.type === "EXPENSE" ? "bg-red-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
                  >
                    Outflow
                  </button>
                  <button 
                    type="button"
                    onClick={() => setForm({ ...form, type: "INCOME" })}
                    className={`flex-1 py-2 text-[12px] font-medium rounded-md transition-all ${form.type === "INCOME" ? "bg-green-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
                  >
                    Inflow
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-gray-400">Amount (₹)</label>
                    <input 
                      type="number" 
                      required
                      className="w-full bg-[#141923] border border-white/10 rounded-lg py-2.5 px-3 text-[14px] text-white focus:outline-none focus:border-primary/50 font-mono" 
                      placeholder="0.00"
                      value={form.amount} 
                      onChange={(e) => setForm({ ...form, amount: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-gray-400">Date</label>
                    <input 
                      type="date" 
                      required
                      className="w-full bg-[#141923] border border-white/10 rounded-lg py-2.5 px-3 text-[14px] text-white focus:outline-none focus:border-primary/50"
                      value={form.date} 
                      onChange={(e) => setForm({ ...form, date: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-gray-400">Description</label>
                  <input 
                    type="text"
                    className="w-full bg-[#141923] border border-white/10 rounded-lg py-2.5 px-3 text-[14px] text-white focus:outline-none focus:border-primary/50" 
                    placeholder="e.g. Server hosting"
                    value={form.description} 
                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-gray-400">Category</label>
                    <select 
                      className="w-full bg-[#141923] border border-white/10 rounded-lg py-2.5 px-3 text-[13px] text-white focus:outline-none focus:border-primary/50 appearance-none"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-gray-400">Account</label>
                    <select 
                      required
                      className="w-full bg-[#141923] border border-white/10 rounded-lg py-2.5 px-3 text-[13px] text-white focus:outline-none focus:border-primary/50 appearance-none"
                      value={form.accountId}
                      onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                    >
                      {accounts.length === 0 && <option value="">No accounts</option>}
                      {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-[#141923] rounded-lg border border-white/5 flex items-center justify-between mt-2">
                  <label htmlFor="recurring" className="text-[13px] text-gray-300 select-none cursor-pointer">Make recurring</label>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      id="recurring" 
                      className="sr-only peer"
                      checked={form.isRecurring}
                      onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                    />
                    <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </div>

                {form.isRecurring && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[12px] font-medium text-gray-400">Interval</label>
                    <select 
                      className="w-full bg-[#141923] border border-white/10 rounded-lg py-2.5 px-3 text-[13px] text-white focus:outline-none focus:border-primary/50 appearance-none"
                      value={form.recurringInterval}
                      onChange={(e) => setForm({ ...form, recurringInterval: e.target.value })}
                    >
                      {INTERVALS.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                )}

                <div className="pt-4">
                  <button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg text-[14px] font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Recording...</span>
                      </>
                    ) : "Save Entry"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}