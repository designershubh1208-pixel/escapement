import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

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
        .then(res => setMessages(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setMessages([{ role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you today?' }]);
    }
  }, [id]);

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
        setMessages(prev => [...prev, { role: 'assistant', content: 'Financial intent detected. Redirecting to execution page...' }]);
        setTimeout(() => {
          navigate('/dashboard/request');
        }, 1500);
      } else if (!id && response.data.session_id) {
        navigate(`/dashboard/chat/${response.data.session_id}`);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto px-6 pt-6 pb-8">
      <div className="mb-6">
        <h1 className="font-display text-4xl font-bold text-paper mb-2">Q&A Chat</h1>
        <p className="text-paper/60">Ask general questions to the AI.</p>
      </div>

      <div 
        className="flex-1 overflow-y-auto mb-6 pr-2 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        data-lenis-prevent
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-lime text-ink font-medium' 
                : 'bg-white/5 border border-white/10 text-paper backdrop-blur-md'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 text-paper/60 rounded-2xl p-4 animate-pulse">
              Thinking...
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
          placeholder="Type your message..."
          className="w-full bg-ink/80 border border-white/10 rounded-full pl-6 pr-32 py-4 text-paper focus:border-lime focus:outline-none transition-colors"
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          className="absolute right-2 top-2 bottom-2 bg-lime text-ink font-bold rounded-full px-6 hover:brightness-95 disabled:opacity-50 transition-all"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default QnAPage;
