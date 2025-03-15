'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase.types';
import type { User } from '@/types';

interface UseSubscriptionReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  isPremium: boolean;
  isTrialing: boolean;
  trialDaysRemaining: number;
  refreshUser: () => Promise<void>;
}

export function useSubscriptionNext(): UseSubscriptionReturn {
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController>();

  const fetchUser = useCallback(async () => {
    // Cancel any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw authError;
      }
      
      if (authUser) {
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .abortSignal(abortControllerRef.current.signal)
          .single();

        if (dbError) {
          throw dbError;
        }

        setUser(userData);
        setError(null);
      } else {
        setUser(null);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted, ignore error
        return;
      }
      
      console.error('Error fetching user:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch user'));
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchUser();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async () => {
      await fetchUser();
    });

    return () => {
      subscription.unsubscribe();
      // Abort any in-flight requests on cleanup
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchUser, supabase]);

  const isTrialing = user?.trialEndsAt 
    ? new Date(user.trialEndsAt) > new Date() 
    : false;

  const trialDaysRemaining = user?.trialEndsAt
    ? Math.max(0, Math.ceil(
        (new Date(user.trialEndsAt).getTime() - new Date().getTime()) / 
        (1000 * 60 * 60 * 24)
      ))
    : 0;

  return {
    user,
    loading,
    error,
    isPremium: user?.isPremium ?? false,
    isTrialing,
    trialDaysRemaining,
    refreshUser: fetchUser
  };
} 