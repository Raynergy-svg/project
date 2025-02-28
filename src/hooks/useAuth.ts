import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const session = localStorage.getItem('session');
        if (session) {
          const userData = JSON.parse(session);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // For development purposes, create a mock user
          const mockUser = {
            id: 'mock-user-id',
            name: 'Test User',
            email: 'test@example.com'
          };
          setUser(mockUser);
          setIsAuthenticated(true);
          localStorage.setItem('session', JSON.stringify(mockUser));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return {
    isAuthenticated,
    user,
    isLoading,
  };
}
