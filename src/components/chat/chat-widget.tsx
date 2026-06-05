'use client'

import { useRef, useEffect, useState, useCallback, KeyboardEvent } from 'react'
import { m, AnimatePresence, useReducedMotion } from 'motion/react'
import { useChat } from '@ai-sdk/react'
import type { UIMessage } from 'ai'
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Bot,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { chatPanel, chatMsgUser, chatMsgAssistant } from '@/lib/motion'
import type { Transition } from 'motion/react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatWidgetProps {
  userId: string | null
}

// ─── Session-storage persistence ─────────────────────────────────────────────

const STORAGE_KEY = 'uniflex_chat_messages'

function loadPersistedMessages(): UIMessage[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UIMessage[]) : []
  } catch {
    return []
  }
}

function persistMessages(messages: UIMessage[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch {
    // sessionStorage may be full or blocked — silently ignore
  }
}

// ─── Instant transition (reduced-motion override) ─────────────────────────────

const INSTANT: Transition = { duration: 0 }

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex items-end gap-1.5 px-4 pb-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-accent)]/12">
        <Bot className="h-3.5 w-3.5 text-[var(--brand-accent)]" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-[var(--bg-subtle)] px-3.5 py-2.5">
        {reduced ? (
          <span className="h-1.5 w-8 rounded-full bg-[var(--text-muted)]" />
        ) : (
          [0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)]"
              style={{ animation: `chatDotBounce 1.1s ease-in-out ${i * 0.18}s infinite` }}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message, reduced }: { message: UIMessage; reduced: boolean }) {
  const isUser = message.role === 'user'

  const textContent = message.parts
    .filter((p) => p.type === 'text')
    .map((p) => (p.type === 'text' ? p.text : ''))
    .join('')

  if (!textContent) return null

  return (
    <m.div
      variants={isUser ? chatMsgUser : chatMsgAssistant}
      initial="hidden"
      animate="visible"
      transition={reduced ? INSTANT : undefined}
      className={`flex items-end gap-1.5 px-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-accent)]/12">
          <Bot className="h-3.5 w-3.5 text-[var(--brand-accent)]" aria-hidden="true" />
        </div>
      )}
      <div
        className={[
          'max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'rounded-br-sm bg-[var(--brand-primary)] text-white'
            : 'rounded-bl-sm bg-[var(--bg-subtle)] text-[var(--text-primary)]',
        ].join(' ')}
      >
        <MessageText text={textContent} />
      </div>
    </m.div>
  )
}

// Renders text with [label](url) markdown link detection
function MessageText({ text }: { text: string }) {
  const parts = text.split(/(\[.+?\]\(.+?\))/g)

  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[(.+?)\]\((.+?)\)$/)
        if (match) {
          const [, label, href] = match
          return href.startsWith('/') ? (
            <Link key={i} href={href} className="underline underline-offset-2 hover:opacity-80">
              {label}
            </Link>
          ) : (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:opacity-80"
            >
              {label}
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          )
        }
        return part.split('\n').map((line, j, arr) => (
          <span key={`${i}-${j}`}>
            {line}
            {j < arr.length - 1 && <br />}
          </span>
        ))
      })}
    </>
  )
}

// ─── Quick replies ────────────────────────────────────────────────────────────

const QUICK_REPLIES = [
  "What electronics do you have?",
  "Gifts for kids under $30?",
  "What's your return policy?",
  "Are you an authorized Sony dealer?",
]

// ─── Main widget ──────────────────────────────────────────────────────────────

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function ChatWidget({ userId }: ChatWidgetProps) {
  const reducedMotion = useReducedMotion() ?? false
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [initialMessages] = useState<UIMessage[]>(() => loadPersistedMessages())

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const fabRef = useRef<HTMLButtonElement>(null)

  const { messages, sendMessage, status, error, clearError } = useChat({
    messages: initialMessages,
  })

  const isLoading = status === 'submitted' || status === 'streaming'
  const hasMessages = messages.length > 0

  // Close panel and return focus to FAB
  const closePanel = useCallback(() => {
    setIsOpen(false)
    requestAnimationFrame(() => fabRef.current?.focus())
  }, [])

  // Persist to sessionStorage on every change
  useEffect(() => {
    persistMessages(messages)
  }, [messages])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [messages, isLoading, reducedMotion])

  // Focus input when opened
  useEffect(() => {
    if (!isOpen) return
    const id = setTimeout(() => inputRef.current?.focus(), 150)
    return () => clearTimeout(id)
  }, [isOpen])

  // Escape to close + focus trap
  useEffect(() => {
    if (!isOpen || !panelRef.current) return
    const panel = panelRef.current

    const handleKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePanel()
        return
      }
      if (e.key !== 'Tab') return
      const els = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS))
      if (els.length === 0) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, closePanel])

  const handleSend = useCallback(() => {
    const text = inputValue.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    setInputValue('')
  }, [inputValue, isLoading, sendMessage])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Keyframe for typing dots — omitted when reduced motion */}
      {!reducedMotion && (
        <style>{`
          @keyframes chatDotBounce {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
            30% { transform: translateY(-5px); opacity: 1; }
          }
        `}</style>
      )}

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            ref={panelRef}
            key="chat-panel"
            variants={chatPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={reducedMotion ? INSTANT : undefined}
            role="dialog"
            aria-modal="true"
            aria-label="UniFlex Store chat assistant"
            className="fixed bottom-[5.5rem] right-4 z-[450] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] shadow-2xl"
            style={{ height: 'min(580px, calc(100dvh - 8rem))', transformOrigin: 'bottom right' }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--brand-primary)] px-4 py-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                <ShoppingBag className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-600 text-white">UniFlex Assistant</p>
                <p className="text-[11px] text-white/70">
                  Ask me about products, orders &amp; policies
                </p>
              </div>
              <button
                onClick={closePanel}
                aria-label="Close chat"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Live region — screen readers announce new assistant replies */}
            <div aria-live="polite" aria-atomic="false" className="sr-only">
              {hasMessages &&
                messages[messages.length - 1]?.role === 'assistant' &&
                messages[messages.length - 1]?.parts
                  .filter((p) => p.type === 'text')
                  .map((p) => (p.type === 'text' ? p.text : ''))
                  .join('')}
            </div>

            {/* Message list */}
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto py-4 overscroll-contain">
              {!hasMessages ? (
                <div className="flex flex-col items-center gap-5 px-6 py-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-accent)]/10">
                    <Bot className="h-6 w-6 text-[var(--brand-accent)]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-600 text-[var(--text-primary)]">
                      Hi! I&apos;m your UniFlex shopping assistant.
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      I can help with products, orders, policies, and brand authorizations.
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-2">
                    {QUICK_REPLIES.map((reply) => (
                      <button
                        key={reply}
                        onClick={() => sendMessage({ text: reply })}
                        disabled={isLoading}
                        className="rounded-xl border border-[var(--border-subtle)] px-3.5 py-2 text-left text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--brand-accent)] hover:bg-[var(--brand-teal-light)] hover:text-[var(--brand-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)] focus-visible:ring-offset-1 disabled:opacity-50"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} reduced={reducedMotion} />
                  ))}
                  {isLoading && <TypingIndicator reduced={reducedMotion} />}
                </>
              )}

              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <m.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={reducedMotion ? INSTANT : undefined}
                    className="mx-4 flex items-start gap-2 rounded-xl border border-[var(--error)]/25 bg-[var(--error)]/8 px-3.5 py-3 text-xs text-[var(--error)]"
                    role="alert"
                  >
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{error.message || 'Something went wrong. Please try again.'}</span>
                    <button
                      onClick={clearError}
                      className="ml-auto shrink-0 text-[var(--error)] opacity-70 hover:opacity-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--error)]"
                      aria-label="Dismiss error"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </m.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} aria-hidden="true" />
            </div>

            {/* Guest sign-in nudge */}
            {!userId && hasMessages && (
              <div className="shrink-0 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-4 py-2.5 text-[11px] text-[var(--text-muted)]">
                <Link
                  href="/auth/login"
                  className="font-500 text-[var(--brand-accent)] hover:underline"
                >
                  Sign in
                </Link>{' '}
                to look up your order status.
              </div>
            )}

            {/* Input */}
            <div className="shrink-0 border-t border-[var(--border-subtle)] px-3 py-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value)
                    // Cross-browser auto-resize (fallback for no fieldSizing support)
                    const el = e.target
                    el.style.height = 'auto'
                    el.style.height = `${Math.min(el.scrollHeight, 112)}px`
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about products, orders, policies…"
                  rows={1}
                  maxLength={2000}
                  disabled={isLoading}
                  aria-label="Chat message"
                  className="max-h-28 min-h-[44px] flex-1 resize-none overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/20 disabled:opacity-60"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  aria-label="Send message"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-white transition-all hover:bg-[var(--brand-secondary)] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="h-4 w-4 translate-x-px" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-[11px] text-[var(--text-muted)]">
                AI may make mistakes — verify important info.
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <button
        ref={fabRef}
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="fixed bottom-4 right-4 z-[450] flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white shadow-lg transition-all duration-200 hover:bg-[var(--brand-secondary)] hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)] focus-visible:ring-offset-2 active:scale-95"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <m.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={reducedMotion ? INSTANT : { duration: 0.18 }}
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </m.span>
          ) : (
            <m.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={reducedMotion ? INSTANT : { duration: 0.18 }}
            >
              <MessageCircle className="h-6 w-6" aria-hidden="true" />
            </m.span>
          )}
        </AnimatePresence>
      </button>
    </>
  )
}
