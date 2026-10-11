import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Send, User, Sparkles, CheckCircle2 } from 'lucide-react';

export const EmployerMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { error } = useToast();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const employerTemplates = [
    'Hi! Here is our written interview agenda and questions 48 hours in advance.',
    'We have confirmed all your requested Day-1 workplace accommodations.',
    'You are welcome to complete our untimed asynchronous Work-Sample task instead of a live coding call.',
  ];

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
            c._id === activeConvId
              ? { ...c, lastMessageText: content, lastMessageAt: new Date().toISOString() }
              : c
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
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Candidate Messages
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Communicate directly and asynchronously with applicants and interviewees.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-subtle overflow-hidden h-[640px] flex flex-col md:flex-row transition-colors">
        {/* Left List */}
        <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/70 dark:bg-slate-950/60">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-700 dark:text-slate-200">
            Candidate Threads ({conversations.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-200/60 dark:divide-slate-800">
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
                    activeConvId === conv._id
                      ? 'bg-white dark:bg-slate-900 border-l-4 border-teal-600 shadow-xs'
                      : 'hover:bg-white/60 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                      {conv.partnerInfo?.name || conv.jobId?.title || 'Candidate Thread'}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {conv.lastMessageText || 'No messages yet'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Messages */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
          {activeConv ? (
            <>
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/40 dark:bg-slate-900">
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    {activeConv.partnerInfo?.name || 'Candidate Conversation'}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {activeConv.jobId?.title || activeConv.partnerInfo?.subtitle || 'Applicant Thread'}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Async Thread
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30 dark:bg-slate-950/30">
                {messages.map((m) => {
                  const isMine = String(m.senderId) === String(user?.id);
                  return (
                    <div key={m._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMine
                            ? 'bg-teal-700 text-white rounded-br-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/80 dark:border-slate-700'
                        }`}
                      >
                        <p>{m.content}</p>
                        <span
                          className={`text-[9px] block mt-1 ${
                            isMine ? 'text-teal-200 text-right' : 'text-slate-400'
                          }`}
                        >
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                {employerTemplates.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setInputText(tpl)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap"
                  >
                    {tpl.slice(0, 42)}...
                  </button>
                ))}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2 bg-white dark:bg-slate-900"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message to the candidate..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
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
