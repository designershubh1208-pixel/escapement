import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShoppingCart, 
  RefreshCw, 
  ExternalLink, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Search,
  Filter,
  DollarSign,
  PackageCheck,
  Clock
} from 'lucide-react';

const ChatInterface = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [syncingPrice, setSyncingPrice] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [customPriceInput, setCustomPriceInput] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/requests');
      setHistory(res.data || []);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter for buying / ordered requests only (exclude subscription termination)
  const isSubscription = (req) => {
    const act = (req.action || '').toUpperCase();
    const msg = (req.user_message || '').toLowerCase();
    const merch = (req.merchant || '').toLowerCase();
    return (
      act.includes('SUBSCRIPTION') ||
      msg.includes('subscription') ||
      msg.includes('cancel') ||
      msg.includes('terminate') ||
      ['netflix', 'spotify', 'prime video', 'gym'].some(s => merch.includes(s) || msg.includes(s))
    );
  };

  const buyingChats = history.filter(req => !isSubscription(req));

  const extractProductQuery = (message) => {
    if (!message) return '';
    return message
      .replace(/^["']|["']$/g, '')
      .replace(/^(can you\s+)?(buy|purchase|order|search for|find|get)\s+(me\s+)?(a\s+|an\s+|the\s+)?/i, '')
      .replace(/\s+(from|on|at|in)\s+(amazon(\.in)?|flipkart|myntra|croma|blinkit|zepto)/gi, '')
      .replace(/\s+(for|under|below|around)\s+(rs\.?|inr|₹)?\s*[0-9,]+(\s*(inr|rs))?/gi, '')
      .trim();
  };

  const getStoreInfo = (req) => {
    if (!req) return null;
    const merchant = (req.merchant || '').toLowerCase();
    const rawMsg = req.user_message || '';
    const cleanedQuery = extractProductQuery(rawMsg) || rawMsg;

    const isAmazon = merchant.includes('amazon') || rawMsg.toLowerCase().includes('amazon');
    const isFlipkart = merchant.includes('flipkart') || rawMsg.toLowerCase().includes('flipkart');

    return {
      query: cleanedQuery,
      isAmazon,
      isFlipkart,
      primaryStore: isAmazon ? 'Amazon.in' : isFlipkart ? 'Flipkart' : (req.merchant || 'Amazon.in'),
      primaryUrl: isAmazon
        ? `https://www.amazon.in/s?k=${encodeURIComponent(cleanedQuery)}`
        : isFlipkart
        ? `https://www.flipkart.com/search?q=${encodeURIComponent(cleanedQuery)}`
        : `https://www.amazon.in/s?k=${encodeURIComponent(cleanedQuery)}`,
      amazonUrl: `https://www.amazon.in/s?k=${encodeURIComponent(cleanedQuery)}`,
      flipkartUrl: `https://www.flipkart.com/search?q=${encodeURIComponent(cleanedQuery)}`,
      googleShoppingUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(cleanedQuery)}`
    };
  };

  const parseReasons = (reasons) => {
    if (!reasons) return [];
    if (Array.isArray(reasons)) return reasons;
    try {
      const parsed = JSON.parse(reasons);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      return [String(reasons)];
    }
  };

  const REASON_DESCRIPTIONS = {
    REQUIRES_HUMAN_APPROVAL: 'Explicit human-in-the-loop authorization required before transaction execution.',
    AMOUNT_EXCEEDS_AUTO_THRESHOLD: 'Amount exceeds automatic threshold limit (₹500.00). Requires user confirmation.',
    AMOUNT_EXCEEDS_LIMIT: 'Amount exceeds the maximum configured per-transaction spending limit.',
    DAILY_LIMIT_EXCEEDED: 'Total spend exceeds the configured daily budget limit.',
    MONTHLY_LIMIT_EXCEEDED: 'Total spend exceeds the configured monthly budget limit.',
    MERCHANT_NOT_ALLOWED: 'Merchant is not on the user allowlist.',
    MERCHANT_BLOCKED: 'Merchant is explicitly blocked in security settings.',
    OUT_OF_STOCK_CART_MONITOR: 'Item out of stock. Saved in cart for continuous inventory tracking.',
    ALL_POLICY_CONDITIONS_SATISFIED: 'All deterministic invariant checks and spend limits satisfied.'
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'REQUIRES_APPROVAL':
        return 'bg-amber-400/20 text-amber-300 border border-amber-400/30';
      case 'PENDING':
        return 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30';
      case 'BLOCKED':
      case 'REJECTED':
      case 'FAILED':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'SCHEDULED':
        return 'bg-blue-400/20 text-blue-300 border border-blue-400/30';
      case 'COMPLETED':
      case 'APPROVED':
      case 'AUTHORIZED':
        return 'bg-lime/20 text-lime border border-lime/30';
      default:
        return 'bg-white/10 text-paper/70 border border-white/20';
    }
  };

  const handleDecision = async (txId, decisionType) => {
    setActionLoading(true);
    setActionFeedback(null);
    try {
      const res = await axios.post(`/api/approvals/by-tx/${txId}/decision`, {
        decision: decisionType,
        reasons: decisionType === 'APPROVE'
          ? ['Authorized by user after store verification']
          : ['Rejected by user']
      });

      setActionFeedback({
        type: 'success',
        message: res.data.message || `Transaction successfully ${decisionType.toLowerCase()}d.`
      });

      setSelectedRequest(prev => prev ? {
        ...prev,
        status: decisionType === 'APPROVE' ? 'COMPLETED' : 'BLOCKED',
        policy_decision: decisionType,
        tx_hash: res.data.payment_ref || prev.tx_hash
      } : null);

      fetchHistory();
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Action failed';
      setActionFeedback({
        type: 'error',
        message: `Failed to ${decisionType.toLowerCase()}: ${errMsg}`
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncPrice = async (txId) => {
    setSyncingPrice(true);
    setActionFeedback(null);
    try {
      const res = await axios.post(`/api/ecommerce/sync-price/${txId}`);
      if (res.data.success) {
        setActionFeedback({
          type: 'success',
          message: `✓ Successfully synced live real-time price from ${res.data.merchant}: ₹${Number(res.data.amount_inr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        });
        setSelectedRequest(prev => prev ? {
          ...prev,
          amount_paise: res.data.amount_paise,
          amount_inr: res.data.amount_inr,
          status: res.data.status,
          policy_decision: res.data.policy_decision
        } : null);
        fetchHistory();
      }
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Price sync failed';
      setActionFeedback({
        type: 'error',
        message: `Failed to fetch live price: ${errMsg}`
      });
    } finally {
      setSyncingPrice(false);
    }
  };

  const handleSetCustomPrice = async (txId) => {
    const num = parseFloat(customPriceInput);
    if (isNaN(num) || num <= 0) return;
    setSyncingPrice(true);
    setActionFeedback(null);
    try {
      const res = await axios.post(`/api/ecommerce/set-price/${txId}?amount_inr=${num}`);
      if (res.data.success) {
        setActionFeedback({
          type: 'success',
          message: `✓ Confirmed custom price: ₹${Number(res.data.amount_inr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        });
        setSelectedRequest(prev => prev ? {
          ...prev,
          amount_paise: res.data.amount_paise,
          amount_inr: res.data.amount_inr,
          status: res.data.status
        } : null);
        setEditingPrice(false);
        setCustomPriceInput('');
        fetchHistory();
      }
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to update price';
      setActionFeedback({
        type: 'error',
        message: `Error: ${errMsg}`
      });
    } finally {
      setSyncingPrice(false);
    }
  };

  // Metrics
  const totalOrdersCount = buyingChats.length;
  const pendingApprovalsCount = buyingChats.filter(r => r.status === 'REQUIRES_APPROVAL' || r.status === 'PENDING').length;
  const completedOrdersCount = buyingChats.filter(r => r.status === 'COMPLETED' || r.status === 'APPROVED').length;
  const totalSpendINR = buyingChats.reduce((sum, r) => {
    const val = r.amount_inr ? Number(r.amount_inr) : (r.amount_paise ? r.amount_paise / 100 : 0);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  // Filtered list
  const filteredChats = buyingChats.filter(req => {
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'REQUIRES_APPROVAL' && req.status !== 'REQUIRES_APPROVAL' && req.status !== 'PENDING') return false;
      if (statusFilter === 'COMPLETED' && req.status !== 'COMPLETED' && req.status !== 'APPROVED') return false;
      if (statusFilter === 'BLOCKED' && req.status !== 'BLOCKED' && req.status !== 'REJECTED') return false;
      if (statusFilter === 'SCHEDULED' && req.status !== 'SCHEDULED') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const msg = (req.user_message || '').toLowerCase();
      const merch = (req.merchant || '').toLowerCase();
      return msg.includes(q) || merch.includes(q);
    }
    return true;
  });

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto relative">
      {/* Page Header */}
      <div className="mb-10">
        <p className="font-mono text-xs font-bold tracking-widest text-lime uppercase mb-3">
          ( COMMERCE & PROCUREMENT )
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-paper tracking-tighter flex items-center gap-3">
              <span>Buying & Orders</span>
              <span className="text-xl sm:text-2xl px-3 py-1 rounded-full bg-lime/10 text-lime border border-lime/20 font-mono text-sm">
                Live Procurement
              </span>
            </h1>
            <p className="text-paper/60 text-base sm:text-lg mt-2 max-w-3xl">
              Track shopping & purchase chats, verify real-time item pricing across Amazon, Flipkart, & Myntra, and authorize payments with deterministic guardrails.
            </p>
          </div>
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-paper hover:text-lime transition-all self-start sm:self-auto shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-mono text-paper/40 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5 text-lime" />
            <span>Total Orders</span>
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-paper">{totalOrdersCount}</span>
            <span className="text-xs font-mono text-paper/40">purchases</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-mono text-paper/40 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pending Review</span>
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-amber-400">{pendingApprovalsCount}</span>
            <span className="text-xs font-mono text-amber-400/70">awaiting check</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-mono text-paper/40 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <PackageCheck className="w-3.5 h-3.5 text-lime" />
            <span>Executed / Settled</span>
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-lime">{completedOrdersCount}</span>
            <span className="text-xs font-mono text-lime/70">completed</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-mono text-paper/40 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-lime" />
            <span>Tracked Spend</span>
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-paper">
              ₹{Math.round(totalSpendINR).toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-mono text-paper/40">INR</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-ink/40 border border-white/10 rounded-xl">
          {['ALL', 'REQUIRES_APPROVAL', 'COMPLETED', 'BLOCKED', 'SCHEDULED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                statusFilter === tab
                  ? 'bg-lime text-ink font-bold shadow-sm'
                  : 'text-paper/60 hover:text-paper hover:bg-white/5'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-paper/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders or merchant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-ink/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-paper placeholder-paper/30 focus:border-lime focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-3.5">
        {filteredChats.map((req) => {
          let intent = {};
          try {
            intent = JSON.parse(req.intent_json || '{}');
          } catch {
            intent = {};
          }
          const merchant = req.merchant || intent.merchant || 'Amazon.in';
          const action = req.action || intent.action || 'PURCHASE';
          const amountFormatted = req.amount_inr 
            ? `₹${Number(req.amount_inr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            : req.amount_paise 
            ? `₹${(req.amount_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            : null;

          const storeInfo = getStoreInfo(req);
          const isPending = req.status === 'REQUIRES_APPROVAL' || req.status === 'PENDING';

          return (
            <div 
              key={req.id} 
              onClick={() => {
                setSelectedRequest(req);
                setActionFeedback(null);
              }}
              className="group bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-lime/40 cursor-pointer transition-all active:scale-[0.99] shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className={`w-2 h-2 rounded-full ${isPending ? 'bg-amber-400 shadow-[0_0_8px_1px] shadow-amber-400/60' : 'bg-lime shadow-[0_0_8px_1px] shadow-lime/60'}`}></span>
                  <p className="text-paper font-semibold text-base sm:text-lg group-hover:text-lime transition-colors">
                    "{req.user_message}"
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-paper/50">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-paper/80 font-bold">
                    {merchant}
                  </span>
                  <span>•</span>
                  <span className="text-paper/60 uppercase">{action}</span>
                  {amountFormatted && (
                    <>
                      <span>•</span>
                      <span className="text-lime font-bold text-sm">{amountFormatted}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{req.created_at ? new Date(req.created_at).toLocaleString() : ''}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                {storeInfo && (
                  <a
                    href={storeInfo.primaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 border border-amber-400/20 transition-all"
                    title={`Verify directly on ${storeInfo.primaryStore}`}
                  >
                    <span>Check Store</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase font-mono ${getStatusBadgeClass(req.status)}`}>
                  {req.status === 'REQUIRES_APPROVAL' && '● '}
                  {req.status}
                </span>

                <span className="text-paper/40 group-hover:text-lime group-hover:translate-x-1 transition-all text-sm font-bold pl-1">
                  →
                </span>
              </div>
            </div>
          );
        })}

        {filteredChats.length === 0 && !loading && (
          <div className="py-16 text-center bg-white/5 border border-white/10 rounded-2xl">
            <ShoppingCart className="w-10 h-10 text-paper/20 mx-auto mb-3" />
            <p className="text-paper/60 font-semibold text-base">No buying or ordered chats found.</p>
            <p className="text-paper/30 text-xs font-mono mt-1">
              Ask the AI agent in the chat to purchase or search for items on Amazon, Flipkart, or Myntra.
            </p>
          </div>
        )}
      </div>

      {/* Request Details & Store Verification Modal */}
      {selectedRequest && (() => {
        const storeInfo = getStoreInfo(selectedRequest);
        const reasons = parseReasons(selectedRequest.policy_reasons);
        const amountDisplay = selectedRequest.amount_inr 
          ? `₹${Number(selectedRequest.amount_inr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
          : selectedRequest.amount_paise 
          ? `₹${(selectedRequest.amount_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
          : '₹0.00';

        const isPendingApproval = selectedRequest.status === 'REQUIRES_APPROVAL' || selectedRequest.status === 'PENDING';

        return (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pt-24 pb-10 bg-black/60 dark:bg-ink/90 backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedRequest(null)}
          >
            <div 
              className="bg-white dark:bg-[#121412] border border-black/10 dark:border-white/20 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-auto max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="font-mono text-xs font-bold tracking-widest text-lime uppercase">
                    ( ORDER DETAILS • {selectedRequest.action || 'PURCHASE'} )
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

              {/* Status and Timestamp Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-black/5 dark:border-white/10 mb-6 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-paper/40">Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${getStatusBadgeClass(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <span className="text-paper/40">
                  {selectedRequest.created_at ? new Date(selectedRequest.created_at).toLocaleString() : ''}
                </span>
              </div>

              {/* Direct E-Commerce Store Verification Box */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl p-5 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🛒</span>
                      <span className="text-amber-300 font-bold text-sm tracking-wide uppercase">
                        Store Verification Link
                      </span>
                    </div>
                    <p className="text-paper/70 text-xs mt-1">
                      Check product, live price, and seller on {storeInfo.primaryStore} before authorizing.
                    </p>
                    <p className="text-paper/90 text-sm font-semibold mt-2">
                      Product query: <span className="font-mono text-amber-200">"{storeInfo.query}"</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleSyncPrice(selectedRequest.id)}
                      disabled={syncingPrice}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-paper border border-white/15 transition-all shadow-md active:scale-95 disabled:opacity-50"
                      title="Fetch live scraped price directly from Amazon/Flipkart/Myntra"
                    >
                      {syncingPrice ? '↻ Fetching Real Price...' : '↻ Sync Real Store Price'}
                    </button>
                    <a
                      href={storeInfo.primaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-400 text-black hover:bg-amber-300 transition-all shadow-md active:scale-95"
                    >
                      <span>Check on {storeInfo.primaryStore}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Compare on other stores */}
                <div className="mt-4 pt-3 border-t border-amber-500/20 flex flex-wrap items-center gap-3 text-xs text-paper/60">
                  <span className="font-medium text-paper/40">Also check on:</span>
                  <a
                    href={storeInfo.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium hover:underline"
                  >
                    <span>Amazon.in ↗</span>
                  </a>
                  <span>•</span>
                  <a
                    href={storeInfo.flipkartUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium hover:underline"
                  >
                    <span>Flipkart ↗</span>
                  </a>
                  <span>•</span>
                  <a
                    href={storeInfo.googleShoppingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-paper/70 hover:text-paper font-medium hover:underline"
                  >
                    <span>Google Shopping ↗</span>
                  </a>
                </div>
              </div>

              {/* Financial & Intent Grid */}
              <div className="bg-ink/40 border border-white/5 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-paper/40 text-xs font-mono">Amount</p>
                      <button 
                        onClick={() => {
                          setEditingPrice(!editingPrice);
                          setCustomPriceInput(selectedRequest.amount_inr ? String(selectedRequest.amount_inr) : '');
                        }}
                        className="text-[10px] text-lime hover:underline font-mono"
                      >
                        {editingPrice ? 'Cancel' : '✎ Edit'}
                      </button>
                    </div>
                    <p className="font-bold text-paper text-base text-lime">{amountDisplay}</p>
                  </div>
                  <div>
                    <p className="text-paper/40 text-xs font-mono mb-1">Merchant</p>
                    <p className="font-semibold text-paper text-sm">{selectedRequest.merchant || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-paper/40 text-xs font-mono mb-1">Category</p>
                    <p className="font-semibold text-paper text-sm">{selectedRequest.category || 'General'}</p>
                  </div>
                  <div>
                    <p className="text-paper/40 text-xs font-mono mb-1">Currency</p>
                    <p className="font-semibold text-paper text-sm">{selectedRequest.currency || 'INR'}</p>
                  </div>
                </div>

                {editingPrice && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="e.g. 913809"
                      value={customPriceInput}
                      onChange={(e) => setCustomPriceInput(e.target.value)}
                      className="bg-black/5 dark:bg-black/50 border border-black/15 dark:border-white/20 rounded-lg px-3 py-1.5 text-xs text-paper focus:border-lime focus:outline-none flex-1 font-mono"
                    />
                    <button
                      onClick={() => handleSetCustomPrice(selectedRequest.id)}
                      disabled={syncingPrice}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-lime text-black hover:bg-lime/90 transition-colors"
                    >
                      Save Price
                    </button>
                  </div>
                )}
              </div>

              {/* Policy Evaluation & Invariants */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-mono text-xs uppercase tracking-widest text-paper/50">
                    Deterministic Policy Evaluation
                  </h4>
                  <span className="font-mono text-xs text-paper/60 font-semibold">
                    Decision: {selectedRequest.policy_decision || selectedRequest.status}
                  </span>
                </div>

                {reasons.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 bg-ink/30 border border-white/5 rounded-lg p-2.5">
                        <span className="text-amber-400 text-xs mt-0.5">🛡️</span>
                        <div>
                          <p className="font-mono text-xs font-bold text-paper">{r}</p>
                          <p className="text-paper/60 text-xs mt-0.5">
                            {REASON_DESCRIPTIONS[r] || 'Deterministic policy rule evaluated.'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-paper/50 italic">No specific policy violation reasons recorded.</p>
                )}

                {selectedRequest.failure_reason && (
                  <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                    <span className="font-bold">Failure / Block Reason: </span>
                    {selectedRequest.failure_reason}
                  </div>
                )}

                {selectedRequest.tx_hash && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-mono text-lime bg-lime/10 border border-lime/20 rounded-lg p-2.5">
                    <span>✓ Payment Reference:</span>
                    <span className="font-bold">{selectedRequest.tx_hash}</span>
                  </div>
                )}
              </div>

              {/* Feedback Alert */}
              {actionFeedback && (
                <div className={`p-4 rounded-xl border mb-6 text-sm font-medium ${
                  actionFeedback.type === 'success' 
                    ? 'bg-lime/10 border-lime/30 text-lime' 
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  {actionFeedback.message}
                </div>
              )}

              {/* Action Bar (Human-in-the-loop Approval) */}
              {isPendingApproval ? (
                <div className="pt-4 border-t border-black/5 dark:border-white/10 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleDecision(selectedRequest.id, 'APPROVE')}
                    disabled={actionLoading}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl font-bold bg-lime text-ink hover:brightness-105 active:scale-95 transition-all h-12 px-6 shadow-md disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing on EVM...' : '✓ Authorize & Execute Payment'}
                  </button>
                  <button
                    onClick={() => handleDecision(selectedRequest.id, 'REJECT')}
                    disabled={actionLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl font-bold bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 active:scale-95 transition-all h-12 px-6 disabled:opacity-50"
                  >
                    ✕ Reject Request
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-black/5 dark:border-white/10 flex justify-end">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-6 py-2.5 rounded-xl border border-black/10 dark:border-white/20 text-paper font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-sm"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ChatInterface;