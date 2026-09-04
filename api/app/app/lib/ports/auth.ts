export type VerifiedUser = {
  userId: string
}

export type TokenVerifier = {
  verify(token: string): Promise<VerifiedUser>
}
