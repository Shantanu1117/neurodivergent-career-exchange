import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { useAccessibility } from '../../context/AccessibilityContext.js';
import {
  MessageSquarePlus,
  Send,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Search,
  Sparkles,
  Volume2,
  Square,
  Clock,
  ExternalLink,
  X,
} from 'lucide-react';

interface EnrichedConversation {
  _id: string;
  participants?: any[];
  jobId?: {
    _id: string;
    title: string;
    workMode?: string;
    location?: string;
  };
  lastMessageText?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  partnerInfo?: {
    userId?: string;
    name: string;
    subtitle: string;
    role: string;
    accommodations?: string[];
  };
  isLocalFallback?: boolean;
}

interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface EmployerContact {
  userId: string;
  name: string;
  subtitle: string;
  tags: string[];
  jobs?: Array<{ _id: string; title: string; workMode: string }>;
}

const FALLBACK_CONVERSATIONS: EnrichedConversation[] = [
  {
    _id: 'local-conv-fintech',
    jobId: {
      _id: 'demo-job-1',
      title: 'QA Automation Engineer (Cypress / Playwright)',
      workMode: 'REMOTE',
      location: 'Remote',
    },
    lastMessageText:
      'Welcome! We share all interview questions 48 hours in advance and support written-first communication. Ask us anything about accommodations or role fit!',
    lastMessageAt: new Date(Date.now() - 120000).toISOString(),
    partnerInfo: {
      name: 'Fintech Logic Corp',
      subtitle: 'Financial Infrastructure • Remote',
      role: 'EMPLOYER',
      accommodations: ['Written instructions', 'Quiet focus blocks', 'Camera-optional calls'],
    },
    isLocalFallback: true,
  },
  {
    _id: 'local-conv-neurotech',
    jobId: {
      _id: 'demo-job-2',
      title: 'Data Integrity & SQL Audit Specialist',
      workMode: 'REMOTE',
      location: 'Remote',
    },
    lastMessageText:
      'Hi! You can share your "How I Work Best" canvas or request our practical asynchronous work-sample option right here in this thread.',
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    partnerInfo: {
      name: 'NeuroTech Labs',
      subtitle: 'AI & Assistive Tech • Remote',
      role: 'EMPLOYER',
      accommodations: ['Advance meeting agendas', 'Flexible core hours', 'Async standups'],
    },
    isLocalFallback: true,
  },
];

const QUICK_MESSAGE_TEMPLATES = [
  {
    label: 'Ask about 48h advance questions',
    text: 'Hi! Could you confirm whether written interview questions and agendas are shared 48 hours in advance for this role?',
  },
  {
    label: 'Share "How I Work Best" needs',
    text: 'Hello! I perform best with clear written acceptance criteria, quiet deep-focus blocks, and asynchronous Slack/written updates.',
  },
  {
    label: 'Inquire about Work-Sample task',
    text: 'Hi team! I would love to demonstrate my technical skills through your asynchronous Work-Sample task rather than a live whiteboard test.',
  },
  {
    label: 'Ask about sensory & meeting load',
    text: 'Hello! Could you share what a typical week looks like in terms of synchronous meetings vs. independent deep-focus time?',
  },
];

export const CandidateMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const { speakText, stopSpeaking, isSpeaking } = useAccessibility();

  const [conversations, setConversations] = useState<EnrichedConversation[]>([]);
  const [contacts, setContacts] = useState<EmployerContact[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messagesByConv, setMessagesByConv] = useState<Record<string, ChatMessage[]>>({
    'local-conv-fintech': [
      {
        _id: 'm-init-1',
        conversationId: 'local-conv-fintech',
        senderId: 'employer-fintech',
        content:
          'Welcome to the Neurodivergent Career Exchange! I am Marcus Vance, VP of Quality Engineering at Fintech Logic Corp. For our QA & Engineering positions, we provide written task scopes, camera-optional calls, and 48-hour advance interview questions. Feel free to message here anytime!',
        createdAt: new Date(Date.now() - 120000).toISOString(),
      },
    ],
    'local-conv-neurotech': [
      {
        _id: 'm-init-2',
        conversationId: 'local-conv-neurotech',
        senderId: 'employer-neurotech',
        content:
          'Hello from the Inclusive Talent Desk at NeuroTech Labs! You can use this asynchronous thread to ask about workplace accommodations, flexible hours, or our practical work-sample alternative.',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // New Conversation Modal State
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<EmployerContact | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [initialMessageText, setInitialMessageText] = useState('');

  const feedBottomRef = useRef<HTMLDivElement>(null);

  const loadConversationsAndContacts = async () => {
    setLoading(true);
    try {
      const [convRes, contactsRes] = await Promise.all([
        api.getConversations().catch(() => null),
        api.getMessageContacts().catch(() => null),
      ]);

      if (convRes && convRes.success && convRes.conversations && convRes.conversations.length > 0) {
        setConversations(convRes.conversations);
        setActiveConvId((prev) => prev || convRes.conversations[0]._id);
      } else {
        setConversations(FALLBACK_CONVERSATIONS);
        setActiveConvId((prev) => prev || FALLBACK_CONVERSATIONS[0]._id);
      }

      if (contactsRes && contactsRes.success && contactsRes.contacts) {
        setContacts(contactsRes.contacts);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setConversations(FALLBACK_CONVERSATIONS);
      setActiveConvId(FALLBACK_CONVERSATIONS[0]._id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversationsAndContacts();
  }, []);

  useEffect(() => {
    const loadThreadMessages = async () => {
      if (!activeConvId) return;
      const conv = conversations.find((c) => c._id === activeConvId);
      if (conv?.isLocalFallback) return;

      try {
        const res = await api.getMessages(activeConvId);
        if (res.success && res.messages) {
          setMessagesByConv((prev) => ({
            ...prev,
            [activeConvId]: res.messages,
          }));
        }
      } catch (err) {
        console.error('Failed to load messages for conversation:', err);
      }
    };
    loadThreadMessages();
  }, [activeConvId]);

  useEffect(() => {
    feedBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvId, messagesByConv]);

  const activeConv = conversations.find((c) => c._id === activeConvId) || conversations[0];
  const currentMessages = activeConv ? messagesByConv[activeConv._id] || [] : [];

  const generateSmartLocalReply = (companyName: string, userMessage: string): string => {
    const lower = userMessage.toLowerCase();
    if (lower.includes('accommodation') || lower.includes('work best') || lower.includes('quiet')) {
      return `Thank you for sharing your preferences with ${companyName}! All requested accommodations—including written instructions, quiet focus blocks, and camera-optional meetings—are pre-approved from Day 1 without requiring medical documentation.`;
    }
    if (lower.includes('question') || lower.includes('interview') || lower.includes('48')) {
      return `Yes! At ${companyName}, we send the full written interview agenda and technical questions at least 48 hours before any conversation so you have ample time to prepare comfortably.`;
    }
    if (lower.includes('sample') || lower.includes('task') || lower.includes('whiteboard')) {
      return `Absolutely—we strongly support practical Work-Sample submissions instead of live whiteboard coding. You can submit a scoped, untimed task directly when applying or share a walkthrough link here.`;
    }
    return `Thanks for messaging ${companyName}! Our inclusive hiring lead has received your note in our asynchronous queue and will follow up in writing—never with an unannounced phone call.`;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    setSending(true);
    const content = inputText.trim();
    setInputText('');

    const optimisticUserMsg: ChatMessage = {
      _id: `local-msg-${Date.now()}`,
      conversationId: activeConv._id,
      senderId: user?.id || 'me',
      content,
      createdAt: new Date().toISOString(),
    };

    setMessagesByConv((prev) => ({
      ...prev,
      [activeConv._id]: [...(prev[activeConv._id] || []), optimisticUserMsg],
    }));

    if (activeConv.isLocalFallback) {
      const partnerName = activeConv.partnerInfo?.name || 'Inclusive Hiring Team';
      const replyText = generateSmartLocalReply(partnerName, content);
      window.setTimeout(() => {
        const replyMsg: ChatMessage = {
          _id: `local-reply-${Date.now()}`,
          conversationId: activeConv._id,
          senderId: 'employer-bot',
          content: replyText,
          createdAt: new Date().toISOString(),
        };
        setMessagesByConv((prev) => ({
          ...prev,
          [activeConv._id]: [...(prev[activeConv._id] || []), replyMsg],
        }));
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConv._id
              ? { ...c, lastMessageText: replyText, lastMessageAt: new Date().toISOString() }
              : c
          )
        );
      }, 650);
      setSending(false);
      return;
    }

    try {
      const res = await api.sendMessage({
        conversationId: activeConv._id,
        content,
      });

      if (res.success) {
        const updatedList: ChatMessage[] = [
          ...(messagesByConv[activeConv._id] || []).filter((m) => m._id !== optimisticUserMsg._id),
          res.message,
        ];
        if (res.autoReplyMessage) {
          updatedList.push(res.autoReplyMessage);
        }
        setMessagesByConv((prev) => ({
          ...prev,
          [activeConv._id]: updatedList,
        }));

        const latestTxt = res.autoReplyMessage ? res.autoReplyMessage.content : content;
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConv._id
              ? { ...c, lastMessageText: latestTxt, lastMessageAt: new Date().toISOString() }
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

  const handleStartNewConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !initialMessageText.trim()) return;

    setSending(true);
    try {
      const res = await api.sendMessage({
        recipientId: selectedContact.userId,
        jobId: selectedJobId || undefined,
        content: initialMessageText.trim(),
      });

      if (res.success) {
        success(`Started conversation with ${selectedContact.name}!`);
        setNewChatModalOpen(false);
        setInitialMessageText('');
        await loadConversationsAndContacts();
        if (res.conversationId) {
          setActiveConvId(res.conversationId);
        }
      }
    } catch {
      // Fallback local thread creation if offline
      const newId = `local-conv-${Date.now()}`;
      const chosenJob = selectedContact.jobs?.find((j) => j._id === selectedJobId);
      const newConv: EnrichedConversation = {
        _id: newId,
        jobId: chosenJob
          ? { _id: chosenJob._id, title: chosenJob.title, workMode: chosenJob.workMode }
          : undefined,
        lastMessageText: initialMessageText.trim(),
        lastMessageAt: new Date().toISOString(),
        partnerInfo: {
          userId: selectedContact.userId,
          name: selectedContact.name,
          subtitle: selectedContact.subtitle,
          role: 'EMPLOYER',
          accommodations: selectedContact.tags,
        },
        isLocalFallback: true,
      };
      setConversations((prev) => [newConv, ...prev]);
      setMessagesByConv((prev) => ({
        ...prev,
        [newId]: [
          {
            _id: `msg-${Date.now()}`,
            conversationId: newId,
            senderId: user?.id || 'me',
            content: initialMessageText.trim(),
            createdAt: new Date().toISOString(),
          },
          {
            _id: `msg-reply-${Date.now()}`,
            conversationId: newId,
            senderId: 'employer-bot',
            content: generateSmartLocalReply(selectedContact.name, initialMessageText.trim()),
            createdAt: new Date().toISOString(),
          },
        ],
      }));
      setActiveConvId(newId);
      setNewChatModalOpen(false);
      setInitialMessageText('');
      success(`Started conversation with ${selectedContact.name}!`);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const q = searchQuery.toLowerCase();
    const partnerName = (conv.partnerInfo?.name || '').toLowerCase();
    const jobTitle = (conv.jobId?.title || '').toLowerCase();
    const lastMsg = (conv.lastMessageText || '').toLowerCase();
    return partnerName.includes(q) || jobTitle.includes(q) || lastMsg.includes(q);
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Low-Anxiety Asynchronous Communication Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Messages & Inclusive Hiring Desk
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Direct written communication with verified employers—no surprise phone calls or pressure.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (contacts.length > 0 && !selectedContact) {
              setSelectedContact(contacts[0]);
              setSelectedJobId(contacts[0].jobs?.[0]?._id || '');
            }
            setNewChatModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-card transition-colors shrink-0"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>+ Message an Employer</span>
        </button>
      </div>

      {/* Main Split Messaging Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden min-h-[650px] flex flex-col lg:flex-row transition-colors">
        {/* Left Sidebar: Active Conversations & Search */}
        <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/70 dark:bg-slate-950/60">
          <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Active Conversations ({filteredConversations.length})
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Async Ready
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company or role..."
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Conversation Thread List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-200/60 dark:divide-slate-800/80">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No matching conversations found.
                </p>
                <button
                  type="button"
                  onClick={() => setNewChatModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>Start a Conversation</span>
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeConv?._id === conv._id;
                const companyName = conv.partnerInfo?.name || 'Verified Employer';
                const roleTitle = conv.jobId?.title || conv.partnerInfo?.subtitle || 'Hiring Team Thread';

                return (
                  <button
                    key={conv._id}
                    type="button"
                    onClick={() => setActiveConvId(conv._id)}
                    className={`w-full text-left p-4 transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 border-l-4 border-brand-600 dark:border-indigo-400 shadow-xs'
                        : 'hover:bg-white/70 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {companyName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {companyName}
                        </span>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-brand-600 dark:text-indigo-400 truncate mt-0.5">
                        {roleTitle}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {conv.lastMessageText || 'Click to view conversation'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Active Chat Thread & Neuro-Affirming Prompt Chips */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
          {activeConv ? (
            <>
              {/* Thread Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-brand-50 dark:bg-indigo-950 border border-brand-200 dark:border-indigo-800 text-brand-700 dark:text-indigo-300 flex items-center justify-center font-extrabold text-sm">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                        {activeConv.partnerInfo?.name || 'Verified Hiring Team'}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Verified Partner
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activeConv.jobId?.title || activeConv.partnerInfo?.subtitle || 'Direct Asynchronous Thread'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-brand-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800 text-[11px] font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Written-First • No Unscheduled Calls</span>
                  </span>
                  {activeConv.jobId?._id && !activeConv.jobId._id.startsWith('demo-') && (
                    <Link
                      to={`/jobs/${activeConv.jobId._id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <span>View Role</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Employer Confirmed Accommodations Strip */}
              {activeConv.partnerInfo?.accommodations &&
                activeConv.partnerInfo.accommodations.length > 0 && (
                  <div className="px-5 py-2.5 bg-teal-50/60 dark:bg-teal-950/30 border-b border-teal-200/60 dark:border-teal-900/60 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="font-bold text-teal-900 dark:text-teal-300">
                      Pre-Committed Accommodations:
                    </span>
                    {activeConv.partnerInfo.accommodations.map((acc) => (
                      <span
                        key={acc}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-medium"
                      >
                        ✓ {acc}
                      </span>
                    ))}
                  </div>
                )}

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30 dark:bg-slate-950/30">
                {currentMessages.map((m) => {
                  const isMine =
                    String(m.senderId) === String(user?.id) || m.senderId === 'me';

                  return (
                    <div
                      key={m._id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs space-y-2 ${
                          isMine
                            ? 'bg-brand-600 text-white rounded-br-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/80 dark:border-slate-700'
                        }`}
                      >
                        <p className="whitespace-pre-line">{m.content}</p>
                        <div className="flex items-center justify-between gap-4 pt-1">
                          <span
                            className={`text-[10px] ${
                              isMine ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-400'
                            }`}
                          >
                            {isMine
                              ? 'You'
                              : activeConv.partnerInfo?.name || 'Hiring Team'}{' '}
                            •{' '}
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>

                          {!isMine && (
                            <button
                              type="button"
                              onClick={() =>
                                isSpeaking ? stopSpeaking() : speakText(m.content)
                              }
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-600 dark:text-indigo-400 hover:underline"
                              title="Read message aloud"
                            >
                              {isSpeaking ? (
                                <Square className="w-3 h-3" />
                              ) : (
                                <Volume2 className="w-3 h-3" />
                              )}
                              <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={feedBottomRef} />
              </div>

              {/* 1-Click Neuro-Affirming Quick Prompt Templates */}
              <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1 mr-1">
                    <Sparkles className="w-3 h-3 text-brand-500" /> Quick Prompts:
                  </span>
                  {QUICK_MESSAGE_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.label}
                      type="button"
                      onClick={() => setInputText(tpl.text)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold whitespace-nowrap transition-colors"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 flex gap-2.5 bg-white dark:bg-slate-900"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Write an asynchronous message to ${activeConv.partnerInfo?.name || 'the hiring team'}...`}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-40 shadow-sm shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? 'Sending...' : 'Send'}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 p-6 text-center">
              Select a conversation on the left or click &quot;+ Message an Employer&quot; to begin.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Start New Conversation with Any Verified Employer */}
      {newChatModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Start Asynchronous Conversation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choose a verified neuro-inclusive employer to message directly
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNewChatModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartNewConversation} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  1. Select Verified Employer:
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  {(contacts.length > 0
                    ? contacts
                    : [
                        {
                          userId: 'demo-emp-1',
                          name: 'Fintech Logic Corp',
                          subtitle: 'Financial Infrastructure • Remote',
                          tags: ['Written instructions', 'Quiet focus blocks'],
                          jobs: [{ _id: 'demo-j-1', title: 'QA Automation Engineer', workMode: 'REMOTE' }],
                        },
                        {
                          userId: 'demo-emp-2',
                          name: 'PrismFlow Cloud',
                          subtitle: 'Cloud Security • Seattle / Remote',
                          tags: ['Advance agendas', 'Async standups'],
                          jobs: [{ _id: 'demo-j-2', title: 'Cybersecurity Incident Analyst', workMode: 'REMOTE' }],
                        },
                        {
                          userId: 'demo-emp-3',
                          name: 'NeuroTech Labs',
                          subtitle: 'AI & Assistive Tech • Remote',
                          tags: ['Flexible hours', 'Camera-optional'],
                          jobs: [{ _id: 'demo-j-3', title: 'Data Integrity Specialist', workMode: 'REMOTE' }],
                        },
                      ]
                  ).map((c) => {
                    const isPicked = selectedContact?.name === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          setSelectedContact(c);
                          setSelectedJobId(c.jobs?.[0]?._id || '');
                        }}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isPicked
                            ? 'bg-brand-50 dark:bg-indigo-950 border-brand-600 dark:border-indigo-400 text-slate-900 dark:text-white ring-1 ring-brand-500'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div>
                          <span className="font-bold block">{c.name}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {c.subtitle}
                          </span>
                        </div>
                        {isPicked && <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  2. Your Message (or click a template below):
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {QUICK_MESSAGE_TEMPLATES.slice(0, 2).map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => setInitialMessageText(t.text)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-brand-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold"
                    >
                      + {t.label}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  required
                  value={initialMessageText}
                  onChange={(e) => setInitialMessageText(e.target.value)}
                  placeholder="Write your question about accommodations, interview format, or role expectations..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewChatModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending || !selectedContact || !initialMessageText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs disabled:opacity-40"
                >
                  {sending ? 'Starting...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
