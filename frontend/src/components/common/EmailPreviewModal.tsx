import React, { useState } from 'react';
import {
  X,
  Mail,
  CheckCircle2,
  Download,
  ExternalLink,
  Copy,
  Check,
  Send,
  Sparkles,
} from 'lucide-react';

export interface EmailLogItem {
  _id?: string;
  toEmail: string;
  toName?: string;
  fromEmail?: string;
  fromName?: string;
  subject: string;
  category?: string;
  htmlBody: string;
  textBody: string;
  status?: string;
  createdAt?: string;
}

interface EmailPreviewModalProps {
  email: EmailLogItem | null;
  isOpen: boolean;
  onClose: () => void;
  onResendToAddress?: (targetEmail: string) => Promise<void>;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  email,
  isOpen,
  onClose,
  onResendToAddress,
}) => {
  const [copied, setCopied] = useState(false);
  const [customRecipient, setCustomRecipient] = useState('');
  const [sendingCustom, setSendingCustom] = useState(false);
  const [sentNotice, setSentNotice] = useState('');

  if (!isOpen || !email) return null;

  const handleCopyText = () => {
    navigator.clipboard.writeText(`${email.subject}\n\n${email.textBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadEml = () => {
    const dateRfc = new Date(email.createdAt || Date.now()).toUTCString();
    const emlContent = [
      `From: "${email.fromName || 'Neurodivergent Career Exchange'}" <${
        email.fromEmail || 'inclusive-hiring@neurocareer.exchange'
      }>`,
      `To: "${email.toName || 'Candidate'}" <${email.toEmail}>`,
      `Subject: ${email.subject}`,
      `Date: ${dateRfc}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      email.htmlBody,
    ].join('\r\n');

    const blob = new Blob([emlContent], { type: 'message/rfc822;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `${email.subject.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 45)}.eml`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleForwardViaMailto = () => {
    const target = customRecipient.trim() || email.toEmail;
    const mailtoUrl = `mailto:${encodeURIComponent(target)}?subject=${encodeURIComponent(
      email.subject
    )}&body=${encodeURIComponent(email.textBody)}`;
    window.location.href = mailtoUrl;
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRecipient.trim() || !onResendToAddress) return;
    setSendingCustom(true);
    setSentNotice('');
    try {
      await onResendToAddress(customRecipient.trim());
      setSentNotice(`Dispatched copy to ${customRecipient.trim()}!`);
      setCustomRecipient('');
    } finally {
      setSendingCustom(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="HTML Email Preview"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Top Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                  NCE Verified Email Dispatch
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> {email.status || 'DELIVERED'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white line-clamp-1 mt-0.5">{email.subject}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close email preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Header */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200">From:</span>{' '}
              {email.fromName || 'Neurodivergent Career Exchange'} &lt;
              {email.fromEmail || 'inclusive-hiring@neurocareer.exchange'}&gt;
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200">To:</span>{' '}
              <span className="font-semibold text-brand-600 dark:text-indigo-400">{email.toEmail}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:border-brand-400 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Text' : 'Copy Text'}
            </button>
            <button
              onClick={handleDownloadEml}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:border-brand-400 transition-colors"
              title="Download standard .eml file for Apple Mail / Outlook"
            >
              <Download className="w-3.5 h-3.5 text-brand-600 dark:text-indigo-400" /> Download .eml
            </button>
            <button
              onClick={handleForwardViaMailto}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open in Mail App
            </button>
          </div>
        </div>

        {/* Optional Forward / Send to Custom Email Bar */}
        {onResendToAddress && (
          <form
            onSubmit={handleResend}
            className="px-6 py-2.5 bg-indigo-50/70 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/50 flex flex-wrap items-center justify-between gap-2"
          >
            <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-indigo-400" />
              Send a copy to another email address:
            </span>
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <input
                type="email"
                value={customRecipient}
                onChange={(e) => setCustomRecipient(e.target.value)}
                placeholder="colleague@company.com"
                className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={sendingCustom || !customRecipient.trim()}
                className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
              >
                <Send className="w-3 h-3" /> {sendingCustom ? 'Sending...' : 'Send Copy'}
              </button>
            </div>
            {sentNotice && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{sentNotice}</span>
            )}
          </form>
        )}

        {/* Rendered HTML Email Body */}
        <div className="max-h-[62vh] overflow-y-auto bg-slate-900 p-4">
          <div
            className="rounded-2xl overflow-hidden"
            dangerouslySetInnerHTML={{ __html: email.htmlBody }}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            WCAG 2.2 AA &amp; W3C COGA Compliant HTML Email • Logged in NCE Email Vault
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
