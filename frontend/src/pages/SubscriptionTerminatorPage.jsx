import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Scissors, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  CreditCard, 
  ArrowRight, 
  XCircle,
  Zap,
  Calendar,
  Layers,
  Plus,
  Trash2,
  X
} from 'lucide-react';

const SubscriptionTerminatorPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [terminatingService, setTerminatingService] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [quickInput, setQuickInput] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, TERMINATED

  // Add Subscription Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({
    service_name: '',
    plan_name: '',
    amount_rupees: '',
    billing_cycle: 'monthly'
  });
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subsRes, reqsRes] = await Promise.all([
        axios.get('/api/subscriptions'),
        axios.get('/api/requests')
      ]);
      setSubscriptions(subsRes.data || []);
      setHistory(reqsRes.data || []);
    } catch (err) {
      console.error('Failed to load subscription data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter for subscription-related chats / requests
  const subscriptionChats = history.filter(req => {
    const act = (req.action || '').toUpperCase();
    const msg = (req.user_message || '').toLowerCase();
    const merch = (req.merchant || '').toLowerCase();
    return (
      act.includes('SUBSCRIPTION') ||
      msg.includes('subscription') ||
      msg.includes('cancel') ||
      msg.includes('terminate') ||
      ['netflix', 'spotify', 'amazon prime', 'prime video', 'gym', 'hulu', 'disney', 'youtube'].some(s => merch.includes(s) || msg.includes(s))
    );
  });

  const handleTerminateSubscription = async (serviceName) => {
    setTerminatingService(serviceName);
    setFeedback(null);
    try {
      const res = await axios.post('/api/subscriptions/cancel', {
        service_name: serviceName,
        user_id: 'user_1'
      });
      setFeedback({
        type: 'success',
        message: `✓ ${res.data.message || `Successfully terminated ${serviceName} subscription.`}`
      });
      fetchData();
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Termination failed';
      setFeedback({
        type: 'error',
        message: `Failed to terminate ${serviceName}: ${errMsg}`
      });
    } finally {
      setTerminatingService(null);
    }
  };

  const handleQuickTerminate = async (e) => {
    e.preventDefault();
    if (!quickInput.trim() || quickLoading) return;

    setQuickLoading(true);
    setFeedback(null);
    try {
      const userMsg = quickInput.trim();
      const res = await axios.post('/api/chat', {
        message: userMsg
      });

      setFeedback({
        type: 'success',
        message: `✓ Processed: ${res.data.response || 'Subscription termination request executed.'}`
      });
      setQuickInput('');
      fetchData();
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to process termination';
      setFeedback({
        type: 'error',
        message: `Error: ${errMsg}`
      });
    } finally {
      setQuickLoading(false);
    }
  };

  const handleAddSubscription = async (e) => {
    e.preventDefault();
    if (!newService.service_name.trim() || !newService.amount_rupees) return;
    setIsSubmittingNew(true);
    try {
      await axios.post('/api/subscriptions', {
        service_name: newService.service_name.trim(),
        plan_name: newService.plan_name.trim() || 'Standard',
        amount_rupees: parseFloat(newService.amount_rupees),
        billing_cycle: newService.billing_cycle
      });
      setShowAddModal(false);
      setNewService({ service_name: '', plan_name: '', amount_rupees: '', billing_cycle: 'monthly' });
      setFeedback({
        type: 'success',
        message: `Successfully added ${newService.service_name} to monitored subscriptions.`
      });
      fetchData();
    } catch (err) {
      console.error('Failed to add subscription', err);
      setFeedback({
        type: 'error',
        message: 'Failed to add subscription.'
      });
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const handleDeleteSubscription = async (subId) => {
    try {
      await axios.delete(`/api/subscriptions/${subId}`);
      setSubscriptions(prev => prev.filter(s => s.id !== subId));
    } catch (err) {
      console.error('Failed to delete subscription', err);
    }
  };

  const activeCount = subscriptions.filter(s => s.status === 'ACTIVE').length;
  const terminatedCount = subscriptions.filter(s => s.status === 'CANCELLED' || s.status === 'EXPIRED').length;
  const totalBurnMonthly = subscriptions
    .filter(s => s.status === 'ACTIVE')
    .reduce((sum, s) => sum + (s.billing_cycle === 'yearly' ? s.amount_rupees / 12 : s.amount_rupees), 0);
  const totalSavingsMonthly = subscriptions
    .filter(s => s.status === 'CANCELLED')
    .reduce((sum, s) => sum + (s.billing_cycle === 'yearly' ? s.amount_rupees / 12 : s.amount_rupees), 0);

  const getSubStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-lime/20 text-lime border border-lime/30';
      case 'CANCELLED':
        return 'bg-red-500/15 text-red-400 border border-red-500/30';
      case 'EXPIRED':
        return 'bg-amber-400/20 text-amber-300 border border-amber-400/30';
      default:
        return 'bg-white/10 text-paper/60 border border-white/20';
    }
  };

  const filteredSubs = subscriptions.filter(s => {
    if (filter === 'ACTIVE') return s.status === 'ACTIVE';
    if (filter === 'TERMINATED') return s.status === 'CANCELLED' || s.status === 'EXPIRED';
    return true;
  });

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto relative">
      {/* Page Header */}
      <div className="mb-10">
        <p className="font-mono text-xs font-bold tracking-widest text-lime uppercase mb-3">
          ( RECURRING EXPENSE DEFENSE )
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-paper tracking-tighter flex items-center gap-3">
              <span>Subscription Terminator</span>
              <span className="text-xl sm:text-2xl px-3 py-1 rounded-full bg-lime/10 text-lime border border-lime/20 font-mono text-sm">
                Active Defense
              </span>
            </h1>
            <p className="text-paper/60 text-base sm:text-lg mt-2 max-w-3xl">
              Autonomous agent safeguarding your capital. Detect, freeze, and terminate ghost subscriptions, recurring trials, and unwanted billing.
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-paper hover:text-lime transition-all self-start sm:self-auto shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-mono text-paper/40 uppercase tracking-wider mb-1">Active Subscriptions</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-paper">{activeCount}</span>
            <span className="text-xs font-mono text-amber-400">Burning capital</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-mono text-paper/40 uppercase tracking-wider mb-1">Terminated / Stopped</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-lime">{terminatedCount}</span>
            <span className="text-xs font-mono text-lime/70">Protected</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-mono text-paper/40 uppercase tracking-wider mb-1">Monthly Recurring Burn</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-paper">
              ₹{Math.round(totalBurnMonthly).toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-mono text-paper/40">/mo</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-mono text-paper/40 uppercase tracking-wider mb-1">Total Monthly Savings</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-lime">
              ₹{Math.round(totalSavingsMonthly).toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-mono text-lime/70">saved/mo</span>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-8 p-4 rounded-xl border flex items-center justify-between gap-3 text-sm font-medium ${
              feedback.type === 'success'
                ? 'bg-lime/10 border-lime/30 text-lime'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs opacity-70 hover:opacity-100 font-mono"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick AI Termination Command */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-7 backdrop-blur-md mb-12 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-lime" />
          <h2 className="font-display font-bold text-lg text-paper">Quick AI Termination Command</h2>
        </div>
        <p className="text-paper/60 text-xs sm:text-sm mb-4">
          Tell the agent which service to cancel (e.g. <em>"Cancel my Netflix subscription"</em> or <em>"Terminate Spotify"</em>). The policy engine will verify and execute immediate termination.
        </p>

        <form onSubmit={handleQuickTerminate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            disabled={quickLoading}
            placeholder='e.g. "Cancel my Amazon Prime subscription"'
            className="flex-1 bg-ink/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-paper font-medium focus:border-lime focus:outline-none transition-colors placeholder-paper/30 shadow-inner"
          />
          <button
            type="submit"
            disabled={quickLoading || !quickInput.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-lime text-ink hover:brightness-95 transition-all disabled:opacity-50 flex-shrink-0 shadow-md active:scale-95"
          >
            <Scissors className="w-4 h-4" />
            <span>{quickLoading ? 'Terminating...' : 'Terminate Subscription'}</span>
          </button>
        </form>
      </div>

      {/* Section 1: Monitored Subscriptions Registry */}
      <div className="mb-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-paper flex items-center gap-2.5">
              <span>Monitored Subscriptions</span>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-paper/70 font-normal">
                {subscriptions.length} services
              </span>
            </h2>
            <p className="text-paper/50 text-xs font-mono mt-1">
              Active recurring payment profiles linked to your accounts.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime text-ink font-bold text-xs shadow-sm hover:brightness-105 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subscription</span>
            </button>

            <div className="flex items-center gap-1 p-1 bg-ink/40 border border-white/10 rounded-xl">
              {['ALL', 'ACTIVE', 'TERMINATED'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    filter === tab
                      ? 'bg-lime text-ink font-bold shadow-sm'
                      : 'text-paper/60 hover:text-paper hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscriptions.length === 0 ? (
            <div className="col-span-1 md:col-span-2 py-12 px-6 text-center bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-lime/10 border border-lime/20 flex items-center justify-center text-lime mb-3">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-paper mb-1">No Monitored Subscriptions</h3>
              <p className="text-paper/50 font-mono text-xs max-w-md mb-5">
                No mock data is added. Add your real subscriptions to enable automated renewal monitoring and AI cancellation defense.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime text-ink font-bold text-xs shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Real Subscription</span>
              </button>
            </div>
          ) : filteredSubs.length === 0 ? (
            <div className="col-span-1 md:col-span-2 py-12 text-center bg-white/5 border border-white/10 rounded-2xl text-paper/40 font-mono text-sm">
              No subscriptions match the selected filter.
            </div>
          ) : (
            filteredSubs.map((sub) => {
              const isCancelling = terminatingService === sub.service_name;
              const isCancelled = sub.status === 'CANCELLED' || sub.status === 'EXPIRED';

              return (
                <div
                  key={sub.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between transition-all hover:border-white/20 shadow-sm relative group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-display text-xl font-bold text-paper">
                          {sub.service_name}
                        </h3>
                        <p className="text-xs font-mono text-paper/50 mt-0.5">
                          Plan: <span className="text-paper/80 font-medium">{sub.plan_name}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase font-mono ${getSubStatusBadge(sub.status)}`}>
                          {sub.status}
                        </span>
                        <button
                          onClick={() => handleDeleteSubscription(sub.id)}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-paper/30 transition-opacity p-1 rounded-lg cursor-pointer"
                          title="Remove from monitoring"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/5 my-3 text-xs font-mono">
                      <div>
                        <span className="text-paper/40 block">Billing Rate:</span>
                        <span className="text-paper font-semibold text-sm">
                          ₹{sub.amount_rupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          <span className="text-xs text-paper/40 font-normal"> / {sub.billing_cycle}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-paper/40 block">Protection:</span>
                        <span className={isCancelled ? "text-lime font-semibold" : "text-amber-400 font-semibold"}>
                          {isCancelled ? "Ghost billing blocked" : "Monitored by sentinel"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-mono text-paper/40">
                      {sub.trial_ends_at ? `Trial ended: ${new Date(sub.trial_ends_at).toLocaleDateString()}` : `Registered: ${new Date(sub.created_at).toLocaleDateString()}`}
                    </span>

                    {!isCancelled ? (
                      <button
                        onClick={() => handleTerminateSubscription(sub.service_name)}
                        disabled={isCancelling}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                        title="Terminate this subscription immediately"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        <span>{isCancelling ? 'Terminating...' : 'Terminate Now'}</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-lime/80">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Terminated</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Section 2: Subscription Terminated & Cancellation Chats */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-paper flex items-center gap-2.5">
              <span>Subscription Terminated & Cancellation Chats</span>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-lime/15 text-lime border border-lime/20 font-bold">
                {subscriptionChats.length} records
              </span>
            </h2>
            <p className="text-paper/50 text-xs font-mono mt-1">
              Historical record of AI agent cancellation commands and verified subscription terminations.
            </p>
          </div>
        </div>

        {subscriptionChats.length === 0 ? (
          <div className="py-14 text-center bg-white/5 border border-white/10 rounded-2xl">
            <Shield className="w-8 h-8 text-paper/30 mx-auto mb-3" />
            <p className="text-paper/60 font-medium text-sm">No subscription termination chats yet.</p>
            <p className="text-paper/30 text-xs font-mono mt-1">
              Use the Quick Command bar above or chat with the AI to cancel subscriptions.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {subscriptionChats.map((req) => {
              const isSuccess = req.status === 'COMPLETED' || req.policy_decision === 'APPROVE';

              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className="group bg-white/5 border border-white/10 hover:border-lime/40 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all active:scale-[0.99] shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-lime shadow-[0_0_8px_1px] shadow-lime/60"></span>
                      <p className="text-paper font-semibold text-base group-hover:text-lime transition-colors truncate">
                        "{req.user_message}"
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-paper/50">
                      <span className="text-lime font-bold">
                        {req.merchant || 'Subscription'}
                      </span>
                      <span>•</span>
                      <span className="text-paper/70">
                        {req.action || 'CANCEL_SUBSCRIPTION'}
                      </span>
                      <span>•</span>
                      <span>{req.created_at ? new Date(req.created_at).toLocaleString() : ''}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase font-mono ${
                      isSuccess 
                        ? 'bg-lime/20 text-lime border border-lime/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {isSuccess ? 'TERMINATED' : req.status}
                    </span>
                    <span className="text-paper/40 group-hover:text-lime group-hover:translate-x-1 transition-all text-sm font-bold">
                      →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pt-24 pb-10 bg-black/60 dark:bg-ink/90 backdrop-blur-md overflow-y-auto"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="bg-white dark:bg-[#121412] border border-black/10 dark:border-white/20 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-auto max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-black/5 dark:border-white/10">
              <div>
                <span className="font-mono text-xs font-bold tracking-widest text-lime uppercase">
                  ( TERMINATION RECORD • {selectedRequest.merchant || 'SUBSCRIPTION'} )
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-paper mt-1">
                  "{selectedRequest.user_message}"
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-paper/50 hover:text-paper hover:bg-black/5 dark:hover:bg-white/10 rounded-full w-9 h-9 flex items-center justify-center transition-colors text-lg flex-shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm font-mono">
              <div className="bg-ink/30 rounded-xl p-4 border border-white/5 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-paper/40 block">Service</span>
                  <span className="font-bold text-paper">{selectedRequest.merchant || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-xs text-paper/40 block">Status</span>
                  <span className="font-bold text-lime">
                    {selectedRequest.status === 'COMPLETED' ? 'TERMINATED' : selectedRequest.status}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-paper/40 block">Action</span>
                  <span className="text-paper">{selectedRequest.action || 'CANCEL_SUBSCRIPTION'}</span>
                </div>
                <div>
                  <span className="text-xs text-paper/40 block">Timestamp</span>
                  <span className="text-paper/70">
                    {selectedRequest.created_at ? new Date(selectedRequest.created_at).toLocaleString() : ''}
                  </span>
                </div>
              </div>

              <div className="bg-lime/5 border border-lime/20 rounded-xl p-4">
                <span className="text-xs text-lime font-bold uppercase block mb-1">
                  Deterministic Policy Verification
                </span>
                <p className="text-paper/80 text-xs">
                  Policy rule evaluated: <code className="text-lime font-bold">SUBSCRIPTION_TERMINATOR_EXECUTED</code>.
                  Merchant virtual authorization revoked. Future recurring auto-debit calls will be rejected with zero liability.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-paper transition-all cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-ink border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-paper/40 hover:text-paper hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-lime/15 border border-lime/30 flex items-center justify-center text-lime">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-paper">Add Real Subscription</h3>
                <p className="text-paper/50 text-xs font-mono">Monitor and safeguard your real recurring service</p>
              </div>
            </div>

            <form onSubmit={handleAddSubscription} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-paper/70 uppercase mb-1.5">Service Name *</label>
                <input
                  type="text"
                  required
                  value={newService.service_name}
                  onChange={(e) => setNewService(prev => ({ ...prev, service_name: e.target.value }))}
                  placeholder="e.g. Netflix, Spotify, ChatGPT Plus, Gym"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-paper focus:border-lime focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-paper/70 uppercase mb-1.5">Plan / Tier</label>
                  <input
                    type="text"
                    value={newService.plan_name}
                    onChange={(e) => setNewService(prev => ({ ...prev, plan_name: e.target.value }))}
                    placeholder="e.g. Premium 4K, Pro"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-paper focus:border-lime focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-paper/70 uppercase mb-1.5">Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newService.amount_rupees}
                    onChange={(e) => setNewService(prev => ({ ...prev, amount_rupees: e.target.value }))}
                    placeholder="649.00"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-paper focus:border-lime focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-paper/70 uppercase mb-1.5">Billing Cycle</label>
                <select
                  value={newService.billing_cycle}
                  onChange={(e) => setNewService(prev => ({ ...prev, billing_cycle: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-paper focus:border-lime focus:outline-none transition-colors"
                >
                  <option value="monthly" className="bg-ink text-paper">Monthly</option>
                  <option value="yearly" className="bg-ink text-paper">Yearly</option>
                  <option value="weekly" className="bg-ink text-paper">Weekly</option>
                  <option value="trial" className="bg-ink text-paper">Free Trial</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-paper/60 hover:text-paper hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew || !newService.service_name.trim() || !newService.amount_rupees}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-lime text-ink hover:brightness-105 disabled:opacity-50 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {isSubmittingNew ? 'Adding...' : 'Add to Monitoring'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionTerminatorPage;
