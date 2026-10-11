import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const USER_ID = 'user_1';

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/audit-logs?userId=${USER_ID}`);
        setLogs(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionColor = (action) => {
    switch (action.toUpperCase()) {
      case 'POLICY_CREATED':
      case 'POLICY_UPDATED': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'DECISION_APPROVE': return 'text-lime bg-lime/10 border-lime/20';
      case 'DECISION_BLOCK': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'DECISION_REQUIRE_APPROVAL': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'PAYMENT_EXECUTED': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-paper bg-white/5 border-white/10';
    }
  };

  return (
    <section className="min-h-[100svh] bg-ink pt-32 pb-20 relative">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/80 to-ink"></div>
      </div>
      
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="mb-12">
          <p className="font-mono text-xs font-bold tracking-widest text-lime uppercase mb-4">( History )</p>
          <h1 className="font-display text-5xl font-bold text-paper mb-4 tracking-tighter">Audit Logs</h1>
          <p className="text-paper/60 text-lg">
            Immutable ledger of all financial requests, policy evaluations, and executed payments.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-paper/40 font-mono">Loading audit logs...</div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-medium">{error}</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-paper/50">No audit logs found. Start making requests to generate activity.</p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto backdrop-blur-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/5 dark:bg-black/20">
                  <th className="px-6 py-4 font-mono text-xs tracking-widest uppercase text-paper/40">Timestamp</th>
                  <th className="px-6 py-4 font-mono text-xs tracking-widest uppercase text-paper/40">Event / Action</th>
                  <th className="px-6 py-4 font-mono text-xs tracking-widest uppercase text-paper/40">Payload Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap text-paper/60 font-mono text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-paper/80 font-mono text-xs">
                      {typeof log.details === 'string' && log.details.startsWith('{') ? (
                        <pre className="max-w-xl whitespace-pre-wrap overflow-hidden text-paper/60 leading-relaxed bg-ink/50 p-4 rounded-xl border border-white/5">
                          {JSON.stringify(JSON.parse(log.details), null, 2)}
                        </pre>
                      ) : (
                        <span>{log.details}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default AuditLogViewer;