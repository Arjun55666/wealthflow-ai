import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, Upload, X, RefreshCw, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import API from "../utils/axios";
import toast from "react-hot-toast";
import { CATEGORIES, CATEGORY_LABELS, INTERVALS, formatCurrency } from "../utils/constants";

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
    type: "EXPENSE", amount: "", description: "",
    date: new Date().toISOString().split("T")[0],
    category: "FOOD", accountId: "", isRecurring: false, recurringInterval: "MONTHLY",
  });

  useEffect(() => { fetchAccounts(); }, []);
  useEffect(() => { fetchTransactions(); }, [page, filters]);

  const fetchAccounts = async () => {
    try {
      const { data } = await API.get("/accounts");
      setAccounts(data.accounts);
      if (data.accounts.length > 0) setForm((f) => ({ ...f, accountId: data.accounts[0].id }));
    } catch { toast.error("Failed to load accounts"); }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, ...filters });
      Object.keys(filters).forEach((k) => { if (!filters[k]) params.delete(k); });
      const { data } = await API.get(`/transactions?${params}`);
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch { toast.error("Failed to load transactions"); }
    finally { setLoading(false); }
  };

  const handleScanReceipt = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    const toastId = toast.loading("Scanning receipt with AI...");
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
      if (data.demo) {
        toast.success("Demo data filled in (AI quota reached — edit fields as needed)", { id: toastId, duration: 5000 });
      } else {
        toast.success("Receipt scanned successfully!", { id: toastId });
      }
    } catch {
      toast.error("Could not scan receipt, please enter details manually", { id: toastId });
    } finally {
      setScanning(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.accountId) return toast.error("Amount and account are required");
    setSubmitting(true);
    try {
      await API.post("/transactions", form);
      toast.success("Transaction saved");
      setShowModal(false);
      setForm({ type: "EXPENSE", amount: "", description: "", date: new Date().toISOString().split("T")[0], category: "FOOD", accountId: accounts[0]?.id || "", isRecurring: false, recurringInterval: "MONTHLY" });
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save transaction");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await API.delete(`/transactions/${id}`);
      toast.success("Transaction deleted");
      fetchTransactions();
    } catch { toast.error("Failed to delete transaction"); }
  };

  const hasFilters = filters.type || filters.category || filters.startDate || filters.endDate;

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-400">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Transactions</h1>
          <p className="text-gray-500 text-[13px] mt-0.5">Track your income and expenses</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-[13px] font-medium flex items-center gap-2 transition-all duration-200 shadow-[0_0_16px_oklch(0.60_0.22_278/0.22)] hover:shadow-[0_0_24px_oklch(0.60_0.22_278/0.32)] active:scale-95 w-full sm:w-auto justify-center"
        >
          <Plus size={15} />
          New Transaction
        </button>
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select
            className="w-full bg-[#141928] border border-white/8 rounded-xl py-2.5 pl-3 pr-8 text-[13px] text-gray-300 appearance-none focus:outline-none focus:border-primary/40 transition-all duration-200 cursor-pointer"
            value={filters.type}
            onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}
          >
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <select
            className="w-full bg-[#141928] border border-white/8 rounded-xl py-2.5 pl-3 pr-8 text-[13px] text-gray-300 appearance-none focus:outline-none focus:border-primary/40 transition-all duration-200 cursor-pointer"
            value={filters.category}
            onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
          <input
            type="date"
            className="w-full bg-[#141928] border border-white/8 rounded-xl py-2.5 px-3 text-[13px] text-gray-400 focus:outline-none focus:border-primary/40 transition-all duration-200"
            value={filters.startDate}
            onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1); }}
          />
          <div className="flex gap-2">
            <input
              type="date"
              className="flex-1 min-w-0 bg-[#141928] border border-white/8 rounded-xl py-2.5 px-3 text-[13px] text-gray-400 focus:outline-none focus:border-primary/40 transition-all duration-200"
              value={filters.endDate}
              onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1); }}
            />
            {hasFilters && (
              <button
                onClick={() => { setFilters({ type: "", category: "", startDate: "", endDate: "" }); setPage(1); }}
                className="px-3 py-2 text-[12px] text-gray-500 hover:text-white bg-white/5 hover:bg-white/8 rounded-xl transition-all duration-200 flex items-center gap-1 flex-shrink-0"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="h-[360px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary/25 border-t-primary rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="h-[360px] flex flex-col items-center justify-center text-gray-600 gap-3">
            <FileText size={28} className="opacity-40" />
            <p className="text-[13px]">No transactions found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#141928]/70 text-gray-600 border-b border-white/5">
                  <tr>
                    <th className="px-5 py-3 font-medium uppercase tracking-widest text-[10px]">Date</th>
                    <th className="px-5 py-3 font-medium uppercase tracking-widest text-[10px]">Description</th>
                    <th className="px-5 py-3 font-medium uppercase tracking-widest text-[10px] hidden md:table-cell">Category</th>
                    <th className="px-5 py-3 font-medium uppercase tracking-widest text-[10px] hidden lg:table-cell">Account</th>
                    <th className="px-5 py-3 font-medium uppercase tracking-widest text-[10px] text-right">Amount</th>
                    <th className="px-5 py-3 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-white/[0.018] transition-colors group">
                      <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap text-[12px]">
                        {new Date(txn.date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5 text-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{txn.description || "—"}</span>
                          {txn.isRecurring && (
                            <RefreshCw size={11} className="text-primary/60 flex-shrink-0" />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-white/4 text-gray-400 border border-white/6">
                          {CATEGORY_LABELS[txn.category] || txn.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 text-[12px] hidden lg:table-cell">{txn.account?.name}</td>
                      <td className={`px-5 py-3.5 text-right font-semibold ${txn.type === "INCOME" ? "text-green-400" : "text-gray-200"}`}>
                        {txn.type === "INCOME" ? "+" : "−"}{formatCurrency(parseFloat(txn.amount))}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDelete(txn.id)}
                          className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/8 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3.5 border-t border-white/5 flex items-center justify-between bg-[#141928]/40">
              <p className="text-[12px] text-gray-600">
                Page <span className="text-gray-400">{pagination.page}</span> of <span className="text-gray-400">{pagination.totalPages}</span>
                <span className="ml-2 text-gray-700">({pagination.total} total)</span>
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg bg-white/5 text-gray-500 hover:bg-white/8 hover:text-gray-300 disabled:opacity-25 disabled:pointer-events-none transition-all duration-200"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="p-1.5 rounded-lg bg-white/5 text-gray-500 hover:bg-white/8 hover:text-gray-300 disabled:opacity-25 disabled:pointer-events-none transition-all duration-200"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showModal && createPortal(
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999, overflowY: "auto",
            backgroundColor: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "flex-start", justifyContent: "center",
            padding: "32px 16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: "448px" }}
            className="bg-[#0E1220] border border-white/8 rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h2 className="text-[15px] font-semibold text-white">New Transaction</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                <X size={17} />
              </button>
            </div>

            <div className="p-5">
              <div
                className="mb-5 p-4 border border-dashed border-primary/25 rounded-2xl bg-primary/4 hover:bg-primary/8 transition-colors cursor-pointer group"
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleScanReceipt} />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                    {scanning ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Upload size={16} />}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-gray-200">
                      {scanning ? "Analyzing receipt..." : "Scan receipt with AI"}
                    </p>
                    <p className="text-[11px] text-gray-600">Automatically extract amount, category and date</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex p-1 bg-[#141928] rounded-xl border border-white/5 gap-1">
                  <button type="button" onClick={() => setForm({ ...form, type: "EXPENSE" })}
                    className={`flex-1 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 ${form.type === "EXPENSE" ? "bg-red-500/80 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}>
                    Expense
                  </button>
                  <button type="button" onClick={() => setForm({ ...form, type: "INCOME" })}
                    className={`flex-1 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 ${form.type === "INCOME" ? "bg-green-500/80 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}>
                    Income
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-gray-500">Amount (₹)</label>
                    <input type="number" required placeholder="0" value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="w-full bg-[#141928] border border-white/8 rounded-xl py-2.5 px-3 text-[14px] text-white placeholder:text-gray-700 focus:outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/15 transition-all duration-200" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-gray-500">Date</label>
                    <input type="date" required value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full bg-[#141928] border border-white/8 rounded-xl py-2.5 px-3 text-[14px] text-gray-300 focus:outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/15 transition-all duration-200" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-gray-500">Description</label>
                  <input type="text" placeholder="What was this for?" value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-[#141928] border border-white/8 rounded-xl py-2.5 px-3 text-[14px] text-white placeholder:text-gray-700 focus:outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/15 transition-all duration-200" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-gray-500">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-[#141928] border border-white/8 rounded-xl py-2.5 px-3 text-[13px] text-gray-300 focus:outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/15 transition-all duration-200 appearance-none">
                      {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-gray-500">Account</label>
                    <select required value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                      className="w-full bg-[#141928] border border-white/8 rounded-xl py-2.5 px-3 text-[13px] text-gray-300 focus:outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/15 transition-all duration-200 appearance-none">
                      {accounts.length === 0 && <option value="">No accounts</option>}
                      {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="p-3.5 bg-[#141928] rounded-xl border border-white/5 flex items-center justify-between">
                  <label htmlFor="recurring" className="text-[13px] text-gray-400 select-none cursor-pointer">Recurring transaction</label>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="recurring" className="sr-only peer" checked={form.isRecurring}
                      onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })} />
                    <div className="w-9 h-5 bg-white/8 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary transition-colors duration-200" />
                  </div>
                </div>

                {form.isRecurring && (
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-gray-500">Repeat every</label>
                    <select value={form.recurringInterval} onChange={(e) => setForm({ ...form, recurringInterval: e.target.value })}
                      className="w-full bg-[#141928] border border-white/8 rounded-xl py-2.5 px-3 text-[13px] text-gray-300 focus:outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/15 transition-all duration-200 appearance-none">
                      {INTERVALS.map((i) => <option key={i} value={i}>{i.charAt(0) + i.slice(1).toLowerCase()}</option>)}
                    </select>
                  </div>
                )}

                <div className="pt-2">
                  <button type="submit" disabled={submitting}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl text-[14px] font-medium flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none shadow-[0_0_20px_oklch(0.60_0.22_278/0.2)]">
                    {submitting ? (
                      <><div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />Saving...</>
                    ) : "Save Transaction"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
