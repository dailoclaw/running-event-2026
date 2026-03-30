// Capture the URL hash IMMEDIATELY at module load time
// before Supabase or React clears it
const hash = typeof window !== 'undefined' ? window.location.hash : ''
const params = new URLSearchParams(hash.replace('#', ''))

export const FLOW_TYPE = params.get('type') || null
// type=invite → new user invite
// type=recovery → password reset
export const IS_INVITE = FLOW_TYPE === 'invite'
export const IS_RECOVERY = FLOW_TYPE === 'recovery'
export const IS_PASSWORD_FLOW = IS_INVITE || IS_RECOVERY
