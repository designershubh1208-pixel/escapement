import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ExternalLink, Zap } from 'lucide-react';

const FormattedChatMessage = ({ content, onBuyAction, actionLoading }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let tableRows = [];
  let inTable = false;

  const renderInline = (text) => {
    const parts = [];
    // Match #buy: links, standard [label](url) links, and **bold**
    const regex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const token = match[0];

      // 1. One-Click AI Buy Button: [⚡ Buy on Flipkart](#buy:Flipkart:108990:encodedQuery)
      if (token.startsWith('[') && token.includes('](#buy:')) {
        const buyMatch = token.match(/\[([^\]]+)\]\(#buy:([^:]+):([^:]+):([^)]+)\)/);
        if (buyMatch) {
          const [, label, merchant, priceStr, encodedQuery] = buyMatch;
          const price = parseFloat(priceStr) || 0;
          let query = '';
          try {
            query = decodeURIComponent(encodedQuery);
          } catch {
            query = encodedQuery;
          }
          parts.push(
            <button
              key={match.index}
              onClick={() => onBuyAction && onBuyAction({ merchant, price, query })}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime hover:brightness-105 active:scale-95 text-ink font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 flex-shrink-0"
              title={`Let AI initiate purchase for ${query} on ${merchant}`}
            >
              <Zap className="w-3.5 h-3.5 fill-ink" />
              <span>{label.replace('⚡ ', '')}</span>
            </button>
          );
        }
      }
      // 2. Standard Store Hyperlink
      else if (token.startsWith('[') && token.includes('](')) {
        const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          parts.push(
            <a
              key={match.index}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-paper hover:text-lime bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/15 text-xs transition-colors mx-0.5 shadow-sm"
            >
              <span>{linkMatch[1]}</span>
              <ExternalLink className="w-3 h-3 text-paper/40" />
            </a>
          );
        }
      }
      // 3. Bold Text
      else if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={match.index} className="font-bold text-paper">
            {token.slice(2, -2)}
          </strong>
        );
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  const flushTable = (key) => {
    if (tableRows.length === 0) return null;
    const headerRow = tableRows[0];
    const dataRows = tableRows.slice(1).filter(r => !r.every(cell => cell.match(/^[-: ]+$/)));
    
    const tableEl = (
      <div key={`table-${key}`} className="my-4 overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#121412] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-[#f0f2ec] dark:bg-white/[0.06] border-b border-black/10 dark:border-white/10 font-mono uppercase text-paper/60 text-[11px] tracking-wider">
              <tr>
                {headerRow.map((cell, cIdx) => (
                  <th key={cIdx} className="px-4 py-3 font-bold whitespace-nowrap">
                    {renderInline(cell.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-3.5 align-middle text-paper whitespace-nowrap">
                      {renderInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
    tableRows = [];
    inTable = false;
    return tableEl;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      const cells = trimmed.slice(1, -1).split('|');
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      elements.push(flushTable(i));
    }

    if (!trimmed) {
      elements.push(<div key={`spacer-${i}`} className="h-1.5" />);
      continue;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="font-display font-bold text-base sm:text-lg text-paper mt-3 mb-1.5 flex items-center gap-2">
          {renderInline(trimmed.replace('### ', ''))}
        </h3>
      );
    } else if (trimmed === '---') {
      elements.push(<hr key={`hr-${i}`} className="border-black/10 dark:border-white/10 my-3" />);
    } else if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
      elements.push(
        <div key={`li-${i}`} className="flex items-start gap-2 my-1 text-xs sm:text-sm text-paper/80">
          <span className="text-lime mt-1 font-bold">•</span>
          <div className="flex-1">{renderInline(trimmed.slice(2))}</div>
        </div>
      );
    } else if (trimmed.startsWith('👉 ')) {
      elements.push(
        <div key={`highlight-${i}`} className="p-3.5 rounded-xl bg-lime/10 border border-lime/20 text-lime font-medium text-xs sm:text-sm my-2 shadow-sm">
          {renderInline(trimmed)}
        </div>
      );
    } else {
      elements.push(
        <p key={`p-${i}`} className="text-xs sm:text-sm text-paper/90 leading-relaxed my-1">
          {renderInline(trimmed)}
        </p>
      );
    }
  }

  if (inTable && tableRows.length > 0) {
    elements.push(flushTable(lines.length));
  }

  return <div className="space-y-1">{elements}</div>;
};

const QnAPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`/api/chat/sessions/${id}`)
        .then(res => {
          if (res.data && res.data.length > 0) {
            setMessages(res.data);
          } else {
            // Session not found or belongs to another user
            setMessages([{ role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you today?' }]);
            navigate('/dashboard/chat', { replace: true });
          }
        })
        .catch(err => {
          console.error("Session load error:", err);
          navigate('/dashboard/chat', { replace: true });
        })
        .finally(() => setLoading(false));
    } else {
      setMessages([{ role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you today?' }]);
    }
  }, [id, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post('/api/chat', { 
        message: userMessage,
        session_id: id || null
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
      
      if (response.data.hasFinancialIntent) {
        setMessages(prev => [...prev, { role: 'assistant', content: '⚡ Financial intent detected. Redirecting to Buying & Orders page...' }]);
        setTimeout(() => {
          navigate('/dashboard/request');
        }, 1200);
      } else if (!id && response.data.session_id) {
        navigate(`/dashboard/chat/${response.data.session_id}`);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Instant AI Buy Action triggered when user clicks "Buy on Store" in the table
  const handleTriggerBuy = async ({ merchant, price, query }) => {
    if (loading) return;
    const buyPrompt = price > 0 
      ? `Buy ${query} from ${merchant} under ${Math.ceil(price)} INR`
      : `Buy ${query} from ${merchant}`;

    setMessages(prev => [...prev, { role: 'user', content: buyPrompt }]);
    setLoading(true);

    try {
      const response = await axios.post('/api/chat', { 
        message: buyPrompt,
        session_id: id || null
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
      
      if (response.data.hasFinancialIntent) {
        setMessages(prev => [...prev, { role: 'assistant', content: '⚡ AI financial request created! Redirecting to Buying & Orders page...' }]);
        setTimeout(() => {
          navigate('/dashboard/request');
        }, 1200);
      } else if (!id && response.data.session_id) {
        navigate(`/dashboard/chat/${response.data.session_id}`);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error creating the purchase request.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto px-6 pt-6 pb-8">
      <div className="mb-6">
        <h1 className="font-display text-4xl font-bold text-paper mb-2">Q&A Chat</h1>
        <p className="text-paper/60">Ask general questions, compare live e-commerce prices, and explore recommendations.</p>
      </div>

      <div 
        className="flex-1 overflow-y-auto mb-6 pr-2 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        data-lenis-prevent
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 sm:p-5 ${
              msg.role === 'user' 
                ? 'bg-lime text-ink font-medium shadow-sm' 
                : 'bg-white/5 border border-white/10 text-paper backdrop-blur-md shadow-sm'
            }`}>
              {msg.role === 'user' ? (
                msg.content
              ) : (
                <FormattedChatMessage 
                  content={msg.content} 
                  onBuyAction={handleTriggerBuy}
                  actionLoading={loading}
                />
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 text-paper/60 rounded-2xl p-4 animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime animate-ping"></span>
              <span>Processing request & analyzing live merchant prices...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Type your message or e.g. 'current price of HP omen laptop 16 RTX 4050'..."
          className="w-full bg-ink/80 border border-white/10 rounded-full pl-6 pr-32 py-4 text-paper focus:border-lime focus:outline-none transition-colors"
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          className="absolute right-2 top-2 bottom-2 bg-lime text-ink font-bold rounded-full px-6 hover:brightness-95 disabled:opacity-50 transition-all shadow-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default QnAPage;
