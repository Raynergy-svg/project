import { useEffect, useState } from 'react';
import { useNavigate } from '@/empty-module';
import { useAuth } from '@/contexts/AuthContext';
import { CreateInvestorAccount } from '@/components/admin/CreateInvestorAccount';
import { supabase } from '@/utils/supabase/client';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  is_premium: boolean;
  role?: string;
  created_at: string;
}

export default function AdminTools() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'investors' | 'users'>('investors');
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Admin check - redirect non-admins
  useEffect(() => {
    // Ensure user is logged in and has an admin email
    if (isAuthenticated === false) {
      navigate('/signin');
      return;
    }

    if (user && !user.email?.endsWith('@smartdebtflow.com')) {
      navigate('/dashboard');
    }
  }, [user, isAuthenticated, navigate]);

  // Load users data
  useEffect(() => {
    if (activeTab === 'users' && user?.email?.endsWith('@smartdebtflow.com')) {
      fetchUsers();
    }
  }, [activeTab, user]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, is_premium, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      // Get auth data for emails
      const authResponse = await supabase.auth.admin?.listUsers({ page: 1, perPage: 100 });
      if (authResponse?.error) {
        throw authResponse.error;
      }

      // Merge data
      const usersWithData = data.map(profile => {
        const authUser = authResponse?.data?.users?.find(u => u.id === profile.id);
        return {
          ...profile,
          email: authUser?.email || 'Unknown',
          role: authUser?.user_metadata?.role || 'User'
        };
      });

      setUsers(usersWithData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // If not authenticated or loading, show loading state
  if (!user || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // If not admin, this shouldn't render (redirect happens in useEffect)
  if (!user.email?.endsWith('@smartdebtflow.com')) {
    return null;
  }

  // Handle make premium
  const makeUserPremium = async (userId: string) => {
    try {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 10); // 10 years from now
      
      const { error } = await supabase
        .from('profiles')
        .update({
          is_premium: true,
          trial_ends_at: null,
          subscription: {
            status: 'active',
            plan_name: 'Investor',
            current_period_end: futureDate.toISOString()
          }
        })
        .eq('id', userId);

      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_premium: true } : user
      ));
      
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. See console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-green-500 mb-8">Admin Tools</h1>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`px-4 py-2 ${activeTab === 'investors' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('investors')}
          >
            Create Investor Account
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'users' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('users')}
          >
            Manage Users
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'investors' && (
          <div>
            <p className="text-gray-300 mb-6">
              Use this tool to create investor accounts with permanent premium access. 
              These accounts will be able to access all premium features without payment.
            </p>
            <CreateInvestorAccount />
          </div>
        )}
        
        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">User Management</h2>
            
            {isLoading ? (
              <div className="flex justify-center my-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Role</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Joined</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-t border-gray-700">
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">{user.name || 'N/A'}</td>
                        <td className="px-4 py-3">{user.role || 'User'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${user.is_premium ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                            {user.is_premium ? 'Premium' : 'Free'}
                          </span>
                        </td>
                        <td className="px-4 py-3">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          {!user.is_premium && (
                            <button 
                              onClick={() => makeUserPremium(user.id)}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-500"
                            >
                              Make Premium
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 