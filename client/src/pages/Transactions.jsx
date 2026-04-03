import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Filter, Upload, X, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import API from "../utils/axios";
import toast from "react-hot-toast";

const CATEGORIES = ["SALARY","INVESTMENTS","FOOD","TRANSPORT","HOUSING","ENTERTAINMENT","TRAVEL","HEALTH","SHOPPING","MISCELLANEOUS"];
const CATEGORY_LABELS = { FOOD:"Food",TRANSPORT:"Transport",HOUSING:"Housing",ENTERTAINMENT:"Entertainment",TRAVEL:"Travel",HEALTH:"Health",SHOPPING:"Shopping",MISCELLANEOUS:"Misc",SALARY:"Salary",INVESTMENTS:"Investments" };
const INTERVALS = ["DAILY","WEEKLY","MONTHLY","YEARLY"];

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
  const fileRef = useRef();

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
    const file = e.target.files[0];
    if (!file) return;
    setScanning(true);
    toast.loading("Scanning receipt with AI...", { id: "scan" });
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
      toast.success("Receipt scanned successfully!", { id: "scan" });
    } catch {
      toast.error("Receipt scan failed. Fill manually.", { id: "scan" });
    } finally { setScanning(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.accountId) return toast.error("Fill all required fields");
    setSubmitting(true);
    try {
      await API.post("/transactions", form);
      toast.success("Transaction added!");
      setShowModal(false);
      setForm({ type: "EXPENSE", amount: "", description: "", date: new Date().toISOString().split("T")[0], category: "FOOD", accountId: accounts[0]?.id || "", isRecurring: false, recurringInterval: "MONTHLY" });
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add transaction");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/transactions/${id}`);
      toast.success("Transaction deleted");
      fetchTransactions();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Transactions</h1>
          <p className="text-gray-500 text-sm mt-1">{pagination.total} total transactions</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition-colors text-sm">
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={15} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Filters</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <select className="input-field text-sm" value={filters.type}
            onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}>
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <select className="input-field text-sm" value={filters.category}
            onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
          <input type="date" className="input-field text-sm" value={filters.startDate}
            onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1); }} />
          <input type="date" className="input-field text-sm" value={filters.endDate}
            onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1); }} />
        </div>
        {(filters.type || filters.category || filters.startDate || filters.endDate) && (
          <button onClick={() => { setFilters({ type: "", category: "", startDate: "", endDate: "" }); setPage(1); }}
            className="mt-3 text-xs text-primary hover:underline flex items-center gap-1">
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No transactions found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Description", "Category", "Account", "Date", "Amount", ""].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-navy">{txn.description || "—"}</p>
                          {txn.isRecurring && <span className="text-xs text-purple-500 flex items-center gap-1"><RefreshCw size={10} /> Recurring</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                          {CATEGORY_LABELS[txn.category] || txn.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{txn.account?.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(txn.date).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-semibold ${txn.type === "INCOME" ? "text-green-600" : "text-red-500"}`}>
                          {txn.type === "INCOME" ? "+" : "-"}₹{parseFloat(txn.amount).toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(txn.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} transactions
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-navy">Add Transaction</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>

            {/* Receipt Upload */}
            <div className="mb-4 p-3 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50 cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileRef.current.click()}>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleScanReceipt} />
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                  <Upload size={16} color="white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-800">
                    {scanning ? "Scanning with AI..." : "Upload Receipt"}
                  </p>
                  <p className="text-xs text-purple-500">Auto-fill form using Gemini AI</p>
                </div>
                {scanning && <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin ml-auto" />}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-2">
                {["EXPENSE", "INCOME"].map((t) => (
                  <button key={t} type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${form.type === t ? t === "EXPENSE" ? "bg-red-500 text-white" : "bg-green-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {t}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Amount (₹) *</label>
                  <input type="number" className="input-field" placeholder="0"
                    value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" className="input-field"
                    value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <input className="input-field" placeholder="e.g. Swiggy order"
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                  <select className="input-field" value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Account *</label>
                  <select className="input-field" value={form.accountId}
                    onChange={(e) => setForm({ ...form, accountId: e.target.value })}>
                    {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Recurring */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <input type="checkbox" id="recurring" checked={form.isRecurring}
                  onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                  className="w-4 h-4 accent-primary" />
                <label htmlFor="recurring" className="text-sm font-medium text-gray-700">Recurring transaction</label>
              </div>

              {form.isRecurring && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
                  <select className="input-field" value={form.recurringInterval}
                    onChange={(e) => setForm({ ...form, recurringInterval: e.target.value })}>
                    {INTERVALS.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </span>
                ) : "Add Transaction"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}