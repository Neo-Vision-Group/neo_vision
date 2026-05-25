'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import captureStyles from './capture.module.css'
import type { CaptureResponseBody } from '@/lib/ada-types'

interface Props {
  sessionId: string
  /** Called when capture_complete fires (parent transitions to 'final'). */
  onComplete: () => void
}

interface CaptureMessage {
  id: string
  role: 'neo' | 'user'
  content: string
}

export function CapturePhase({ sessionId, onComplete }: Props) {
  const [messages, setMessages] = useState<CaptureMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const didFetchOpening = useRef(false)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  // Fetch the Neo Vision opening on mount.
  useEffect(() => {
    if (didFetchOpening.current) return
    didFetchOpening.current = true
    setIsThinking(true)
    ;(async () => {
      try {
        const res = await fetch('/api/capture', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, user_message: '' }),
        })
        const body = (await res.json()) as CaptureResponseBody
        setIsThinking(false)
        if (body.status === 'session_expired') {
          setError(body.message)
          return
        }
        const text = body.status === 'continuing' ? body.neo_says : body.neo_says
        setMessages((m) => [
          ...m,
          {
            id: `neo-${Date.now()}`,
            role: 'neo',
            content: text,
          },
        ])
        if (body.status === 'capture_complete') {
          setTimeout(onComplete, 1500)
        }
      } catch (err) {
        setIsThinking(false)
        setError('something glitched. try refreshing.')
        console.error('[capture] opening failed', err)
      }
    })()
  }, [sessionId, onComplete])

  const submitMessage = useCallback(async () => {
    const text = inputValue.trim()
    if (!text || isThinking) return
    setInputValue('')
    setMessages((m) => [
      ...m,
      { id: `user-${Date.now()}`, role: 'user', content: text },
    ])
    setIsThinking(true)
    try {
      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, user_message: text }),
      })
      const body = (await res.json()) as CaptureResponseBody
      setIsThinking(false)
      if (body.status === 'session_expired') {
        setError(body.message)
        return
      }
      setMessages((m) => [
        ...m,
        { id: `neo-${Date.now()}`, role: 'neo', content: body.neo_says },
      ])
      if (body.status === 'capture_complete') {
        setTimeout(onComplete, 1500)
      }
    } catch (err) {
      setIsThinking(false)
      setError('something glitched. try sending again.')
      console.error('[capture] submit failed', err)
    }
  }, [inputValue, isThinking, sessionId, onComplete])

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submitMessage()
    }
  }

  return (
    <div className={captureStyles.captureRoot}>
      <div className={captureStyles.captureColumn}>
        <div className={captureStyles.captureWordmark}>NEO VISION</div>

        {messages.map((m) => (
          <div
            key={m.id}
            className={`${captureStyles.captureMessage} ${
              m.role === 'user' ? captureStyles.user : captureStyles.neo
            }`}
          >
            {m.content}
          </div>
        ))}

        {isThinking && (
          <div className={captureStyles.captureThinking}>thinking…</div>
        )}
        {error && (
          <div className={captureStyles.captureMessage} style={{ color: '#E24B4A' }}>
            {error}
          </div>
        )}
      </div>

      <div className={captureStyles.captureInputRow}>
        <textarea
          ref={inputRef}
          className={captureStyles.captureInput}
          placeholder="your answer"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isThinking}
          rows={1}
          autoFocus
          maxLength={2000}
        />
        <button
          type="button"
          className={captureStyles.captureSendButton}
          onClick={submitMessage}
          disabled={isThinking || inputValue.trim().length === 0}
        >
          send
        </button>
      </div>
    </div>
  )
}
