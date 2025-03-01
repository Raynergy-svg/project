import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  CreditCard, 
  Shield, 
  Headphones 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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
    {
      id: 1,
      title: 'Budget Alert',
      message: 'You have exceeded your dining budget by 15%',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      title: 'New Feature',
      message: 'Check out our new debt optimization tools',
      time: '1 day ago',
      read: true,
    },
    {
      id: 3,
      title: 'Payment Due',
      message: 'Credit card payment due in 3 days',
      time: '2 days ago',
      read: true,
    },
  ];

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowSearch(false);
    setShowUserMenu(false);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    setShowNotifications(false);
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
    setShowSearch(false);
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="ml-2 text-xl font-semibold text-white md:ml-0">{title}</h1>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search button */}
          <button
            onClick={toggleSearch}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {notifications.filter(n => !n.read).length}
              </span>
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-80 rounded-md bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 z-50"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Notifications</h3>
                    <button className="text-sm text-blue-500 hover:text-blue-400">
                      Mark all as read
                    </button>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex p-3 rounded-md ${
                          notification.read ? 'bg-gray-800/50' : 'bg-gray-800'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{notification.title}</p>
                          <p className="text-sm text-gray-400">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                        {!notification.read && (
                          <div className="ml-3 flex-shrink-0">
                            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full rounded-md bg-gray-800 py-2 text-sm font-medium text-white hover:bg-gray-700">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* User menu */}
          <div className="relative ml-3">
            <button
              onClick={toggleUserMenu}
              className="flex items-center rounded-md p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                <User className="h-5 w-5 text-gray-300" />
              </div>
              <ChevronDown className="ml-1 h-4 w-4" />
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 rounded-md bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 z-50"
              >
                <div className="py-1">
                  <div className="block px-4 py-2 text-sm text-white border-b border-gray-800">
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-gray-400 truncate">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      window.location.hash = 'account';
                      setShowUserMenu(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <User className="mr-3 h-4 w-4" />
                    Account
                  </button>
                  <button
                    onClick={() => {
                      window.location.hash = 'support';
                      setShowUserMenu(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <Headphones className="mr-3 h-4 w-4" />
                    Support
                  </button>
                  <button
                    onClick={() => {
                      window.location.hash = 'billing';
                      setShowUserMenu(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <CreditCard className="mr-3 h-4 w-4" />
                    Billing
                  </button>
                  <div className="border-t border-gray-800">
                    <button
                      onClick={() => {
                        // Handle sign out
                        window.location.href = '/';
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Search panel */}
      {showSearch && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-800 bg-gray-900 p-4"
        >
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full rounded-md border-0 bg-gray-800 py-2 pl-10 pr-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              autoFocus
            />
            <button
              onClick={toggleSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </header>
  );
} 