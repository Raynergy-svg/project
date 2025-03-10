import React from 'react';
import Link from 'next/link';

export default function SimpleLanding() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <header className="w-full max-w-5xl mx-auto flex justify-between items-center mb-12">
        <h1 className="text-2xl font-bold">Smart Debt Flow</h1>
        <nav>
          <Link 
            href="/auth/signin-next"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In (Next.js)
          </Link>
        </nav>
      </header>
      
      <main className="flex w-full flex-1 flex-col items-center justify-center px-4 text-center sm:px-20">
        <h1 className="text-4xl font-bold sm:text-6xl">
          Welcome to Smart Debt Flow
        </h1>
        
        <p className="mt-4 text-lg sm:text-xl">
          Your financial management platform
        </p>
        
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[
            { title: 'Debt Management', url: '/about', description: 'Manage your debt efficiently' },
            { title: 'Dashboard', url: '/dashboard', description: 'View your financial status' },
            { title: 'Support', url: '/support', description: 'Get help when you need it' },
          ].map((item) => (
            <div 
              key={item.title}
              className="rounded-lg border border-gray-200 p-6 text-left hover:border-blue-500 hover:text-blue-500"
            >
              <h3 className="text-lg font-medium">{item.title}</h3>
              <p className="mt-2 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-10">
          <p className="mb-4">Migration Progress:</p>
          <ul className="text-left list-disc pl-5">
            <li>✅ Basic Next.js setup</li>
            <li>✅ Supabase authentication utilities</li>
            <li>✅ Simple Next.js sign-in page</li>
            <li>⏳ Gradual component migration</li>
            <li>⏳ API route migration</li>
          </ul>
        </div>
      </main>
      
      <footer className="flex w-full items-center justify-center border-t border-gray-200 py-8">
        <p>
          Powered by Smart Debt Flow
        </p>
      </footer>
    </div>
  );
} 