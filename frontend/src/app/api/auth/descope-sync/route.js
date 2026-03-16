import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const FREE_CREDITS_ON_SIGNUP = 20;

export async function POST(request) {
  try {
    const { userId, email, name, picture } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingUser) {
      return NextResponse.json({
        data: { user: existingUser, isNewUser: false },
      });
    }

    // Create new user with free credits
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email,
        name: name || email.split('@')[0],
        picture: picture || null,
        credits: FREE_CREDITS_ON_SIGNUP,
        onboarding_completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    return NextResponse.json({
      data: { user: newUser, isNewUser: true },
    });
  } catch (err) {
    console.error('descope-sync error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
