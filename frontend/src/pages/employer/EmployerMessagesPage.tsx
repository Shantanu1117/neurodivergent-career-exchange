import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Conversation, Message } from '../../types/index.js';
import { MessageSquare, Send, User, Building2 } from 'lucide-react';

export const EmployerMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { error } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await api.getConversations();
        if (res.success && res.conversations) {
          setConversations(res.conversations);
          if (res.conversations.length > 0) {
            setActiveConvId(res.conversations[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      }
    };
    loadConversations();
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeConvId) return;
      try {
        const res = await api.getMessages(activeConvId);
        if (res.success) {
          setMessages(res.messages);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };
    loadMessages();
  }, [activeConvId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    setSending(true);
    const content = inputText.trim();
    setInputText('');

    try {
      const res = await api.sendMessage({
        conversationId: activeConvId,
        content,
      });

      if (res.success) {
        setMessages((prev) => [...prev, res.message]);
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConvId ? { ...c, lastMessageText: content, lastMessageAt: new Date().toISOString() } : c
          )
        );
      }
    } catch (err: any) {
      error(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => c._id === activeConvId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Candidate Messages</h1>
        <p className="text-xs text-slate-500">Communicate directly with applicants and interviewees.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle overflow-hidden h-[620px] flex flex-col md:flex-row">
        {/* Left List */}
        <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700">
            Candidate Threads ({conversations.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No active conversations yet.
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => setActiveConvId(conv._id)}
                  className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                    activeConvId === conv._id ? 'bg-white border-l-4 border-teal-600 shadow-xs' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <span className="font-bold text-xs text-slate-900 block truncate">
                      {conv.jobId?.title || 'Candidate Thread'}
                    </span>
                    <p className="text-[11px] text-slate-500 truncate">{conv.lastMessageText || 'No messages yet'}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Messages */}
        <div className="flex-1 flex flex-col bg-white">
          {activeConv ? (
            <>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <span className="text-xs font-bold text-slate-900">{activeConv.jobId?.title || 'Applicant Chat'}</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {messages.map((m) => {
                  const isMine = m.senderId === user?.id;
                  return (
                    <div key={m._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMine
                            ? 'bg-teal-700 text-white rounded-br-xs'
                            : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/60'
                        }`}
                      >
                        <p>{m.content}</p>
                        <span
                          className={`text-[9px] block mt-1 ${
                            isMine ? 'text-teal-200 text-right' : 'text-slate-400'
                          }`}
                        >
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex gap-2 bg-slate-50/50">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message to the candidate..."
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 p-6 text-center">
              Select a conversation to view chat thread.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
