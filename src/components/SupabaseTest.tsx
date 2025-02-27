import { useState, useEffect } from 'react';
import { debugSupabase, testSupabaseConnection } from '../lib/supabase/debug-client';

export default function SupabaseTest() {
  const [testResult, setTestResult] = useState<string>('Not tested yet');
  const [signupResult, setSignupResult] = useState<string>('Not attempted');
  const [healthResult, setHealthResult] = useState<string>('Not checked');
  const [email, setEmail] = useState<string>('test@example.com');
  const [password, setPassword] = useState<string>('Password123!');

  useEffect(() => {
    // Test connection on component mount
    const runTest = async () => {
      try {
        const result = await testSupabaseConnection();
        setTestResult(JSON.stringify(result, null, 2));
      } catch (error) {
        setTestResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    runTest();
  }, []);

  const testHealth = async () => {
    try {
      setHealthResult('Checking...');
      
      // Use fetch directly to test the health endpoint
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      });
      
      const data = await response.json();
      setHealthResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setHealthResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Health check error:', error);
    }
  };

  const testSignup = async () => {
    try {
      setSignupResult('Attempting signup...');
      
      // Use the debug Supabase client to test signup
      const { data, error } = await debugSupabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: 'Test User',
          },
        },
      });
      
      if (error) {
        setSignupResult(`Error: ${error.message}`);
        console.error('Signup error:', error);
      } else {
        setSignupResult(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      setSignupResult(`Exception: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Signup exception:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Supabase Connection Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Environment Variables</h2>
        <p>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL}</p>
        <p>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Defined' : 'Undefined'}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Connection Test</h2>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
          {testResult}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Health Check</h2>
        <button 
          onClick={testHealth}
          style={{ padding: '8px 16px', marginBottom: '10px' }}
        >
          Test Health Endpoint
        </button>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
          {healthResult}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Signup Test</h2>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '8px', width: '300px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '8px', width: '300px' }}
          />
        </div>
        <button 
          onClick={testSignup}
          style={{ padding: '8px 16px', marginBottom: '10px' }}
        >
          Test Signup
        </button>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
          {signupResult}
        </pre>
      </div>
    </div>
  );
} 