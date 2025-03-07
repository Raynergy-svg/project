import React from 'react';
import { SupabaseAuthTest } from '@/components/SupabaseAuthTest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthDemo() {
  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Authentication Demo</CardTitle>
          <CardDescription>
            This page demonstrates our authentication system with enhanced security features.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Security Features</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Email and password authentication</li>
              <li>Secure token handling</li>
              <li>Email verification</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Try It Out</h2>
            <p className="mb-4">
              Use the form below to test our authentication system. You can sign up with a test email or sign in if you
              already have an account.
            </p>
            <SupabaseAuthTest />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 