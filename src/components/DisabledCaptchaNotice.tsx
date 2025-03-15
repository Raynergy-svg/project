/**
 * Disabled CAPTCHA Notice Component
 *
 * This component serves as a placeholder where Turnstile CAPTCHA was previously used.
 * It functions as a simple replacement that automatically triggers the "verification"
 * callback since CAPTCHA is disabled.
 */

import { useEffect } from "react";

interface DisabledCaptchaNoticeProps {
  onVerify?: (token: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export default function DisabledCaptchaNotice({
  onVerify,
  className = "",
}: DisabledCaptchaNoticeProps) {
  // Automatically trigger onVerify with a dummy token on mount
  useEffect(() => {
    if (onVerify) {
      // Use a simple timestamp-based dummy token
      const dummyToken = `DISABLED_CAPTCHA_${Date.now()}`;
      onVerify(dummyToken);
    }
  }, [onVerify]);

  return (
    <div className={`text-xs text-gray-400 italic ${className}`}>
      CAPTCHA verification disabled
    </div>
  );
}
