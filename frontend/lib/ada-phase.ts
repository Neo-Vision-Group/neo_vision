/**
 * UI-phase resolver — per amendment 3 of the v2 plan.
 *
 * Maps every server-side Stage value to the UI phase that should render
 * on rehydration. Critical edge: stage `cinematic_pending` resolves to
 * the `'capture'` phase, NOT `'cinematic'`. The cinematic is a one-shot
 * moment; replaying it on a refresh would be wrong UX. The boot useEffect
 * uses this on session-restore to mount the right phase directly.
 */

import type { Phase, SessionState, Stage } from '@/lib/ada-types'

export function getResolvedPhase(state: SessionState | null): Phase {
  if (!state) return 'jailbreak'
  return phaseForStage(state.stage)
}

export function phaseForStage(stage: Stage): Phase {
  switch (stage) {
    case 'jailbreak_level_1':
    case 'jailbreak_level_2':
    case 'jailbreak_level_3':
      return 'jailbreak'
    case 'cinematic_pending':
      // Critical: a refreshed cinematic_pending session resumes at the
      // capture phase. The cinematic only plays in the live transition
      // immediately after the level-3 password submit.
      return 'capture'
    case 'capturing':
      return 'capture'
    case 'capture_complete':
    case 'claimed':
      return 'final'
    default:
      // Legacy v1 stages or anything unrecognized: default to jailbreak.
      // The route handlers will reject as session_expired if the state
      // shape doesn't match a v2 session.
      return 'jailbreak'
  }
}
