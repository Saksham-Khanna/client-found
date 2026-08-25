import React, { useState, useEffect, useRef } from 'react';
import { studioStore } from '../../store/studioStore';
import { showToast } from '../../store/toast';

interface Props {
  onOpenAuth?: () => void;
}

export const DirectChatWidget: React.FC<Props> = ({ onOpenAuth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [storeState, setStoreState] = useState(studioStore.getState());
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = studioStore.subscribe(() => {
      setStoreState({ ...studioStore.getState() });
    });
    return unsub;
  }, []);

  const currentUser = storeState.currentUser;
  const isAuthenticated = storeState.isAuthenticated && !!currentUser;
  const isAdmin = currentUser?.role === 'admin';
  const threads = storeState.chatThreads;

  // For a client: find or compute their unique dedicated 1-on-1 thread
  const clientThread = currentUser
    ? threads.find(
        (t) =>
          t.clientEmail.toLowerCase() === currentUser.email.toLowerCase() ||
          t.clientName.toLowerCase() === currentUser.name.toLowerCase()
      ) || null
    : null;

  // Active thread:
  // If client: always their dedicated thread
  // If admin: selected thread or first thread
  const activeThread = !isAuthenticated
    ? null
    : isAdmin
    ? selectedThreadId
      ? threads.find((t) => t.id === selectedThreadId) || null
      : null
    : clientThread;

  // Auto-scroll messages in active thread
  useEffect(() => {
    if (isOpen && activeThread) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, activeThread?.id, activeThread?.messages.length]);

  // If client opens the widget and has unread admin messages, mark them read
  useEffect(() => {
    if (isOpen && activeThread && !isAdmin && activeThread.unreadCountClient > 0) {
      studioStore.markChatRead(activeThread.id, 'client');
    }
  }, [isOpen, activeThread?.id, activeThread?.unreadCountClient, isAdmin]);

  // Calculate unread badge count
  const unreadCount = !isAuthenticated
    ? 0
    : isAdmin
    ? threads.reduce((sum, t) => sum + t.unreadCountAdmin, 0)
    : clientThread
    ? clientThread.unreadCountClient
    : 0;

  const handleOpenAdminThread = (tId: string) => {
    setSelectedThreadId(tId);
    studioStore.markChatRead(tId, 'admin');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    if (!isAuthenticated || !currentUser) {
      showToast('Please sign in to send a message.');
      onOpenAuth?.();
      return;
    }

    const content = messageInput.trim();
    setMessageInput('');
    setSending(true);

    try {
      if (!activeThread) {
        // Automatically create this user's dedicated thread on their first message!
        const created = await studioStore.createChatThread({
          clientName: currentUser.name,
          clientEmail: currentUser.email,
          company: currentUser.company || 'Personal App Client',
          subject: `Direct Engineering Support - ${currentUser.name}`,
          category: 'Project Inquiry',
          initialMessage: content,
        });
        setSelectedThreadId(created.id);
        showToast('Connected to Engineering Studio!');
      } else {
        const role = isAdmin ? 'admin' : 'client';
        await studioStore.sendChatMessage(activeThread.id, content, role);
      }
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch {
      showToast('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const getAvatarGradient = (userName: string) => {
    const colors = [
      'from-amber-600 to-yellow-500',
      'from-emerald-600 to-teal-500',
      'from-blue-600 to-indigo-500',
      'from-purple-600 to-pink-500',
      'from-rose-600 to-orange-500',
    ];
    let hash = 0;
    for (let i = 0; i < userName.length; i++) hash += userName.charCodeAt(i);
    return colors[hash % colors.length];
  };

  // Filtered threads for Admin multi-user list
  const filteredThreadsForAdmin = threads.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.clientName.toLowerCase().includes(q) ||
      t.clientEmail.toLowerCase().includes(q) ||
      (t.company || '').toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.lastMessage.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none font-sans">
      {/* Floating launcher bubble */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            if (isAdmin) {
              setSelectedThreadId(null);
            }
          }}
          className="group relative flex items-center gap-3 px-4 py-3 rounded-full bg-[#10131a] text-white border border-gold/40 shadow-2xl shadow-black/90 hover:border-gold hover:scale-105 transition-all focus:outline-none cursor-pointer"
          title="Direct Line with Engineering Team"
        >
          <div className="relative flex items-center justify-center">
            <span className="text-xl">💬</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-lime-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-lime-400" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold tracking-tight text-stone-100 flex items-center gap-1.5">
              Direct Support
              {unreadCount > 0 && (
                <span className="bg-gold text-black text-[10px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </span>
            <span className="text-[9px] text-stone-400">
              {isAuthenticated ? 'Online · Direct Line' : 'Signed-In Only'}
            </span>
          </div>
        </button>
      )}

      {/* Expanded Chat Card */}
      {isOpen && (
        <div className="relative w-[92vw] sm:w-[410px] h-[570px] rounded-3xl surface-strong border border-gold/40 shadow-2xl shadow-black/95 flex flex-col overflow-hidden animate-modal-in bg-[#0c0e14]">
          {/* ══════════════ STATE 1: NOT AUTHENTICATED (SIGN-IN REQUIRED GATE) ══════════════ */}
          {!isAuthenticated ? (
            <div className="flex-1 flex flex-col h-full bg-[#0c0e14]">
              <div className="px-4 py-3 bg-[#131620] border-b hairline flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-sm font-bold text-gold">
                    🔒
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">ClientFound Direct Desk</div>
                    <div className="text-[10px] text-stone-400">Authentication Required</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full surface flex items-center justify-center text-stone-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 my-auto">
                <div className="w-16 h-16 rounded-3xl bg-gold/10 border border-gold/30 flex items-center justify-center text-3xl shadow-lg shadow-gold/10 animate-pulse">
                  💬
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-extrabold text-white tracking-tight">
                    Sign In to Access Direct Support
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed max-w-xs mx-auto">
                    Direct 1-on-1 messaging with the Principal and Engineering team is reserved exclusively for registered clients & founders.
                  </p>
                </div>

                <div className="pt-2 w-full space-y-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenAuth?.();
                    }}
                    className="w-full btn-gold py-3 rounded-2xl text-xs font-bold shadow-lg shadow-gold/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-98 transition-all"
                  >
                    <span>Sign In or Register</span>
                    <span className="font-extrabold">➔</span>
                  </button>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full btn-ghost py-2 text-xs text-stone-400 hover:text-white"
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            </div>
          ) : isAdmin && !activeThread ? (
            /* ══════════════ STATE 2: ADMIN MASTER USER LIST ══════════════ */
            <div className="flex-1 flex flex-col h-full bg-[#0c0e14]">
              {/* Header */}
              <div className="px-4 py-3 bg-[#131620] border-b hairline flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-base font-bold text-gold">
                    💬
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">Principal Direct Desk</span>
                      <span className="mono text-[8px] bg-gold/20 text-gold px-1.5 py-0.2 rounded font-bold">
                        {threads.length} CLIENTS
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-400">Select user to open chat</div>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full surface flex items-center justify-center text-stone-400 hover:text-white"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* Search */}
              <div className="p-3 bg-[#10131a] border-b hairline">
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-stone-400">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search client name or company..."
                    className="w-full bg-[#181d28] border border-white/10 rounded-xl pl-8 pr-7 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-gold/60"
                  />
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] bg-gradient-to-b from-[#090b10] to-[#0d1017]">
                {filteredThreadsForAdmin.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => handleOpenAdminThread(thread.id)}
                    className="w-full p-3.5 text-left transition-all hover:bg-white/[0.04] flex items-start gap-3 cursor-pointer"
                  >
                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${getAvatarGradient(thread.clientName)} flex items-center justify-center text-white font-extrabold text-xs shadow-md`}>
                        {thread.clientName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-lime-500 border-2 border-[#10131a]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h3 className="text-xs font-bold text-white truncate">{thread.clientName}</h3>
                        <span className="mono text-[10px] text-stone-400">{thread.lastMessageAt.slice(-5)}</span>
                      </div>
                      <div className="text-[10px] text-stone-400 truncate mb-1">
                        {thread.company || thread.clientEmail}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] truncate text-stone-400">
                          <span className="text-sky-400 mr-1">✓✓</span>
                          <span>{thread.lastMessage}</span>
                        </p>
                        {thread.unreadCountAdmin > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-gold text-black text-[10px] font-extrabold animate-pulse">
                            {thread.unreadCountAdmin}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ══════════════ STATE 3: DIRECT 1-ON-1 CHAT ROOM (FOR CLIENT OR SELECTED ADMIN CHAT) ══════════════ */
            <div className="flex-1 flex flex-col h-full bg-[#0c0e14]">
              {/* Header */}
              <div className="px-4 py-3 bg-[#131620] border-b hairline flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {isAdmin && (
                    <button
                      onClick={() => setSelectedThreadId(null)}
                      className="w-7 h-7 rounded-xl surface flex items-center justify-center text-xs text-stone-300 hover:text-white"
                      title="Back to client list"
                    >
                      ←
                    </button>
                  )}

                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-600 to-yellow-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                      CF
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-lime-400 border-2 border-[#131620]" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">
                        {isAdmin && activeThread ? activeThread.clientName : 'ClientFound Engineering'}
                      </span>
                      <span className="mono text-[8px] bg-gold/20 text-gold px-1.5 py-0.2 rounded font-bold">VERIFIED</span>
                    </div>
                    <div className="text-[10px] text-lime-400 font-medium truncate">
                      {isAdmin && activeThread
                        ? `${activeThread.clientEmail} · Online`
                        : 'Principal Line · Typically replies in minutes'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full surface flex items-center justify-center text-stone-400 hover:text-white"
                  title="Close chat"
                >
                  ✕
                </button>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-[#090b10] to-[#0d1017]">
                <div className="flex justify-center my-1">
                  <span className="mono text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 border hairline text-stone-400">
                    Encrypted Direct Line
                  </span>
                </div>

                {activeThread && activeThread.messages.length > 0 ? (
                  activeThread.messages.map((m) => {
                    const isSenderMe = isAdmin
                      ? m.senderRole === 'admin'
                      : m.senderRole === 'client' || m.senderRole === 'visitor';

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isSenderMe ? 'items-end' : 'items-start'} animate-fade-in`}
                      >
                        <div className="flex items-center gap-1 text-[9px] text-stone-500 mb-0.5 px-1">
                          <span className="font-semibold text-stone-400">
                            {isSenderMe ? 'You' : m.senderName}
                          </span>
                          <span>·</span>
                          <span className="mono">{m.timestamp.slice(-5)}</span>
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-md ${
                            isSenderMe
                              ? 'bg-gold text-[#0a0c10] font-semibold rounded-tr-xs shadow-gold/10'
                              : 'bg-[#181d27] text-stone-100 border border-white/10 rounded-tl-xs'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{m.content}</div>

                          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-70 font-mono">
                            <span>{m.timestamp.slice(-5)}</span>
                            {isSenderMe && <span title="Delivered">✓✓</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-16 text-center text-xs text-stone-400 space-y-2">
                    <div className="text-3xl">👋</div>
                    <div className="font-bold text-white">Direct Line with Studio Principal</div>
                    <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
                      Ask about feature specs, architecture, request a quick fix, or check project milestones.
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 bg-[#131620] border-t hairline flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message to the team..."
                  className="flex-1 bg-[#181d28] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || sending}
                  className="w-10 h-10 rounded-xl bg-gold text-[#0a0c10] flex items-center justify-center font-bold text-sm shadow-md disabled:opacity-40 hover:scale-105 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
                  title="Send message"
                >
                  ➔
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
