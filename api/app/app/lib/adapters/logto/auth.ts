import { createRemoteJWKSet, jwtVerify } from 'jose'
import { ApiError } from '../../errors'
import type { TokenVerifier } from '../../ports/auth'

function trimSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

export type LogtoAuthConfig = {
  endpoint: string
  audience: string
  issuer?: string
}

export function createLogtoTokenVerifier(config: LogtoAuthConfig): TokenVerifier {
  const issuer = trimSlash(config.issuer ?? `${trimSlash(config.endpoint)}/oidc`)
  const jwks = createRemoteJWKSet(new URL(`${issuer}/jwks`))

  return {
    async verify(token: string) {
      try {
        const { payload } = await jwtVerify(token, jwks, {
          issuer,
          audience: config.audience,
        })

        if (typeof payload.sub !== 'string' || !payload.sub) {
          throw new ApiError('invalid-token', 'Failed to verify Logto access token.', 401)
        }

        return { userId: payload.sub }
      } catch (error) {
        if (error instanceof ApiError) {
          throw error
        }
        throw new ApiError('invalid-token', 'Failed to verify Logto access token.', 401)
      }
    },
  }
}
