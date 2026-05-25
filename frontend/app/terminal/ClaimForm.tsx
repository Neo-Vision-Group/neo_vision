'use client'

import { useState } from 'react'
import styles from './terminal.module.css'
import type { Mode } from '@/lib/ada-types'

interface Props {
  sessionId: string
  mode: Exclude<Mode, 'unset'>
}

const COPY: Record<
  Exclude<Mode, 'unset'>,
  {
    heading: string
    intro: string
    emailPlaceholder: string
    emailLabel: string
    ideaPlaceholder: string
    ideaLabel: string
    submitting: string
    submit: string
    successHeading: string
    successBody: string
    formAriaLabel: string
  }
> = {
  puzzle: {
    heading: 'The door opens',
    intro: "where to find you. and what you would build. i'll tell Adi.",
    emailPlaceholder: 'where to find you',
    emailLabel: 'Where to find you (email)',
    ideaPlaceholder: 'what you would build',
    ideaLabel: 'What you would build',
    submitting: 'Passing Through…',
    submit: 'Pass Through ▸',
    successHeading: 'Received.',
    successBody: 'the door sent word to Adi. step through:',
    formAriaLabel: 'Submit your contact details to claim your invite',
  },
  conversation: {
    heading: "Let's wrap up",
    intro:
      "if you want, drop your email and a line about what you'd want help with. i'll make sure Adi sees it. no pressure.",
    emailPlaceholder: 'where to find you',
    emailLabel: 'Where to find you (email)',
    ideaPlaceholder: "what you'd want help with",
    ideaLabel: "What you'd want help with",
    submitting: 'Sending…',
    submit: 'Send to Adi ▸',
    successHeading: 'Sent.',
    successBody: 'i passed your note to Adi. if anything comes of it, you\'ll hear from him directly.',
    formAriaLabel: 'Send your contact details and what you want help with',
  },
}

export function ClaimForm({ sessionId, mode }: Props) {
  const copy = COPY[mode]
  const [email, setEmail] = useState('')
  const [idea, setIdea] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ inviteUrl: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          email: email.trim(),
          idea: idea.trim(),
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || !body.success) {
        setError(body.error || 'submission failed. try again in a second.')
        setSubmitting(false)
        return
      }
      setSuccess({ inviteUrl: body.invite_url as string })
    } catch {
      setError('network error. try again.')
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className={styles.finalPanel}>
        <h2>{copy.successHeading}</h2>
        <p>{copy.successBody}</p>
        {mode === 'puzzle' && (
          <p>
            <a
              href={success.inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.finalLink}
            >
              {success.inviteUrl}
            </a>
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={styles.finalPanel}>
      <h2>{copy.heading}</h2>
      <p>{copy.intro}</p>
      <form
        className={styles.finalForm}
        onSubmit={handleSubmit}
        aria-label={copy.formAriaLabel}
      >
        <label htmlFor="ada-claim-email" className={styles.srOnly}>
          {copy.emailLabel}
        </label>
        <input
          id="ada-claim-email"
          type="email"
          className={styles.finalInput}
          placeholder={copy.emailPlaceholder}
          aria-label={copy.emailLabel}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
        />
        <label htmlFor="ada-claim-idea" className={styles.srOnly}>
          {copy.ideaLabel}
        </label>
        <input
          id="ada-claim-idea"
          type="text"
          className={styles.finalInput}
          placeholder={copy.ideaPlaceholder}
          aria-label={copy.ideaLabel}
          required
          maxLength={1000}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          disabled={submitting}
        />
        <button type="submit" className={styles.finalButton} disabled={submitting}>
          {submitting ? copy.submitting : copy.submit}
        </button>
        {error && (
          <div className={styles.finalError} role="alert">
            {error}
          </div>
        )}
      </form>
    </div>
  )
}
