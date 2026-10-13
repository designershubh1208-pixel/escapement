import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, CheckCircle2, AlertTriangle, RefreshCw, Save, DollarSign, Store, Tag, Plus, X, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PolicyConfigurator = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Policy Form State (stored in Rupees for user convenience)
  const [perTxLimit, setPerTxLimit] = useState(500);
  const [dailyLimit, setDailyLimit] = useState(2000);
  const [monthlyLimit, setMonthlyLimit] = useState(10000);
  const [approvalThreshold, setApprovalThreshold] = useState(500);
  const [merchants, setMerchants] = useState(['Amazon', 'Flipkart', 'Myntra']);
  const [merchantInput, setMerchantInput] = useState('');
  const [policyVersion, setPolicyVersion] = useState(1);

  // Quick presets for Per-Transaction Limit
  const PRESET_LIMITS = [500, 1000, 2500, 5000, 15000, 50000];

  const fetchPolicy = async () => {
    setLoading(true);
    setFeedback(null);
    const start = Date.now();
    try {
      const res = await axios.get('/api/policies/me');
      const data = res.data;
      if (data) {
        setPerTxLimit(data.per_transaction_limit ? data.per_transaction_limit / 100 : 500);
        setDailyLimit(data.daily_limit ? data.daily_limit / 100 : 2000);
        setMonthlyLimit(data.monthly_limit ? data.monthly_limit / 100 : 10000);
        setApprovalThreshold(data.approval_threshold ? data.approval_threshold / 100 : 500);
        setMerchants(data.allowlisted_merchants || ['Amazon', 'Flipkart']);
        setPolicyVersion(data.version || 1);
      }
      const elapsed = Date.now() - start;
      if (elapsed < 550) {
        await new Promise(r => setTimeout(r, 550 - elapsed));
      }
    } catch (err) {
      console.error('Failed to load user policy, using defaults', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, [user?.id]);

  const handleSavePolicy = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const payload = {
      per_transaction_limit_rupees: parseFloat(perTxLimit) || 0,
      daily_limit_rupees: parseFloat(dailyLimit) || 0,
      monthly_limit_rupees: parseFloat(monthlyLimit) || 0,
      approval_threshold_rupees: parseFloat(approvalThreshold) || 0,
      allowlisted_merchants: merchants
    };

    try {
      const res = await axios.post('/api/policies/limits', payload);
      if (res.data.success) {
        setPolicyVersion(res.data.version || policyVersion + 1);
        setFeedback({
          type: 'success',
          message: `✓ Policy Version v${res.data.version} active! Per-transaction limit set to ₹${Number(payload.per_transaction_limit_rupees).toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`
        });
      }
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to update transaction limits';
      setFeedback({
        type: 'error',
        message: `Error: ${errMsg}`
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddMerchant = (e) => {
    if (e) e.preventDefault();
    const val = merchantInput.trim();
    if (val && !merchants.some(m => m.toLowerCase() === val.toLowerCase())) {
      setMerchants(prev => [...prev, val]);
      setMerchantInput('');
    }
  };

  const handleRemoveMerchant = (merchantToRemove) => {
    setMerchants(prev => prev.filter(m => m.toLowerCase() !== merchantToRemove.toLowerCase()));
  };

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto relative">
      {/* Page Header */}
      <div className="mb-10">
        <p className="font-mono text-xs font-bold tracking-widest text-lime uppercase mb-3">
          ( DETERMINISTIC RISK ENGINE )
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-paper tracking-tighter flex items-center gap-3">
              <span>Spending Limits & Policy</span>
              <span className="text-xl sm:text-2xl px-3 py-1 rounded-full bg-lime/10 text-lime border border-lime/20 font-mono text-sm">
                v{policyVersion}
              </span>
            </h1>
            <p className="text-paper/60 text-base sm:text-lg mt-2 max-w-3xl">
              Set hard financial invariants and transaction limits. Any AI action exceeding your configured bounds is deterministically blocked.
            </p>
          </div>
          <button
            onClick={fetchPolicy}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-paper hover:text-lime transition-all self-start sm:self-auto shadow-sm active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-lime ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh Policy'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 border shadow-md ${
          feedback.type === 'success' 
            ? 'bg-lime/10 border-lime/30 text-lime' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
          <span className="text-sm font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSavePolicy} className="space-y-8">
        
        {/* Card 1: Core Transaction Limits */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-lime/15 border border-lime/30 flex items-center justify-center text-lime">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-paper">Per-Transaction Hard Limit</h2>
              <p className="text-paper/50 text-xs font-mono">Maximum single spend amount permitted without explicit override</p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="mb-6">
            <label className="block text-xs font-mono text-paper/60 uppercase mb-2">Quick Presets</label>
            <div className="flex flex-wrap gap-2.5">
              {PRESET_LIMITS.map((amount) => {
                const isSelected = Number(perTxLimit) === amount;
                return (
                  <button
                    type="button"
                    key={amount}
                    onClick={() => setPerTxLimit(amount)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-lime text-ink shadow-md shadow-lime/20 scale-105'
                        : 'bg-white/5 hover:bg-white/10 text-paper border border-white/10'
                    }`}
                  >
                    ₹{amount.toLocaleString('en-IN')}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="per_tx_input" className="block text-xs font-mono text-paper/70 uppercase mb-2">
                Custom Per-Transaction Limit (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-paper/40 font-mono">₹</span>
                <input
                  id="per_tx_input"
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={perTxLimit}
                  onChange={(e) => setPerTxLimit(e.target.value)}
                  className="w-full bg-ink/70 border border-white/15 rounded-xl pl-8 pr-4 py-3 text-paper font-bold text-lg focus:border-lime focus:outline-none transition-colors"
                  placeholder="500.00"
                />
              </div>
              <p className="text-[11px] text-paper/40 mt-1.5 font-mono">
                Transactions higher than ₹{Number(perTxLimit || 0).toLocaleString('en-IN')} will be automatically stopped by the policy engine.
              </p>
            </div>

            <div>
              <label htmlFor="approval_threshold_input" className="block text-xs font-mono text-paper/70 uppercase mb-2">
                Human Confirmation Threshold (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-paper/40 font-mono">₹</span>
                <input
                  id="approval_threshold_input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={approvalThreshold}
                  onChange={(e) => setApprovalThreshold(e.target.value)}
                  className="w-full bg-ink/70 border border-white/15 rounded-xl pl-8 pr-4 py-3 text-paper font-bold text-lg focus:border-lime focus:outline-none transition-colors"
                  placeholder="500.00"
                />
              </div>
              <p className="text-[11px] text-paper/40 mt-1.5 font-mono">
                Purchases above ₹{Number(approvalThreshold || 0).toLocaleString('en-IN')} require your 1-click authorization before executing.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Cumulative Daily & Monthly Budgets */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-lime/15 border border-lime/30 flex items-center justify-center text-lime">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-paper">Budget Capacities</h2>
              <p className="text-paper/50 text-xs font-mono">Cumulative circuit-breakers across all daily and monthly activity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="daily_limit_input" className="block text-xs font-mono text-paper/70 uppercase mb-2">
                Daily Budget Limit (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-paper/40 font-mono">₹</span>
                <input
                  id="daily_limit_input"
                  type="number"
                  min="1"
                  step="1"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(e.target.value)}
                  className="w-full bg-ink/70 border border-white/15 rounded-xl pl-8 pr-4 py-3 text-paper font-bold text-base focus:border-lime focus:outline-none transition-colors"
                  placeholder="2000.00"
                />
              </div>
            </div>

            <div>
              <label htmlFor="monthly_limit_input" className="block text-xs font-mono text-paper/70 uppercase mb-2">
                Monthly Budget Limit (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-paper/40 font-mono">₹</span>
                <input
                  id="monthly_limit_input"
                  type="number"
                  min="1"
                  step="1"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  className="w-full bg-ink/70 border border-white/15 rounded-xl pl-8 pr-4 py-3 text-paper font-bold text-base focus:border-lime focus:outline-none transition-colors"
                  placeholder="10000.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Allowlisted Merchants */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-lime/15 border border-lime/30 flex items-center justify-center text-lime">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-paper">Trusted Merchants</h2>
              <p className="text-paper/50 text-xs font-mono">Only transactions from approved merchants can be evaluated</p>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={merchantInput}
              onChange={(e) => setMerchantInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMerchant(e)}
              placeholder="Add store (e.g., Apple, Croma, Swiggy, Uber)"
              className="flex-1 bg-ink/70 border border-white/15 rounded-xl px-4 py-3 text-sm text-paper focus:border-lime focus:outline-none transition-colors placeholder-paper/30"
            />
            <button
              type="button"
              onClick={handleAddMerchant}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-paper font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {merchants.map((merchant) => (
              <span
                key={merchant}
                className="inline-flex items-center gap-2 bg-ink/90 border border-white/15 rounded-full pl-4 pr-2.5 py-1.5 text-xs font-mono font-medium text-paper shadow-sm"
              >
                <span>{merchant}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMerchant(merchant)}
                  className="p-0.5 rounded-full hover:bg-red-500/20 hover:text-red-400 text-paper/40 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {merchants.length === 0 && (
              <p className="text-xs text-amber-400 font-mono">No merchants allowlisted. All purchase intents will be blocked.</p>
            )}
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs font-mono text-paper/40">
            Changes create an immutable audit record and update the active policy version.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-lime text-ink font-bold text-sm shadow-lg hover:brightness-105 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Policies...' : 'Save & Enforce Limits'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PolicyConfigurator;