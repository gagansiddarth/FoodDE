import { supabase } from './supabase/client';
import type { Tables } from './supabase/types';

export type UserProfile = {
  id: string;
  full_name: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  email: string | null;
  avatar_url: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileUpdate = {
  full_name?: string;
  age?: number;
  gender?: string;
  location?: string;
  avatar_url?: string;
  display_name?: string;
};

/**
 * Get user profile from database
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

/**
 * Create or update user profile
 */
export async function upsertUserProfile(userId: string, email: string, profileData: ProfileUpdate): Promise<UserProfile | null> {
  try {
    console.log('Upserting profile for user:', userId);
    console.log('Email:', email);
    console.log('Profile data:', profileData);
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error upserting profile:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return null;
    }

    console.log('Profile upserted successfully:', data);
    return data;
  } catch (error) {
    console.error('Exception in upsertUserProfile:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, profileData: ProfileUpdate): Promise<UserProfile | null> {
  try {
    console.log('Updating profile for user:', userId);
    console.log('Profile data:', profileData);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating profile:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return null;
    }

    console.log('Profile updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Exception in updateUserProfile:', error);
    return null;
  }
}

/**
 * Get current user's profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return null;
    }

    return await getUserProfile(session.user.id);
  } catch (error) {
    console.error('Error in getCurrentUserProfile:', error);
    return null;
  }
}
