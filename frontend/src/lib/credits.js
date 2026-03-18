import { supabaseAdmin } from '@/lib/supabase';

/**
 * Deducts `amount` credits from the user.
 * Throws with `.status = 402` if insufficient credits.
 *
 * @param {string} userId
 * @param {number} amount
 * @returns {Promise<number>} new credit balance
 */
export async function deductCredits(userId, amount) {
  const { data: user, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single();

  if (fetchError || !user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  if (user.credits < amount) {
    const err = new Error('Insufficient credits');
    err.status = 402;
    throw err;
  }

  const newBalance = user.credits - amount;

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ credits: newBalance })
    .eq('id', userId);

  if (updateError) {
    const err = new Error('Failed to deduct credits');
    err.status = 500;
    throw err;
  }

  return newBalance;
}

/**
 * Returns true if user has at least `amount` credits.
 *
 * @param {string} userId
 * @param {number} amount
 * @returns {Promise<boolean>}
 */
export async function hasEnoughCredits(userId, amount) {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single();

  return (user?.credits ?? 0) >= amount;
}
