import { supabase } from '@/utils/supabase/client';
import type { PostgrestError } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  name?: string;
  avatar_url?: string;
  is_premium: boolean;
  trial_ends_at: string | null;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  bio?: string;
  preferences?: {
    email_notifications: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
  subscription?: {
    status: 'free' | 'active' | 'past_due' | 'canceled' | 'trialing';
    plan_name?: string;
    current_period_end: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateData {
  name?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  bio?: string;
  preferences?: {
    email_notifications?: boolean;
    theme?: 'light' | 'dark' | 'system';
    language?: string;
  };
}

export interface ServiceResponse<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

/**
 * Fetches user profile by ID
 */
export async function fetchUserProfile(userId: string): Promise<ServiceResponse<Profile>> {
  try {
    if (!userId) {
      console.warn('fetchUserProfile called with empty userId');
      return { data: null, error: new Error('User ID is required') };
    }

    console.log(`Fetching profile for user: ${userId}`);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Supabase error fetching profile:', error);
      throw error;
    }

    return { data: data as Profile, error: null };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error occurred') 
    };
  }
}

/**
 * Updates user profile
 */
export async function updateUserProfile(
  userId: string, 
  profileData: ProfileUpdateData
): Promise<ServiceResponse<Profile>> {
  try {
    if (!userId) {
      console.warn('updateUserProfile called with empty userId');
      return { data: null, error: new Error('User ID is required') };
    }

    console.log(`Updating profile for user: ${userId}`, profileData);
    
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating profile:', error);
      throw error;
    }

    return { data: data as Profile, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error occurred') 
    };
  }
}

/**
 * Upload avatar image to storage
 */
export async function uploadAvatar(
  userId: string, 
  file: File
): Promise<ServiceResponse<{ avatarUrl: string }>> {
  try {
    if (!userId) {
      return { data: null, error: new Error('User ID is required') };
    }

    if (!file) {
      return { data: null, error: new Error('File is required') };
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { data: null, error: new Error('File must be an image') };
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { data: null, error: new Error('File size must be less than 2MB') };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('user-assets')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('user-assets')
      .getPublicUrl(filePath);

    const avatarUrl = urlData.publicUrl;

    // Update profile with new avatar URL
    await updateUserProfile(userId, { avatar_url: avatarUrl });

    return { data: { avatarUrl }, error: null };
  } catch (error) {
    console.error('Error in avatar upload:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error occurred') 
    };
  }
}

/**
 * Change user password
 */
export async function changePassword(
  currentPassword: string, 
  newPassword: string
): Promise<ServiceResponse<{ success: boolean }>> {
  try {
    // Supabase requires user to be logged in to change password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('Error changing password:', error);
      throw error;
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error in password change:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error occurred') 
    };
  }
} 