import React from 'react';
import { CaptchaTest } from '@/components/CaptchaTest';

export default function CaptchaTestPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Captcha Test Page</h1>
      <CaptchaTest />
    </div>
  );
} 