/**
 * Public-display handle generator.
 *
 * Per amendment 5 of the v2 plan: adjective + noun + 2-digit number.
 * Wordlists ~80 each × 90 numbers = ~576,000 unique handles. Eliminates
 * collision retries entirely under realistic launch traffic.
 *
 * Handles look like: silent_cipher_47, brisk_beacon_18, stale_glyph_92.
 *
 * The /api/claim-artifact route generates a candidate, calls
 * `reserveHandle()` on it (Redis SET NX), and on the unlikely collision
 * regenerates and retries up to 5 times before giving up. With ~576k
 * handles that retry budget covers basically any concurrency.
 */

const ADJECTIVES: readonly string[] = [
  'silent', 'quick', 'sharp', 'slow', 'deep', 'dark', 'bright', 'pale',
  'calm', 'wild', 'lone', 'true', 'false', 'faint', 'bold', 'soft',
  'hard', 'cold', 'warm', 'lost', 'found', 'late', 'early', 'blunt',
  'raw', 'fine', 'neat', 'plain', 'odd', 'even', 'full', 'half',
  'swift', 'slack', 'prime', 'base', 'mute', 'loud', 'fierce', 'kind',
  'blind', 'dim', 'lit', 'brave', 'wary', 'slick', 'quaint', 'brisk',
  'fond', 'fresh', 'stale', 'mint', 'vast', 'tiny', 'broad', 'narrow',
  'blank', 'busy', 'idle', 'vague', 'sober', 'sleek', 'rough', 'grave',
  'low', 'high', 'shallow', 'smug', 'tame', 'feral', 'alien', 'ancient',
  'grim', 'spry', 'stark', 'apt', 'agile', 'crisp', 'damp', 'distant',
  'eerie', 'frail',
]

const NOUNS: readonly string[] = [
  'cipher', 'ghost', 'raven', 'door', 'key', 'gate', 'vault', 'lock',
  'wire', 'pulse', 'signal', 'static', 'code', 'token', 'beacon', 'lens',
  'shard', 'prism', 'echo', 'drift', 'frame', 'glyph', 'line', 'mark',
  'byte', 'node', 'port', 'scan', 'trace', 'log', 'tape', 'dial',
  'ring', 'plane', 'wave', 'grid', 'mesh', 'root', 'branch', 'leaf',
  'stone', 'ember', 'ash', 'salt', 'dust', 'mist', 'fog', 'frost',
  'glow', 'spark', 'flame', 'beam', 'shadow', 'hash', 'hex', 'blob',
  'chunk', 'fork', 'head', 'tail', 'stack', 'queue', 'heap', 'edge',
  'vertex', 'axis', 'vector', 'bit', 'qubit', 'watcher', 'sentry', 'ward',
  'monk', 'oracle', 'pilot', 'scribe', 'herald', 'relay', 'arc', 'crest',
  'siren', 'auger',
]

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Generates a candidate handle. Caller must reserve it via Redis to handle
 *  the (rare) collision case. */
export function generateHandle(): string {
  const adj = pick(ADJECTIVES)
  const noun = pick(NOUNS)
  const num = 10 + Math.floor(Math.random() * 90) // 10..99
  return `${adj}_${noun}_${num}`
}

/** Total possible unique handles. Roughly 576k. */
export function handleSpaceSize(): number {
  return ADJECTIVES.length * NOUNS.length * 90
}

/**
 * Validates a user-submitted custom handle. Same shape constraints as
 * generated handles (lowercase, underscores, alphanum) but allows any
 * 3–24 char alphanumeric+underscore input. Returns the cleaned handle
 * or null if it doesn't pass.
 */
export function validateCustomHandle(input: string): string | null {
  const cleaned = input.trim().toLowerCase()
  if (!/^[a-z0-9_]{3,24}$/.test(cleaned)) return null
  return cleaned
}
