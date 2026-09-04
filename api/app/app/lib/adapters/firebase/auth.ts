import { createRemoteJWKSet, jwtVerify } from 'jose'
import { ApiError } from '../../errors'
import type { TokenVerifier } from '../../ports/auth'

const FIREBASE_JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'

const jwks = createRemoteJWKSet(new URL(FIREBASE_JWKS_URL))

export function createFirebaseTokenVerifier(projectId: string): TokenVerifier {
  const issuer = `https://securetoken.google.com/${projectId}`

  return {
    async verify(token: string) {
      try {
        const { payload } = await jwtVerify(token, jwks, {
          issuer,
          audience: projectId,
        })

        if (typeof payload.sub !== 'string' || !payload.sub) {
          throw new ApiError('invalid-token', 'Failed to verify Firebase ID token.', 401)
        }

        return { userId: payload.sub }
      } catch (error) {
        if (error instanceof ApiError) {
          throw error
        }
        throw new ApiError('invalid-token', 'Failed to verify Firebase ID token.', 401)
      }
    },
  }
}
