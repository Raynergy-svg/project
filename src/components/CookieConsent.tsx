'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Settings, Check, X, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/auth-adapter';
import { supabase } from '@/utils/supabase/client';

type ConsentOptions = {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  thirdParty: boolean;
};

type ConsentRecord = ConsentOptions & {
  timestamp: string;
  consentVersion: string;
  ipAddress?: string;
  userAgent: string;
};

const CONSENT_STORAGE_KEY = 'smart_debt_flow_cookie_consent';
const CURRENT_CONSENT_VERSION = '1.0';

export function CookieConsent() {
  const { user, isAuthenticated } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<ConsentOptions>({
    necessary: true, // Always required and cannot be turned off
    functional: false,
    analytics: false,
    marketing: false,
    thirdParty: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check if consent has been given on component mount
  useEffect(() => {
    const fetchConsent = async () => {
      try {
        // For authenticated users, try to fetch consent from backend
        if (isAuthenticated && user) {
          setIsLoading(true);
          const { data, error } = await supabase.functions.invoke('consent', {
            method: 'GET',
          });
          
          if (error) {
            console.error('Error fetching consent preferences:', error);
            // Fall back to localStorage if API fails
            checkLocalConsent();
          } else if (data && data.preferences) {
            setConsent({
              necessary: data.preferences.necessary,
              functional: data.preferences.functional,
              analytics: data.preferences.analytics,
              marketing: data.preferences.marketing,
              thirdParty: data.preferences.thirdParty,
            });
            // Don't show banner if we have preferences from the backend
            setShowBanner(false);
          } else {
            // If no preferences found in backend, check localStorage
            checkLocalConsent();
          }
          setIsLoading(false);
        } else {
          // For unauthenticated users, check localStorage
          checkLocalConsent();
        }
      } catch (err) {
        console.error('Error in fetchConsent:', err);
        checkLocalConsent();
        setIsLoading(false);
      }
    };
    
    const checkLocalConsent = () => {
      const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!storedConsent) {
        setShowBanner(true);
      } else {
        try {
          const parsedConsent = JSON.parse(storedConsent);
          setConsent(parsedConsent);
          applyConsentSettings(parsedConsent);
          setShowBanner(false);
        } catch (e) {
          console.error('Error parsing stored consent:', e);
          setShowBanner(true);
        }
      }
    };
    
    fetchConsent();
  }, [isAuthenticated, user]);

  const saveConsent = async (options: ConsentOptions) => {
    try {
      setIsLoading(true);
      
      // Record consent with metadata
      const consentRecord: ConsentRecord = {
        ...options,
        timestamp: new Date().toISOString(),
        consentVersion: CURRENT_CONSENT_VERSION,
        userAgent: navigator.userAgent,
      };
      
      // Save to localStorage for all users
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(options));
      
      // For authenticated users, also send to backend
      if (isAuthenticated && user) {
        try {
          const { data, error } = await supabase.functions.invoke('consent', {
            method: 'POST',
            body: { 
              consentData: {
                ...options,
                consentVersion: CURRENT_CONSENT_VERSION,
                userAgent: navigator.userAgent
              }
            },
          });
          
          if (error) {
            console.error('Error saving consent to backend:', error);
          }
        } catch (err) {
          console.error('Error invoking consent function:', err);
          // Continue even if backend storage fails, as we have localStorage
        }
      }
      
      // Apply consent settings regardless of backend success
      applyConsentSettings(options);
      
      // Hide banner
      setShowBanner(false);
      setShowDetails(false);
    } catch (error) {
      console.error('Error saving consent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptAll = () => {
    const allConsent: ConsentOptions = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      thirdParty: true,
    };
    setConsent(allConsent);
    saveConsent(allConsent);
  };

  const rejectAll = () => {
    const minimalConsent: ConsentOptions = {
      necessary: true, // Always required
      functional: false,
      analytics: false,
      marketing: false,
      thirdParty: false,
    };
    setConsent(minimalConsent);
    saveConsent(minimalConsent);
  };

  const savePreferences = () => {
    saveConsent(consent);
  };

  const applyConsentSettings = (options: ConsentOptions) => {
    // This function applies the consent settings to the actual tracking/cookie systems
    
    // 1. Google Analytics consent
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: options.analytics ? 'granted' : 'denied',
        ad_storage: options.marketing ? 'granted' : 'denied',
        functionality_storage: options.functional ? 'granted' : 'denied',
        personalization_storage: options.thirdParty ? 'granted' : 'denied',
      });
    }
    
    // 2. Apply to any other tracking/cookie systems
    // Example: If you use Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      if (options.marketing) {
        window.fbq('consent', 'grant');
      } else {
        window.fbq('consent', 'revoke');
      }
    }
    
    // 3. You could also set cookies with specific expiration dates based on consent
    // For example, set functional cookies only if functional consent is given
    if (options.functional) {
      // Example: document.cookie = "functional_feature=enabled; max-age=31536000; path=/";
    }
  };

  // Handle individual consent option toggle
  const handleConsentToggle = (key: keyof ConsentOptions) => {
    // Prevent toggling necessary cookies
    if (key === 'necessary') return;
    
    setConsent(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!showBanner || isLoading) return null;

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-t border-[#88B04B]/20 p-4 sm:p-6"
          >
            <div className="container mx-auto max-w-5xl">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-white text-lg font-bold">Cookie Preferences</h3>
                  <p className="text-gray-300 text-sm max-w-xl">
                    We use cookies and similar technologies to provide certain features, enhance the user experience, and deliver content that is relevant to your interests. By clicking "Accept All", you consent to the use of all cookies. Click "Customize" to set your preferences.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 self-end sm:self-center mt-4 sm:mt-0">
                  <Button 
                    variant="outline"
                    className="text-white border-white/20"
                    onClick={() => setShowDetails(true)}
                    disabled={isLoading}
                    aria-label="Customize cookie preferences"
                  >
                    <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
                    Customize
                  </Button>
                  <Button
                    variant="outline"
                    className="text-white border-white/20"
                    onClick={rejectAll}
                    disabled={isLoading}
                    aria-label="Reject all cookies"
                  >
                    <X className="h-4 w-4 mr-2" aria-hidden="true" />
                    Reject All
                  </Button>
                  <Button
                    className="bg-[#88B04B] hover:bg-[#6a8a39] text-white"
                    onClick={acceptAll}
                    disabled={isLoading}
                    aria-label="Accept all cookies"
                  >
                    <Check className="h-4 w-4 mr-2" aria-hidden="true" />
                    Accept All
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-2xl bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Cookie Settings</DialogTitle>
            <DialogDescription className="text-gray-400">
              Customize which cookies you want to allow. Learn more in our <a href="/privacy" className="text-[#88B04B] hover:underline">Privacy Policy</a>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Necessary Cookies - Cannot be disabled */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div>
                <label htmlFor="necessary-cookies" className="text-white font-medium flex items-center">
                  Necessary Cookies
                  <span className="ml-2 text-xs bg-gray-700 text-white px-2 py-0.5 rounded-full">Required</span>
                </label>
                <p className="text-gray-400 text-sm mt-1">
                  These cookies are essential for the website to function properly.
                </p>
              </div>
              <div className="bg-gray-800 px-3 py-1 rounded-full">
                <input 
                  type="checkbox"
                  id="necessary-cookies"
                  className="sr-only"
                  checked={true}
                  disabled={true}
                  aria-label="Necessary Cookies"
                />
                <span className="text-sm text-white">Always Active</span>
              </div>
            </div>
            
            {/* Functional Cookies */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div>
                <label htmlFor="functional-cookies" className="text-white font-medium">Functional Cookies</label>
                <p className="text-gray-400 text-sm mt-1">
                  These cookies enable enhanced functionality and personalization.
                </p>
              </div>
              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="functional-cookies"
                    className="sr-only peer" 
                    checked={consent.functional}
                    onChange={() => handleConsentToggle('functional')}
                    disabled={isLoading}
                    aria-label="Functional Cookies"
                  />
                  <div className={`w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#88B04B]/20 ${
                    consent.functional 
                      ? 'bg-[#88B04B]' 
                      : 'bg-gray-700'
                  } after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    consent.functional 
                      ? 'after:translate-x-full' 
                      : ''
                  }`}></div>
                </label>
              </div>
            </div>
            
            {/* Analytics Cookies */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div>
                <label htmlFor="analytics-cookies" className="text-white font-medium">Analytics Cookies</label>
                <p className="text-gray-400 text-sm mt-1">
                  These cookies help us understand how visitors interact with our website.
                </p>
              </div>
              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="analytics-cookies"
                    className="sr-only peer" 
                    checked={consent.analytics}
                    onChange={() => handleConsentToggle('analytics')}
                    disabled={isLoading}
                    aria-label="Analytics Cookies"
                  />
                  <div className={`w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#88B04B]/20 ${
                    consent.analytics 
                      ? 'bg-[#88B04B]' 
                      : 'bg-gray-700'
                  } after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    consent.analytics 
                      ? 'after:translate-x-full' 
                      : ''
                  }`}></div>
                </label>
              </div>
            </div>
            
            {/* Marketing Cookies */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div>
                <label htmlFor="marketing-cookies" className="text-white font-medium">Marketing Cookies</label>
                <p className="text-gray-400 text-sm mt-1">
                  These cookies are used to track visitors across websites to display relevant advertisements.
                </p>
              </div>
              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="marketing-cookies"
                    className="sr-only peer" 
                    checked={consent.marketing}
                    onChange={() => handleConsentToggle('marketing')}
                    disabled={isLoading}
                    aria-label="Marketing Cookies"
                  />
                  <div className={`w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#88B04B]/20 ${
                    consent.marketing 
                      ? 'bg-[#88B04B]' 
                      : 'bg-gray-700'
                  } after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    consent.marketing 
                      ? 'after:translate-x-full' 
                      : ''
                  }`}></div>
                </label>
              </div>
            </div>
            
            {/* Third-Party Cookies */}
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="third-party-cookies" className="text-white font-medium">Third-Party Cookies</label>
                <p className="text-gray-400 text-sm mt-1">
                  These cookies are set by third-party services appearing on our pages.
                </p>
              </div>
              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="third-party-cookies"
                    className="sr-only peer" 
                    checked={consent.thirdParty}
                    onChange={() => handleConsentToggle('thirdParty')}
                    disabled={isLoading}
                    aria-label="Third-Party Cookies"
                  />
                  <div className={`w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#88B04B]/20 ${
                    consent.thirdParty 
                      ? 'bg-[#88B04B]' 
                      : 'bg-gray-700'
                  } after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    consent.thirdParty 
                      ? 'after:translate-x-full' 
                      : ''
                  }`}></div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              className="border-gray-700 text-white"
              onClick={() => setShowDetails(false)}
              disabled={isLoading}
              aria-label="Cancel cookie preferences"
            >
              Cancel
            </Button>
            <Button 
              className="bg-[#88B04B] hover:bg-[#6a8a39] text-white"
              onClick={savePreferences}
              disabled={isLoading}
              aria-label="Save cookie preferences"
            >
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Add to global Window interface for TypeScript support
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: any) => void;
    fbq?: (action: string, event: string, params?: any) => void;
  }
} 