import React, { useState, useEffect, useRef } from 'react';
import { studioStore, ChatThread } from '../../store/studioStore';
import { showToast } from '../../store/toast';

interface Props {
  onNotification: (msg: string) => void;
}

export const ChatInboxManager: React.FC<Props> = ({ onNotification }) => {
  const [threads, setThreads] = useState<ChatThread[]>(studioStore.getState().chatThreads);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'clients' | 'inquiries' | 'resolved'>('all');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [attachTitle, setAttachTitle] = useState('');
  const [attachUrl, setAttachUrl] = useState('');
  const [attachType, setAttachType] = useState<'Figma' | 'APK Build' | 'Staging URL' | 'Document'>('Figma');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const unsub = studioStore.subscribe(() => {
      const state = studioStore.getState();
      setThreads([...state.chatThreads]);
    });
    return unsub;
  }, []);

  // Default to first thread if none selected
  const activeThread = threads.find((t) => t.id === selectedThreadId) || threads[0] || null;

  useEffect(() => {
    if (activeThread && activeThread.unreadCountAdmin > 0) {
      studioStore.markChatRead(activeThread.id, 'admin');
    }
  }, [activeThread?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages.length, activeThread?.id]);

  // Filter threads by search and tab
  const filteredThreads = threads.filter((t) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.clientName.toLowerCase().includes(q);
      const matchEmail = t.clientEmail.toLowerCase().includes(q);
      const matchCompany = (t.company || '').toLowerCase().includes(q);
      const matchSubject = t.subject.toLowerCase().includes(q);
      const matchMsg = t.messages.some((m) => m.content.toLowerCase().includes(q));
      if (!matchName && !matchEmail && !matchCompany && !matchSubject && !matchMsg) return false;
    }

    // Filter tab
    if (activeFilter === 'unread') return t.unreadCountAdmin > 0;
    if (activeFilter === 'resolved') return t.status === 'Resolved';
    if (activeFilter === 'clients') return t.category === 'Project Inquiry' || t.status === 'In Progress';
    if (activeFilter === 'inquiries') return t.category !== 'Project Inquiry';
    return true;
  });

  const unreadTotal = threads.reduce((sum, t) => sum + (t.unreadCountAdmin > 0 ? 1 : 0), 0);

  const handleSendReply = async (customText?: string) => {
    const text = (customText || replyText).trim();
    if (!text || !activeThread || sending) return;

    if (!customText) setReplyText('');
    setSending(true);
    try {
      await studioStore.sendChatMessage(activeThread.id, text, 'admin');
      onNotification(`Reply delivered to ${activeThread.clientName}`);
      setShowEmojiPicker(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch {
      showToast('Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const handleSetStatus = (threadId: string, status: ChatThread['status']) => {
    studioStore.updateChatThreadStatus(threadId, status);
    onNotification(`Chat marked as "${status}"`);
  };

  const handleSendAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachTitle.trim() || !attachUrl.trim() || !activeThread) return;

    const attachmentMessage = `📦 [${attachType.toUpperCase()} DELIVERABLE] ${attachTitle.trim()}\n🔗 ${attachUrl.trim()}`;
    handleSendReply(attachmentMessage);
    setShowAttachModal(false);
    setAttachTitle('');
    setAttachUrl('');
    showToast('Deliverable link shared in chat!');
  };

  const cannedReplies = [
    "Hi! We've received your query and our engineers are reviewing it now.",
    "Your latest milestone build has been deployed to the staging environment.",
    "Could you share the Figma file access permissions?",
    "Everything is tested and verified for production rollout. 🚀",
  ];

  const popularEmojis = ['👍', '🚀', '🔥', '👏', '✅', '❤️', '🙌', '✨'];

  // Avatar gradient generator based on user name
  const getAvatarGradient = (name: string) => {
    const colors = [
      'from-amber-600 to-yellow-500',
      'from-emerald-600 to-teal-500',
      'from-blue-600 to-indigo-500',
      'from-purple-600 to-pink-500',
      'from-rose-600 to-orange-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b hairline">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Principal Direct Chat Desk</h1>
            <span className="mono text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full font-bold border border-gold/30">
              WHATSAPP DEDICATED ROOMS
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            Every user has an isolated 1-on-1 private messaging channel with real-time sync, deliverable links, and read receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/20 font-semibold">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            Principal Line Online
          </span>
          <span className="surface px-3 py-1 rounded-xl text-stone-300 border hairline font-mono">
            {threads.length} Active Contacts
          </span>
        </div>
      </div>

      {/* WhatsApp Master Container */}
      <div className="surface-strong rounded-3xl border hairline overflow-hidden shadow-2xl grid lg:grid-cols-12 h-[720px] bg-[#0c0e14]">
        {/* ══════════════ LEFT SIDEBAR: USER CONTACTS LIST (5 cols) ══════════════ */}
        <div className="lg:col-span-5 flex flex-col border-r hairline bg-[#10131a]/95 h-full">
          {/* Top User / Search Bar */}
          <div className="p-3.5 border-b hairline space-y-3 bg-[#131620]">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-stone-400">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contact, company, or message..."
                className="w-full bg-[#1a1e29] border border-white/10 rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-gold/60"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-xs text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
              {[
                { id: 'all', label: 'All Chats', count: threads.length },
                { id: 'unread', label: 'Unread', count: unreadTotal },
                { id: 'clients', label: 'Active Builds' },
                { id: 'inquiries', label: 'Inquiries' },
                { id: 'resolved', label: 'Resolved' },
              ].map((f) => {
                const isSelected = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id as typeof activeFilter)}
                    className={`px-3 py-1 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-gold text-black shadow-md shadow-gold/20'
                        : 'surface text-stone-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span>{f.label}</span>
                    {f.count !== undefined && f.count > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                        isSelected ? 'bg-black text-gold' : 'bg-gold/20 text-gold'
                      }`}>
                        {f.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User / Number List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
            {filteredThreads.length === 0 ? (
              <div className="py-20 text-center text-xs text-stone-500 space-y-2">
                <div className="text-3xl">📭</div>
                <div>No chats found in this view</div>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = activeThread?.id === thread.id;
                const hasUnread = thread.unreadCountAdmin > 0;
                const lastMsg = thread.messages[thread.messages.length - 1];

                return (
                  <button
                    key={thread.id}
                    onClick={() => {
                      setSelectedThreadId(thread.id);
                      studioStore.markChatRead(thread.id, 'admin');
                    }}
                    className={`w-full p-3.5 text-left transition-all flex items-start gap-3 relative group cursor-pointer ${
                      isSelected
                        ? 'bg-gold/10 border-l-4 border-l-gold'
                        : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    {/* User Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${getAvatarGradient(thread.clientName)} flex items-center justify-center text-white font-extrabold text-sm shadow-md`}>
                        {thread.clientName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-lime-500 border-2 border-[#10131a]" title="Online" />
                    </div>

                    {/* Contact Details & Last Message */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h3 className={`text-xs font-bold truncate ${isSelected ? 'text-gold' : 'text-white'}`}>
                          {thread.clientName}
                        </h3>
                        <span className="mono text-[10px] text-stone-400 flex-shrink-0">
                          {thread.lastMessageAt.slice(-5)}
                        </span>
                      </div>

                      <div className="text-[10px] text-stone-400 truncate mb-1">
                        {thread.company || thread.clientEmail}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-[11px] truncate flex items-center gap-1 ${hasUnread ? 'text-stone-100 font-semibold' : 'text-stone-400'}`}>
                          {lastMsg?.senderRole === 'admin' && (
                            <span className="text-sky-400 font-bold" title="Delivered & Read">✓✓</span>
                          )}
                          <span className="truncate">{thread.lastMessage}</span>
                        </p>

                        {hasUnread && (
                          <span className="px-2 py-0.5 rounded-full bg-gold text-black text-[10px] font-extrabold flex-shrink-0 animate-pulse">
                            {thread.unreadCountAdmin}
                          </span>
                        )}
                      </div>

                      {/* Category Tag */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-stone-400">
                          {thread.category}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          thread.status === 'Resolved'
                            ? 'bg-lime-400/10 text-lime-400'
                            : thread.status === 'In Progress'
                            ? 'bg-amber-400/10 text-amber-300'
                            : 'bg-sky-400/10 text-sky-400'
                        }`}>
                          {thread.status}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ══════════════ RIGHT PANEL: WHATSAPP 1-ON-1 ACTIVE CHAT AREA (7 cols) ══════════════ */}
        <div className="lg:col-span-7 flex flex-col h-full bg-[#0a0c12]">
          {activeThread ? (
            <>
              {/* WhatsApp Active Contact Header */}
              <div className="p-4 bg-[#12151e] border-b hairline flex items-center justify-between gap-3 shadow-md z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${getAvatarGradient(activeThread.clientName)} flex items-center justify-center text-white font-extrabold text-sm shadow-md`}>
                      {activeThread.clientName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-lime-500 border-2 border-[#12151e]" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-extrabold text-white truncate">{activeThread.clientName}</h2>
                      <span className="mono text-[10px] text-stone-500">· {activeThread.id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-400 truncate">
                      <span className="text-lime-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-ping" />
                        Online
                      </span>
                      <span>·</span>
                      <span className="text-gold truncate">{activeThread.clientEmail}</span>
                      {activeThread.company && <span className="truncate">· {activeThread.company}</span>}
                    </div>
                  </div>
                </div>

                {/* Header Action Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAttachModal(true)}
                    className="surface hover:border-gold/50 px-2.5 py-1.5 rounded-xl text-xs text-stone-300 hover:text-white flex items-center gap-1.5 transition-all"
                    title="Send deliverable link (Figma, APK, Staging)"
                  >
                    <span>📎</span>
                    <span className="hidden sm:inline font-semibold">Share Deliverable</span>
                  </button>

                  <select
                    value={activeThread.status}
                    onChange={(e) => handleSetStatus(activeThread.id, e.target.value as ChatThread['status'])}
                    className={`text-xs font-bold rounded-xl px-3 py-1.5 border focus:outline-none cursor-pointer ${
                      activeThread.status === 'Resolved'
                        ? 'bg-lime-400/20 text-lime-300 border-lime-400/30'
                        : activeThread.status === 'In Progress'
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                        : 'bg-gold/20 text-gold border-gold/40'
                    }`}
                  >
                    <option value="Open" className="bg-[#12151e] text-white">🟢 Open</option>
                    <option value="In Progress" className="bg-[#12151e] text-white">🟡 In Progress</option>
                    <option value="Resolved" className="bg-[#12151e] text-white">✓ Resolved</option>
                  </select>
                </div>
              </div>

              {/* WhatsApp Messages Scrollable Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-[#090b10] to-[#0d1017]">
                {/* Date Capsule Separator */}
                <div className="flex justify-center my-2">
                  <span className="mono text-[10px] uppercase tracking-wider px-3 py-1 rounded-full bg-white/5 border hairline text-stone-400">
                    Encrypted Direct Client Room · Today
                  </span>
                </div>

                {activeThread.messages.map((msg, i) => {
                  const isAdmin = msg.senderRole === 'admin';
                  return (
                    <div
                      key={msg.id || i}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} group animate-fade-in`}
                    >
                      {/* Sender label */}
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-500 mb-1 px-1">
                        <span className={`font-bold ${isAdmin ? 'text-gold' : 'text-stone-300'}`}>
                          {isAdmin ? 'Principal / Studio' : msg.senderName}
                        </span>
                        <span>·</span>
                        <span className="mono">{msg.timestamp.slice(-5)}</span>
                      </div>

                      {/* WhatsApp Speech Bubble */}
                      <div
                        className={`relative p-4 rounded-2xl max-w-[85%] sm:max-w-[75%] text-xs leading-relaxed shadow-lg ${
                          isAdmin
                            ? 'bg-[#181d26] text-stone-100 border border-gold/40 rounded-tr-xs shadow-gold/5'
                            : 'bg-[#161a22] text-stone-100 border border-white/10 rounded-tl-xs'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>

                        {/* Read Receipt & Timestamp */}
                        <div className="flex items-center justify-end gap-1.5 mt-2 text-[9px] text-stone-400 font-mono">
                          <span>{msg.timestamp.slice(-5)}</span>
                          {isAdmin && (
                            <span className="text-sky-400 font-extrabold text-[11px]" title="Read by Client">
                              ✓✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Canned Responses Bar */}
              <div className="px-4 py-2 bg-[#10131a] border-t hairline flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider flex-shrink-0">
                  ⚡ Quick:
                </span>
                {cannedReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendReply(reply)}
                    className="surface hover:border-gold/50 px-3 py-1 rounded-xl text-[11px] text-stone-300 hover:text-white whitespace-nowrap transition-all flex-shrink-0"
                  >
                    {reply.length > 32 ? reply.slice(0, 32) + '...' : reply}
                  </button>
                ))}
              </div>

              {/* WhatsApp Message Input Bar */}
              <div className="p-3.5 bg-[#12151e] border-t hairline relative">
                {/* Emoji Picker Popup */}
                {showEmojiPicker && (
                  <div className="absolute bottom-16 left-4 surface-strong p-2.5 rounded-2xl border hairline shadow-2xl flex gap-2 z-20 animate-modal-in">
                    {popularEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setReplyText((prev) => prev + emoji);
                          setShowEmojiPicker(false);
                          inputRef.current?.focus();
                        }}
                        className="text-lg p-1.5 hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendReply();
                  }}
                  className="flex items-end gap-2.5"
                >
                  {/* Emoji & Attachment Buttons */}
                  <div className="flex items-center gap-1 pb-1">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-8 h-8 rounded-xl surface flex items-center justify-center text-sm text-stone-400 hover:text-white transition-colors"
                      title="Insert Emoji"
                    >
                      😊
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAttachModal(true)}
                      className="w-8 h-8 rounded-xl surface flex items-center justify-center text-sm text-stone-400 hover:text-white transition-colors"
                      title="Attach Deliverable / Link"
                    >
                      📎
                    </button>
                  </div>

                  {/* Message Input Textarea */}
                  <div className="flex-1 bg-[#181d27] border border-white/10 rounded-2xl px-4 py-2.5 focus-within:border-gold/70 transition-all">
                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Type a direct message to ${activeThread.clientName} (Press Enter to send)...`}
                      className="w-full bg-transparent text-xs text-white placeholder-stone-500 focus:outline-none resize-none max-h-32 leading-relaxed"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!replyText.trim() || sending}
                    className="w-10 h-10 rounded-2xl bg-gold text-[#0a0c10] font-bold flex items-center justify-center shadow-lg shadow-gold/20 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all flex-shrink-0 cursor-pointer"
                    title="Send Message"
                  >
                    {sending ? (
                      <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    ) : (
                      <span className="text-base font-extrabold">➔</span>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-500 space-y-3">
              <div className="text-4xl">💬</div>
              <div className="text-sm font-bold text-white">Select a contact from the left list</div>
              <div className="text-xs text-stone-400 max-w-xs">
                Each client has an isolated WhatsApp-style conversation channel.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Deliverable Modal */}
      {showAttachModal && (
        <div className="fixed inset-0 z-[300] video-modal-backdrop flex items-center justify-center p-4">
          <div className="surface-strong rounded-3xl p-6 gold-border w-full max-w-md space-y-4 animate-modal-in">
            <div className="flex items-center justify-between pb-2 border-b hairline">
              <div className="flex items-center gap-2">
                <span className="text-lg">📎</span>
                <h3 className="text-base font-bold text-white">Share Project Deliverable Link</h3>
              </div>
              <button
                onClick={() => setShowAttachModal(false)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendAttachment} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 font-semibold mb-1">Deliverable Type</label>
                <select
                  value={attachType}
                  onChange={(e) => setAttachType(e.target.value as typeof attachType)}
                  className="w-full bg-[#12151e] border border-white/10 rounded-xl p-2.5 text-white"
                >
                  <option value="Figma">🎨 Figma Design Prototype</option>
                  <option value="APK Build">🚀 Android APK / TestFlight Beta</option>
                  <option value="Staging URL">🌐 Web Staging Preview</option>
                  <option value="Document">📄 Architecture SOW / PDF</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Title / Description</label>
                <input
                  type="text"
                  required
                  value={attachTitle}
                  onChange={(e) => setAttachTitle(e.target.value)}
                  placeholder="e.g. Hearth Beta Android APK v0.8.4"
                  className="w-full bg-[#12151e] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Resource URL</label>
                <input
                  type="url"
                  required
                  value={attachUrl}
                  onChange={(e) => setAttachUrl(e.target.value)}
                  placeholder="https://builds.clientfound.app/hearth-v0.8.4.apk"
                  className="w-full bg-[#12151e] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAttachModal(false)}
                  className="btn-ghost rounded-xl px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold rounded-xl px-5 py-2 font-bold"
                >
                  Send Deliverable Link ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
