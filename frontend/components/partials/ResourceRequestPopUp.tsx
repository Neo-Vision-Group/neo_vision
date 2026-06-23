'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import {trackResourceDownload} from '@/lib/marketing-analytics'

const popupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type PopupFormData = z.infer<typeof popupSchema>

interface ResourceRequestPopUpProps {
  isOpen: boolean
  resourceName?: string
  /** Slug of the page hosting the resource ("" for the home page). */
  isClosable?: boolean
  pageSlug?: string
  /** The freeResources item `_key` — used to re-resolve the resource server-side. */
  itemKey?: string
  onSubmit?: (email: string) => Promise<void>
  onClose?: () => void
}

export function ResourceRequestPopUp({ 
  isOpen, 
  resourceName = 'resource',
  isClosable = true,
  pageSlug,
  itemKey,
  onSubmit,
  onClose 
}: ResourceRequestPopUpProps) {
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PopupFormData>({
    resolver: zodResolver(popupSchema),
    defaultValues: {
      email: '',
    },
  })

  // Reset form when popup opens
  useEffect(() => {
    if (isOpen) {
      reset()
      setSuccess(false)
      setSubmitError(null)
    }
  }, [isOpen, reset])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && isClosable) {
        onClose?.()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, isClosable])

  const onFormSubmit = handleSubmit(async (formData) => {
    setSubmitError(null)

    if (!itemKey || pageSlug === undefined) {
      setSubmitError('Resource information is missing')
      return
    }

    try {
      if (onSubmit) {
        await onSubmit(formData.email)
      } else {
        // Fetch CSRF token first
        let csrfToken: string | null = null
        let csrfHeaderName = 'x-csrf-token'
        try {
          const csrfRes = await fetch('/api/csrf')
          if (csrfRes.ok) {
            const csrfData = await csrfRes.json()
            csrfToken = csrfData.token
            csrfHeaderName = csrfData.headerName || 'x-csrf-token'
          }
        } catch {
          // Continue without CSRF token - API will handle
        }

        // Default API call
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }
        if (csrfToken) {
          headers[csrfHeaderName] = csrfToken
        }

        const response = await fetch('/api/resource', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            email: formData.email,
            pageSlug,
            itemKey,
            website: '', // Honeypot field
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to submit request')
        }
      }
      
      setSuccess(true)
      const params = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : null
      trackResourceDownload({
        resource_name: resourceName,
        lead_source: params?.get('utm_source') || 'website',
      })
      // Auto close after 2 seconds on success
      setTimeout(() => {
        onClose?.()
      }, 2000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  })

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && isClosable) {
      onClose?.()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute inset-0 bg-black/60 backdrop-blur-[12px]"
            onClick={handleBackdropClick}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 28,
              mass: 1,
            }}
            className="relative z-10 mx-4 w-full max-w-[560px] bg-white dark:bg-dark p-6 sm:p-8 lg:p-12 border border-1 border-brand"
          >
            {/* Content */}
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-2.5">
            <h2 className="font-funnel text-2xl font-bold leading-[1.2] text-dark dark:text-white-light">
              Get the {resourceName}
            </h2>
            <p className="font-funnel text-lg leading-[1.5] tracking-normal text-dark/80 dark:text-white-light/80">
              Drop your email and we&apos;ll send the {resourceName} straight to your inbox.
            </p>
          </div>

          {success ? (
            <div className="rounded bg-green-500/10 dark:bg-green-500/20 px-6 py-4 text-center border border-green-500/30">
              <p className="font-funnel text-lg text-green-600 dark:text-green-400">
                Resource sent! Check your inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={onFormSubmit} className="flex flex-col gap-6">
              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="font-funnel text-sm leading-[1.2] text-dark dark:text-white-light">
                  E-mail*
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="email@gmail.com"
                  disabled={isSubmitting}
                  className="w-full bg-white-dark dark:bg-dark-light px-4 sm:px-6 py-3 font-funnel text-lg leading-[1.5] tracking-normal text-dark dark:text-white-light placeholder:text-dark/50 dark:placeholder:text-white-light/50 focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="font-funnel text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {submitError && (
                <p className="font-funnel text-sm text-red-500">
                  {submitError}
                </p>
              )}

              {/* Download Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Sending...' : 'Download'}
              </Button>
            </form>
          )}
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
