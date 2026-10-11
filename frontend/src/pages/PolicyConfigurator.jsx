import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PolicyConfigurator = () => {
  const [policies, setPolicies] = useState({
    daily_limit: 200000, 
    per_transaction_limit: 50000, 
    monthly_limit: 1000000, 
    approval_threshold: 50000, 
    expiry_date: '',
    allowlisted_merchants: ['Amazon', 'Flipkart']
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [merchantInput, setMerchantInput] = useState('');

  const USER_ID = 'user_1';

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/policies/${USER_ID}`);
        setPolicies(response.data);
      } catch (err) {
        console.log('No existing policies found, using defaults');
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await axios.put(`/api/policies/${USER_ID}`, policies);
      setMessage('Policies saved successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save policies');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMerchant = () => {
    const value = merchantInput.trim();
    if (value) {
      setPolicies(prev => ({
        ...prev,
        allowlisted_merchants: [...new Set([...prev.allowlisted_merchants, value])]
      }));
      setMerchantInput('');
    }
  };

  const removeMerchant = (merchant) => {
    setPolicies(prev => ({
      ...prev,
      allowlisted_merchants: prev.allowlisted_merchants.filter(m => m !== merchant)
    }));
  };

  return (
    <section className="min-h-[100svh] bg-ink pt-32 pb-20 relative">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/80 to-ink"></div>
      </div>
      
      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <div className="mb-12">
          <p className="font-mono text-xs font-bold tracking-widest text-lime uppercase mb-4">( Security )</p>
          <h1 className="font-display text-5xl font-bold text-paper mb-4 tracking-tighter">Policy Configuration</h1>
          <p className="text-paper/60 text-lg">
            Define the strict limits and allowlists that govern the AI agent's actions.
          </p>
        </div>

        {message && <div className="mb-6 p-4 rounded-lg bg-lime/10 border border-lime/20 text-lime font-medium">{message}</div>}
        {error && <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-10 backdrop-blur-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
            <div className="flex flex-col gap-2">
              <label htmlFor="daily_limit" className="font-mono text-sm text-paper/70">Daily Limit (₹)</label>
              <input
                type="number"
                id="daily_limit"
                className="bg-ink/50 border border-white/10 rounded-xl px-4 py-3 text-paper font-medium focus:border-lime focus:outline-none transition-colors"
                value={policies.daily_limit / 100}
                onChange={(e) => setPolicies(prev => ({ ...prev, daily_limit: parseFloat(e.target.value) * 100 || 0 }))}
                min="0" step="0.01" required disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="per_transaction_limit" className="font-mono text-sm text-paper/70">Per‑Transaction Limit (₹)</label>
              <input
                type="number"
                id="per_transaction_limit"
                className="bg-ink/50 border border-white/10 rounded-xl px-4 py-3 text-paper font-medium focus:border-lime focus:outline-none transition-colors"
                value={policies.per_transaction_limit / 100}
                onChange={(e) => setPolicies(prev => ({ ...prev, per_transaction_limit: parseFloat(e.target.value) * 100 || 0 }))}
                min="0" step="0.01" required disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="monthly_limit" className="font-mono text-sm text-paper/70">Monthly Limit (₹)</label>
              <input
                type="number"
                id="monthly_limit"
                className="bg-ink/50 border border-white/10 rounded-xl px-4 py-3 text-paper font-medium focus:border-lime focus:outline-none transition-colors"
                value={policies.monthly_limit / 100}
                onChange={(e) => setPolicies(prev => ({ ...prev, monthly_limit: parseFloat(e.target.value) * 100 || 0 }))}
                min="0" step="0.01" required disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="approval_threshold" className="font-mono text-sm text-paper/70">Human Approval Threshold (₹)</label>
              <input
                type="number"
                id="approval_threshold"
                className="bg-ink/50 border border-white/10 rounded-xl px-4 py-3 text-paper font-medium focus:border-lime focus:outline-none transition-colors"
                value={policies.approval_threshold / 100}
                onChange={(e) => setPolicies(prev => ({ ...prev, approval_threshold: parseFloat(e.target.value) * 100 || 0 }))}
                min="0" step="0.01" required disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label htmlFor="expiry_date" className="font-mono text-sm text-paper/70">Policy Expiry Date</label>
              <input
                type="date"
                id="expiry_date"
                className="bg-ink/50 border border-white/10 rounded-xl px-4 py-3 text-paper font-medium focus:border-lime focus:outline-none transition-colors"
                value={policies.expiry_date}
                onChange={(e) => setPolicies(prev => ({ ...prev, expiry_date: e.target.value }))}
                disabled={loading}
              />
            </div>
          </div>

          <div className="border-t border-white/10 pt-10 mb-10">
            <h3 className="font-display text-xl text-paper mb-6 font-bold">Allowlisted Merchants</h3>
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                className="flex-1 bg-ink/50 border border-white/10 rounded-xl px-4 py-3 text-paper font-medium focus:border-lime focus:outline-none transition-colors placeholder-paper/20"
                placeholder="Enter merchant name (e.g., Apple)"
                value={merchantInput}
                onChange={(e) => setMerchantInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMerchant())}
              />
              <button type="button" onClick={handleAddMerchant} className="inline-flex items-center justify-center rounded-xl font-bold bg-white/10 text-paper hover:bg-white/20 transition-colors px-6" disabled={loading}>
                Add
              </button>
            </div>
            {policies.allowlisted_merchants.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {policies.allowlisted_merchants.map((merchant, idx) => (
                  <span key={idx} className="inline-flex items-center gap-2 bg-ink border border-white/10 rounded-full px-4 py-1.5 text-sm font-medium">
                    {merchant}
                    <button type="button" onClick={() => removeMerchant(merchant)} className="text-paper/40 hover:text-red-400">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="w-full inline-flex items-center justify-center rounded-full font-bold bg-lime text-ink hover:brightness-95 transition-all h-14 text-lg" disabled={loading}>
            {loading ? 'Saving...' : 'Save Policies'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default PolicyConfigurator;