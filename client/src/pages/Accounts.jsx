import { useState, useEffect } from "react";
import { Plus, Trash2, Wallet, CreditCard, Building2, Landmark, X } from "lucide-react";
import API from "../utils/axios";
import toast from "react-hot-toast";

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
      toast.success("Account provisioned");
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
    if(!window.confirm("Archive this account? This may affect ledger history.")) return;
    setDeleting(id);
    try {
      await API.delete(`/accounts/${id}`);
      toast.success("Account archived");
      fetchAccounts();
    } catch {
      toast.error("Failed to archive account");
    } finally {
      setDeleting(null);
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Portfolios</h1>
          <p className="text-gray-400 text-[13px] mt-1">Manage institutional accounts and budgets</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-[13px] font-medium flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(124,58,237,0.2)] active:scale-95"
        >
          <Plus size={16} /> New Portfolio
        </button>
      </div>

      {/* Aggregate Overview */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1A1A2E] to-[#0D111A] border border-white/10 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-[12px] font-semibold text-primary uppercase tracking-wider mb-2">Total Managed Assets</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{formatCurrency(totalBalance)}</h2>
          <div className="flex items-center gap-4 mt-6 text-[13px] text-gray-400">
            <span className="flex items-center gap-1.5"><Landmark size={14} className="text-gray-500" /> {accounts.length} Active Portfolios</span>
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center flex flex-col items-center justify-center border-dashed border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <Wallet size={24} className="text-gray-500" />
          </div>
          <p className="text-gray-300 font-medium mb-1">No Portfolios Provisioned</p>
          <p className="text-gray-500 text-[13px] mb-6 max-w-sm">Create your first account to begin tracking assets and setting budgets.</p>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 rounded-lg text-[13px] font-medium transition-colors"
          >
            Create Portfolio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((account) => {
            const usedPercent = account.budget
              ? Math.min((parseFloat(account.usedAmount) / parseFloat(account.budget)) * 100, 100)
              : 0;
              
            const isNearLimit = usedPercent >= 80;
            const isOverLimit = usedPercent >= 100;

            return (
              <div key={account.id} className="glass-card rounded-xl p-6 group hover:border-white/15 transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#141923] border border-white/5 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-200 text-[15px]">{account.name}</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">ID: {account.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(account.id)} 
                    disabled={deleting === account.id}
                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Balance</p>
                  <p className="text-2xl font-semibold text-white tracking-tight font-mono">{formatCurrency(parseFloat(account.balance))}</p>
                </div>

                {account.budget ? (
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-[12px]">
                      <span className="text-gray-400">Budget Utilization</span>
                      <span className={`font-medium ${isOverLimit ? 'text-red-400' : isNearLimit ? 'text-amber-400' : 'text-gray-300'}`}>
                        {usedPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#141923] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-primary'}`}
                        style={{ width: `${usedPercent}%` }} 
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500 font-mono">
                      <span>{formatCurrency(parseFloat(account.usedAmount))}</span>
                      <span>{formatCurrency(parseFloat(account.budget))} limit</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-3 px-4 bg-white/[0.02] border border-white/5 rounded-lg text-[12px] text-gray-500 flex items-center justify-between">
                    <span>No budget limit set</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Account Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          <div className="relative bg-[#0D111A] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-[16px] font-semibold text-white tracking-tight">Provision Portfolio</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-gray-400 block">Portfolio Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 size={16} className="text-gray-500" />
                  </div>
                  <input 
                    required
                    className="w-full bg-[#141923] border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-[14px] text-white focus:outline-none focus:border-primary/50" 
                    placeholder="e.g. Chase Checking, Vanguard"
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-gray-400 block">Initial Asset Value (₹)</label>
                <input 
                  type="number" 
                  required
                  className="w-full bg-[#141923] border border-white/10 rounded-lg py-2.5 px-3 text-[14px] text-white focus:outline-none focus:border-primary/50 font-mono" 
                  placeholder="0.00"
                  value={form.balance} 
                  onChange={(e) => setForm({ ...form, balance: e.target.value })} 
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[12px] font-medium text-gray-400 block">Monthly Budget Limit <span className="text-gray-600 font-normal">(Optional)</span></label>
                <input 
                  type="number" 
                  className="w-full bg-[#141923] border border-white/10 rounded-lg py-2.5 px-3 text-[14px] text-white focus:outline-none focus:border-primary/50 font-mono" 
                  placeholder="e.g. 50000"
                  value={form.budget} 
                  onChange={(e) => setForm({ ...form, budget: e.target.value })} 
                />
                <p className="text-[11px] text-gray-500 mt-1">Leave empty if you don't want to track budget limits for this portfolio.</p>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg text-[14px] font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Provisioning...</span>
                    </>
                  ) : "Create Portfolio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}