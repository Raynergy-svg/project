import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpForm from '../components/auth/SignUpForm';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth-forms.css';
import '../styles/animation-effects.css';

export default function SignUpPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E1E1E] to-[#121212] flex flex-col justify-center py-6 sm:py-12">
      <div className="relative sm:max-w-xl sm:mx-auto">
        {/* Neon border effect container */}
        <div className="neon-container">
          <div className="relative px-4 py-10 bg-[#1A1A1A] sm:rounded-xl sm:p-10">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-5">
                <h1 className="text-2xl font-semibold text-white">Join Smart Debt Flow</h1>
                <p className="text-gray-400 mt-2">Create your account to start your debt-free journey</p>
              </div>
              
              <SignUpForm />
            </div>
          </div>
        </div>
      </div>
      
      {/* Feature highlights */}
      <div className="max-w-5xl mx-auto px-4 mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="bg-[#1A1A1A] p-6 rounded-lg shadow-md border border-[rgba(136,176,75,0.1)] hover:border-[#88B04B] transition-colors duration-300">
          <div className="w-10 h-10 rounded-full bg-[rgba(136,176,75,0.2)] flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#88B04B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white">Track Your Progress</h3>
          <p className="mt-2 text-gray-400">See exactly when you'll be debt-free with our interactive dashboard.</p>
        </div>
        
        <div className="bg-[#1A1A1A] p-6 rounded-lg shadow-md border border-[rgba(136,176,75,0.1)] hover:border-[#88B04B] transition-colors duration-300">
          <div className="w-10 h-10 rounded-full bg-[rgba(136,176,75,0.2)] flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#88B04B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white">Optimize Payments</h3>
          <p className="mt-2 text-gray-400">Our AI finds the fastest way to pay off your debts and save on interest.</p>
        </div>
        
        <div className="bg-[#1A1A1A] p-6 rounded-lg shadow-md border border-[rgba(136,176,75,0.1)] hover:border-[#88B04B] transition-colors duration-300">
          <div className="w-10 h-10 rounded-full bg-[rgba(136,176,75,0.2)] flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#88B04B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white">Secure & Private</h3>
          <p className="mt-2 text-gray-400">Your financial data is encrypted and never shared with third parties.</p>
        </div>
      </div>
    </div>
  );
} 