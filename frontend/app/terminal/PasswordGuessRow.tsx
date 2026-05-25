'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import styles from './terminal.module.css'

interface Props {
  level: 1 | 2 | 3
  disabled?: boolean
  /** Returns true on a wrong guess (which should trigger the shake animation),
   *  false otherwise (the parent handles the celebration / cinematic path). */
  onVerify: (guess: string) => Promise<{ wrong: boolean }>
}

/**
 * Inline password-guess row rendered below the conversation. The user types
 * a candidate, hits Enter or clicks "verify", and the parent's onVerify
 * callback hits /api/verify-password. On a wrong guess the row shakes; on
 * a correct guess the parent triggers the level-advance celebration or
 * cinematic transition (this component just clears the input).
 */
export function PasswordGuessRow({ level, disabled, onVerify }: Props) {
  const [value, setValue] = useState('')
  const [shake, setShake] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Clear feedback after a short hold so it doesn't persist between guesses.
  useEffect(() => {
    if (!feedback) return
    const t = setTimeout(() => setFeedback(null), 1800)
    return () => clearTimeout(t)
  }, [feedback])

  const handleSubmit = async () => {
    const guess = value.trim()
    if (!guess || submitting) return
    setSubmitting(true)
    setFeedback(null)
    try {
      const { wrong } = await onVerify(guess)
      if (wrong) {
        setShake(true)
        setFeedback('not it')
        setTimeout(() => setShake(false), 400)
      } else {
        // Correct — parent handles transition; just clear input.
        setValue('')
      }
    } catch (err) {
      console.error('[password-row] verify failed', err)
      setFeedback('something broke. try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div
      className={`${styles.passwordGuessRow} ${shake ? styles.passwordGuessShake : ''}`}
    >
      <label htmlFor="pwd-guess" className={styles.passwordGuessLabel}>
        password guess for level {level}
      </label>
      <div className={styles.passwordGuessInputRow}>
        <input
          id="pwd-guess"
          ref={inputRef}
          type="text"
          className={styles.passwordGuessInput}
          placeholder="enter the password..."
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          onKeyDown={onKeyDown}
          disabled={disabled || submitting}
          maxLength={64}
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="characters"
        />
        <button
          type="button"
          className={styles.passwordGuessButton}
          onClick={handleSubmit}
          disabled={disabled || submitting || value.trim().length === 0}
        >
          verify
        </button>
      </div>
      {feedback && (
        <div className={styles.passwordGuessFeedback} aria-live="polite">
          {feedback}
        </div>
      )}
    </div>
  )
}
