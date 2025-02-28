import { useState, useEffect } from 'react';

export interface OnboardingState {
  hasCompletedOnboarding: boolean;
  shouldShowOnboarding: boolean;
  isOnboardingComplete: boolean;
  setOnboardingComplete: () => void;
  resetOnboarding: () => void;
}

const ONBOARDING_STORAGE_KEY = 'user_onboarding_completed';

export const useOnboarding = (userId?: string | null): OnboardingState => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(true); // Default to true for development
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState<boolean>(false);

  // Load onboarding status on init and when userId changes
  useEffect(() => {
    if (!userId) return;
    
    const storedValue = localStorage.getItem(`${ONBOARDING_STORAGE_KEY}_${userId}`);
    const hasCompleted = storedValue === 'true';
    
    setHasCompletedOnboarding(hasCompleted);
    
    // Automatically show onboarding if not completed
    if (!hasCompleted) {
      // Add a small delay so it doesn't appear immediately on page load
      const timer = setTimeout(() => {
        setShouldShowOnboarding(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [userId]);

  // Mark onboarding as complete
  const setOnboardingComplete = () => {
    if (!userId) return;
    
    localStorage.setItem(`${ONBOARDING_STORAGE_KEY}_${userId}`, 'true');
    setHasCompletedOnboarding(true);
    setShouldShowOnboarding(false);
  };

  // Reset onboarding status (useful for testing or if needed)
  const resetOnboarding = () => {
    if (!userId) return;
    
    localStorage.removeItem(`${ONBOARDING_STORAGE_KEY}_${userId}`);
    setHasCompletedOnboarding(false);
  };

  return {
    hasCompletedOnboarding,
    shouldShowOnboarding,
    isOnboardingComplete: true, // Always return true for development
    setOnboardingComplete,
    resetOnboarding
  };
};

export default useOnboarding;
