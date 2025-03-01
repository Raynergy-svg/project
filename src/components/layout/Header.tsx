import { useState } from 'react';
import { Bell, Menu, Search, User, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
}

export function Header({ title, onToggleSidebar }: HeaderProps) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Mock notifications
  const notifications = [
    { id: 1, message: "Payment due tomorrow", time: "1 hour ago", isRead: false },
    { id: 2, message: "Budget limit reached for dining", time: "3 hours ago", isRead: false },
    { id: 3, message: "New financial insight available", time: "Yesterday", isRead: true },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-800 bg-black/80 backdrop-blur-sm px-4 md:px-6">
      <div className="flex items-center">
        <button 
          onClick={onToggleSidebar}
          className="mr-4 rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white md:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          {showSearch ? (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "240px", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="relative"
            >
              <input
                type="text"
                placeholder="Search..."
                className="w-full rounded-md border border-gray-700 bg-gray-900 py-1.5 pl-9 pr-3 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              <Search className="absolute left-2.5 top-1.5 h-4 w-4 text-gray-400" />
              <button 
                onClick={() => setShowSearch(false)}
                className="absolute right-2 top-1.5 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {notifications.some(n => !n.isRead) && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-md border border-gray-700 bg-gray-900 shadow-lg">
              <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
                <h3 className="font-medium text-white">Notifications</h3>
                <button className="text-xs text-blue-400 hover:text-blue-300">Mark all as read</button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-gray-700">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`px-4 py-3 ${notification.isRead ? 'opacity-70' : ''}`}
                      >
                        <div className="flex items-start">
                          {!notification.isRead && (
                            <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></span>
                          )}
                          <div className={`${!notification.isRead ? 'ml-2' : ''} flex-1`}>
                            <p className="text-sm text-white">{notification.message}</p>
                            <p className="mt-1 text-xs text-gray-400">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-gray-400">
                    No notifications
                  </div>
                )}
              </div>
              <div className="border-t border-gray-700 p-2 text-center">
                <button className="text-xs text-blue-400 hover:text-blue-300">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 rounded-md p-1 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-700 flex items-center justify-center">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user?.name || 'User'} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-gray-300" />
              )}
            </div>
            <span className="hidden text-sm md:block">{user?.name || 'User'}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-md border border-gray-700 bg-gray-900 shadow-lg">
              <div className="border-b border-gray-700 px-4 py-3">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <div className="py-1">
                <a
                  href="/settings/account"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Account Settings
                </a>
                <a
                  href="/settings/security"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Security
                </a>
                <a
                  href="/settings/billing"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Billing
                </a>
              </div>
              <div className="border-t border-gray-700 py-1">
                <button
                  className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 hover:text-red-300"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 