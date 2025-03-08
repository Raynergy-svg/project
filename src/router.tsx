import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Help from './pages/Help';
import AuthDemo from './pages/AuthDemo';
// Import other pages as needed

// Create router with all routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />
  },
  {
    path: '/signin',
    element: <SignIn />
  },
  {
    path: '/signup',
    element: <SignUp />
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  },
  {
    path: '/settings',
    element: <Settings />
  },
  {
    path: '/about',
    element: <About />
  },
  {
    path: '/privacy',
    element: <Privacy />
  },
  {
    path: '/terms',
    element: <Terms />
  },
  {
    path: '/help',
    element: <Help />
  },
  {
    path: '/auth-demo',
    element: <AuthDemo />
  },
  // Add other routes as needed
  {
    path: '*',
    element: <NotFound />
  }
]);

export default function Router() {
  return <RouterProvider router={router} />;
} 