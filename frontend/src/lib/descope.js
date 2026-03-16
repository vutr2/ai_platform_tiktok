import { createSdk } from '@descope/nextjs-sdk/server';

// Server-side Descope SDK for verifying sessions in API routes
export const descopeSdk = createSdk({
  projectId: process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID,
  managementKey: process.env.DESCOPE_MANAGEMENT_KEY,
});

/**
 * Verify a Descope session token from the Authorization header.
 * Returns the token claims or throws if invalid.
 */
export async function verifySession(request) {
  const authHeader = request.headers.get('Authorization');
  const sessionToken = authHeader?.replace('Bearer ', '');

  if (!sessionToken) {
    // Try cookie-based session (set automatically by Descope middleware)
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/DS=([^;]+)/);
    const cookieToken = match?.[1];
    if (!cookieToken) throw new Error('No session token');
    const { token } = await descopeSdk.validateSession(cookieToken);
    return token;
  }

  const { token } = await descopeSdk.validateSession(sessionToken);
  return token;
}
