import { createRemoteJWKSet, jwtVerify } from 'jose'
import { ApiError } from '../errors'

const FIREBASE_JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'

const jwks = createRemoteJWKSet(new URL(FIREBASE_JWKS_URL))

export type VerifiedFirebaseUser = {
  uid: string
  email?: string
  name?: string
}

export async function verifyFirebaseIdToken(
  token: string,
  projectId: string,
): Promise<VerifiedFirebaseUser> {
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    })

    if (typeof payload.sub !== 'string' || !payload.sub) {
      throw new ApiError('invalid-token', 'Failed to verify Firebase ID token.', 401)
    }

    return {
      uid: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      name: typeof payload.name === 'string' ? payload.name : undefined,
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('invalid-token', 'Failed to verify Firebase ID token.', 401)
  }
}
