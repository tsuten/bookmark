import { createFirebaseTokenVerifier } from '../adapters/firebase/auth'
import { createLogtoTokenVerifier } from '../adapters/logto/auth'
import type { TokenVerifier } from '../ports/auth'

export type AuthEnv = {
  AUTH_DRIVER?: string
  FIREBASE_PROJECT_ID?: string
  LOGTO_ENDPOINT?: string
  LOGTO_AUDIENCE?: string
  LOGTO_ISSUER?: string
}

function resolveDriver(env: AuthEnv): 'firebase' | 'logto' | null {
  const driver = env.AUTH_DRIVER?.trim().toLowerCase()
  if (driver === 'firebase' || driver === 'logto') {
    return driver
  }
  if (env.LOGTO_ENDPOINT && env.LOGTO_AUDIENCE) {
    return 'logto'
  }
  if (env.FIREBASE_PROJECT_ID) {
    return 'firebase'
  }
  return null
}

export function createTokenVerifierFromEnv(env: AuthEnv): TokenVerifier | null {
  const driver = resolveDriver(env)

  if (driver === 'logto') {
    const endpoint = env.LOGTO_ENDPOINT
    const audience = env.LOGTO_AUDIENCE
    if (!endpoint || !audience) {
      return null
    }
    return createLogtoTokenVerifier({
      endpoint,
      audience,
      issuer: env.LOGTO_ISSUER,
    })
  }

  if (driver === 'firebase') {
    const projectId = env.FIREBASE_PROJECT_ID
    if (!projectId) {
      return null
    }
    return createFirebaseTokenVerifier(projectId)
  }

  return null
}
