import { useState, useEffect } from "react";
import { Plus, Trash2, Wallet, Building2, Landmark, X } from "lucide-react";
import API from "../utils/axios";
import toast from "react-hot-toast";

const formatCurrency = (val) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({ name: "", balance: "", budget: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    try {
      const { data } = await API.get("/accounts");
      setAccounts(data.accounts);
    } catch {
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error("Account name is required");
    setSubmitting(true);
    try {
      await API.post("/accounts", {
        name: form.name,
        balance: parseFloat(form.balance) || 0,
        budget: form.budget ? parseFloat(form.budget) : null,
      });
      toast.success("Account created successfully");
      setShowModal(false);
      setForm({ name: "", balance: "", budget: "" });
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create account");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this account? This will affect your transaction history.")) return;
    setDeleting(id);
    try {
      await API.delete(`/accounts/${id}`);
      toast.success("Account deleted");
      fetchAccounts();
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setDeleting(null);
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-400">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Accounts</h1>
          <p className="text-gray-500 text-[13px] mt-0.5">Manage your accounts and budgets</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-[13px] font-medium flex items-center gap-2 transition-all duration-200 shadow-[0_0_16px_oklch(0.60_0.22_278/0.22)] hover:shadow-[0_0_24px_oklch(0.60_0.22_278/0.32)] active:scale-95 w-full sm:w-auto justify-center"
        >
          <Plus size={15} />
          New Account
        </button>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#161929] to-[#0C0F1A] border border-white/8 p-7">
        <div className="absolute top-0 right-0 w-56 h-56 bg-primary/8 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-[11px] font-semibold text-primary uppercase tracking-widest mb-2">Total Balance</p>
          <h2 className="text-[38px] md:text-[46px] font-bold text-white tracking-tight leading-none">{formatCurrency(totalBalance)}</h2>
          <div className="flex items-center gap-4 mt-5 text-[12px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <Landmark size={13} className="text-gray-600" />
              {accounts.length} {accounts.length === 1 ? "Account" : "Accounts"}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="w-7 h-7 border-2 border-primary/25 border-t-primary rounded-full animate-spin" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="glass-card rounded-2xl p-14 text-center flex flex-col items-center justify-center border-dashed border-white/8">
          <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-4">
            <Wallet size={22} className="text-gray-600" />
          </div>
          <p className="text-gray-300 font-medium mb-1">No accounts yet</p>
          <p className="text-gray-600 text-[13px] mb-6 max-w-xs">Create your first account to start tracking your finances and setting budgets.</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary/15 hover:bg-primary/25 text-primary px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 border border-primary/20"
          >
            Create account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const usedPercent = account.budget
              ? Math.min((parseFloat(account.usedAmount) / parseFloat(account.budget)) * 100, 100)
              : 0;
            const isNearLimit = usedPercent >= 80;
            const isOverLimit = usedPercent >= 100;

            return (
              <div key={account.id} className="glass-card rounded-2xl p-5 group hover:border-white/12 transition-all duration-300">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/4 border border-white/6 flex items-center justify-center text-gray-500 group-hover:text-primary group-hover:border-primary/25 group-hover:bg-primary/8 transition-all duration-200">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-100 text-[14px] leading-snug">{account.name}</h3>
                      <p className="text-[10px] text-gray-600 mt-0.5 font-mono">{account.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(account.id)}
                    disabled={deleting === account.id}
                    className="text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 rounded-lg hover:bg-red-500/8"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-1">Balance</p>
                  <p className="text-[22px] font-semibold text-white tracking-tight">{formatCurrency(parseFloat(account.balance))}</p>
                </div>

                {account.budget ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[12px]">
                      <span className="text-gray-600">Budget used</span>
                      <span className={`font-semibold ${isOverLimit ? "text-red-400" : isNearLimit ? "text-amber-400" : "text-gray-300"}`}>
                        {usedPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${isOverLimit ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-primary"}`}
                        style={{ width: `${usedPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-600">
                      <span>{formatCurrency(parseFloat(account.usedAmount))} spent</span>
                      <span>{formatCurrency(parseFloat(account.budget))} limit</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-2.5 px-3.5 bg-white/3 border border-white/5 rounded-xl text-[12px] text-gray-600">
                    No budget set
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowModal(false)} />

          <div className="relative bg-[#0E1220] border border-white/8 rounded-2xl w-full max-w-md shadow-[0_32px_80px_rgba(0,0,0,0.6)] animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h2 className="text-[15px] font-semibold text-white">New Account</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-gray-500 block">Account name</label>
                <div className="flex items-center bg-[#141928] border border-white/[0.08] rounded-xl transition-all duration-200 focus-within:border-primary/45 focus-within:ring-1 focus-within:ring-primary/15">
                  <div className="pl-3.5 pr-2 flex items-center flex-shrink-0">
                    <Building2 size={15} className="text-gray-600" />
                  </div>
                  <input
                    required
                    className="flex-1 min-w-0 bg-transparent py-2.5 pr-3 text-[14px] text-white placeholder:text-gray-600 focus:outline-none"
                    placeholder="e.g. Savings, Checking"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-gray-500 block">Opening balance (₹)</label>
                <input
                  type="number"
                  className="w-full bg-[#141928] border border-white/8 rounded-xl py-2.5 px-3 text-[14px] text-white placeholder:text-gray-700 focus:outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/15 transition-all duration-200"
                  placeholder="0"
                  value={form.balance}
                  onChange={(e) => setForm({ ...form, balance: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-gray-500 block">
                  Monthly budget limit <span className="text-gray-700 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  className="w-full bg-[#141928] border border-white/8 rounded-xl py-2.5 px-3 text-[14px] text-white placeholder:text-gray-700 focus:outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/15 transition-all duration-200"
                  placeholder="e.g. 50000"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                />
                <p className="text-[11px] text-gray-700">Leave empty to skip budget tracking for this account</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl text-[14px] font-medium flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none shadow-[0_0_20px_oklch(0.60_0.22_278/0.2)]"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
