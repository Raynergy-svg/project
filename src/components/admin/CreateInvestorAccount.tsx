import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface InvestorData {
  email: string;
  name: string;
  password: string;
}

export function CreateInvestorAccount() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [investorData, setInvestorData] = useState<InvestorData>({
    email: '',
    name: '',
    password: ''
  });

  // Only admins can see this component
  if (!user?.email?.endsWith('@smartdebtflow.com')) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvestorData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generatePassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    setInvestorData(prev => ({
      ...prev,
      password
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      // 1. Create the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: investorData.email,
        password: investorData.password,
        options: {
          data: {
            name: investorData.name,
            role: 'investor'
          }
        }
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('User creation failed');
      }

      // 2. Create a premium profile
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 10); // 10 years from now
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            name: investorData.name,
            is_premium: true,
            trial_ends_at: null,
            subscription: {
              status: 'active',
              plan_name: 'Investor',
              current_period_end: futureDate.toISOString()
            }
          }
        ]);

      if (profileError) throw profileError;

      setResult({
        success: true,
        message: `Investor account created successfully for ${investorData.email}. They will need to verify their email before logging in.`
      });

      // Reset form
      setInvestorData({
        email: '',
        name: '',
        password: ''
      });
    } catch (error) {
      console.error('Error creating investor account:', error);
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-green-500 mb-6">Create Investor Account</h2>
      
      {result && (
        <div className={`p-4 mb-4 rounded ${result.success ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
          {result.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={investorData.email}
            onChange={handleChange}
            placeholder="investor@smartdebtflow.com"
            className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 text-white"
          />
        </div>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={investorData.name}
            onChange={handleChange}
            placeholder="Investor Name"
            className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 text-white"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="password"
              name="password"
              required
              value={investorData.password}
              onChange={handleChange}
              placeholder="Secure password"
              className="flex-1 px-4 py-2 bg-gray-700 rounded border border-gray-600 text-white"
            />
            <button
              type="button"
              onClick={generatePassword}
              className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
            >
              Generate
            </button>
          </div>
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded bg-green-600 text-white font-medium hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Creating Account...' : 'Create Investor Account'}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-sm text-gray-400">
        <p>Note: This tool is only visible to SmartDebtFlow administrators.</p>
        <p className="mt-2">Investor accounts receive premium access with no expiration date.</p>
      </div>
    </div>
  );
} 