import { useState, useEffect } from "react";
import { Plus, Trash2, Wallet, TrendingUp, X } from "lucide-react";
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
      toast.success("Account created!");
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Accounts</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your financial accounts</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition-colors text-sm">
          <Plus size={16} /> New Account
        </button>
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-navy to-navy-light rounded-2xl p-6 text-white">
        <p className="text-gray-400 text-sm">Total Balance Across All Accounts</p>
        <p className="text-4xl font-bold mt-2">₹{totalBalance.toLocaleString("en-IN")}</p>
        <p className="text-gray-400 text-sm mt-2">{accounts.length} account(s)</p>
      </div>

      {/* Accounts Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="card p-12 text-center">
          <Wallet size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No accounts yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first account to get started</p>
          <button onClick={() => setShowModal(true)}
            className="mt-4 bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition-colors text-sm">
            Create Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const usedPercent = account.budget
              ? Math.min((parseFloat(account.usedAmount) / parseFloat(account.budget)) * 100, 100)
              : 0;
            return (
              <div key={account.id} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Wallet size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy">{account.name}</h3>
                      <p className="text-xs text-gray-400">Created {new Date(account.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(account.id)} disabled={deleting === account.id}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">Current Balance</p>
                  <p className="text-2xl font-bold text-navy">₹{parseFloat(account.balance).toLocaleString("en-IN")}</p>
                </div>

                {account.budget && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>Budget Used</span>
                      <span className={usedPercent >= 80 ? "text-red-500 font-semibold" : "text-gray-500"}>
                        {usedPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${usedPercent >= 80 ? "bg-red-500" : usedPercent >= 60 ? "bg-amber-500" : "bg-green-500"}`}
                        style={{ width: `${usedPercent}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                      <span>₹{parseFloat(account.usedAmount).toLocaleString("en-IN")} spent</span>
                      <span>₹{parseFloat(account.budget).toLocaleString("en-IN")} budget</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Account Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-navy">Create Account</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Name</label>
                <input className="input-field" placeholder="e.g. Main Account, Savings"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Initial Balance (₹)</label>
                <input type="number" className="input-field" placeholder="0"
                  value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Budget (₹) <span className="text-gray-400">(optional)</span></label>
                <input type="number" className="input-field" placeholder="e.g. 20000"
                  value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}