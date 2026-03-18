import { verifySession } from '@/lib/descope';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Verifies the session and returns the full user row from Supabase.
 * Throws an Error with a `.status` property so API routes can forward
 * the correct HTTP status code.
 *
 * @param {Request} request
 * @returns {Promise<Object>} user row from the `users` table
 */
export async function getAuthUser(request) {
  let token;
  try {
    token = await verifySession(request);
  } catch {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', token.sub)
    .single();

  if (error || !user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  return user;
}
