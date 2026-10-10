import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameSocketContext';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Smile, Sparkles, Shield } from 'lucide-react';

const LiveChat = () => {
  const { chatMessages, sendChat } = useGame();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  const quickEmojis = ['🚀', '🔥', '💰', '🤑', '🎯', '✈️', '⚡'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    sendChat(text.trim());
    setText('');
  };

  const handleSendEmoji = (emoji) => {
    if (!user) return;
    sendChat(emoji, emoji);
  };

  return (
    <div className="w-full bg-[#14171f] border border-[#262b3a] rounded-2xl flex flex-col h-80 lg:h-full overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-3 border-b border-[#262b3a] bg-[#0c0e14] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white font-['Outfit'] uppercase tracking-wider">Live Player Chat</span>
        </div>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
          Active Room
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {chatMessages.map((msg) => {
          const isMe = user && msg.username === user.username;
          return (
            <div
              key={msg.id}
              className={`flex flex-col text-xs rounded-xl p-2.5 max-w-[90%] transition-all ${isMe ? 'ml-auto bg-emerald-950/40 border border-emerald-500/30 text-emerald-100' : 'mr-auto bg-[#1b1f2b] border border-slate-800 text-slate-200'}`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 font-bold">
                  {msg.is_admin ? (
                    <span className="flex items-center gap-1 bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded border border-amber-500/30">
                      <Shield className="w-3 h-3" /> System
                    </span>
                  ) : (
                    <span className="text-slate-300 font-semibold">{msg.username}</span>
                  )}
                </div>
                <span className="text-[9px] text-slate-500">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs leading-relaxed break-words">{msg.message}</p>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emojis Row */}
      <div className="px-3 py-1.5 bg-[#090b0e] border-t border-[#262b3a] flex items-center gap-1.5 overflow-x-auto">
        {quickEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleSendEmoji(emoji)}
            className="text-base hover:scale-125 transition-transform px-1 py-0.5"
            title={`Send ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-2 bg-[#0c0e14] border-t border-[#262b3a] flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={user ? 'Type a message...' : 'Login to chat'}
          disabled={!user}
          maxLength={150}
          className="flex-1 bg-[#14171f] border border-[#262b3a] text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!user || !text.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-2 rounded-xl flex items-center justify-center transition-colors active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

export default LiveChat;
