import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import LoadingScreen from '@/components/ui/loading-screen';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import AdminAuthCheck from '@/components/admin/AdminAuthCheck';
import SkipToContent from "@/components/SkipToContent";
import { IS_DEV } from "@/utils/environment";
import { useDeviceContext } from "@/contexts/DeviceContext";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";
import { useErrorTracking } from "@/hooks/useErrorTracking";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { DeviceProvider } from "@/contexts/DeviceContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { Layout } from "@/components/layout/Layout";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/layout/Navbar";
import { lazyLoad, preloadComponents } from "@/utils/lazyLoad";
import { createDebtTable, checkExecuteSqlFunction } from "@/lib/supabase/createDebtTable";
import { createBankAccountsTable } from "@/lib/supabase/createBankAccountsTable";
import { createTransactionHistoryTable } from "@/lib/supabase/createTransactionHistoryTable";
import { supabase } from "@/utils/supabase/client";

// For development debugging only
function logDevInfo(message: string) {
  if (IS_DEV) {
    console.log(`[DEV] ${message}`);
  }
}

// We use top-level check that will be evaluated at build time
// eslint-disable-next-line no-new-func
const ConnectionStatus = new Function(`
  if (process.env.NODE_ENV === 'development') {
    return require('@/components/dev/ConnectionStatus').ConnectionStatus;
  } else {
    return null;
  }
`)(IS_DEV);

// Lazy load routes with enhanced error handling and loading
const Landing = lazy(() => import("@/pages/Landing"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const DebtPlanner = lazy(() => import('@/pages/DebtPlanner'));
const Settings = lazy(() => import('@/pages/Settings'));
const About = lazy(() => import("@/pages/About"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const Support = lazy(() => import('@/pages/Support'));
const Blog = lazy(() => import("@/pages/Blog"));
const Press = lazy(() => import("@/pages/Press"));
const Help = lazy(() => import('@/pages/Help'));
const Docs = lazy(() => import("@/pages/Docs"));
const Api = lazy(() => import("@/pages/Api"));
const Status = lazy(() => import("@/pages/Status"));
const Careers = lazy(() => import("@/pages/Careers"));
const JobApplication = lazy(() => import('@/pages/JobApplication'));
const Compliance = lazy(() => import("@/pages/Compliance"));
const AdminTools = lazy(() => import("@/pages/AdminTools"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const AuthDemo = lazy(() => import("@/pages/AuthDemo"));
const PaymentSuccess = lazy(() => import("@/pages/PaymentSuccess"));
const NotFound = lazy(() => import('@/pages/NotFound'));
const AccessDenied = lazy(() => import('@/pages/AccessDenied'));

// Lazy load articles
const SnowballMethodArticle = lazy(() => import('@/components/help/articles/SnowballMethod'));
const AvalancheMethodArticle = lazy(() => import('@/components/help/articles/AvalancheMethod'));
const AccountSetupArticle = lazy(() => import('@/components/help/articles/account-setup'));
const UnderstandingDashboardArticle = lazy(() => import('@/components/help/articles/understanding-dashboard'));
const AddingFirstDebtArticle = lazy(() => import('@/components/help/articles/adding-first-debt'));

// Admin pages
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminContent = lazy(() => import('@/pages/admin/AdminContent'));
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));
const SecurityEvents = lazy(() => import('@/pages/admin/SecurityEvents'));

// Placeholder components for pages that don't exist yet
const VerifyEmail = lazy(() => Promise.resolve({ default: () => <NotFound /> }));
const ResetPassword = lazy(() => Promise.resolve({ default: () => <NotFound /> }));
const ForgotPassword = lazy(() => Promise.resolve({ default: () => <NotFound /> }));
const SavingsPlanner = lazy(() => Promise.resolve({ default: () => <NotFound /> }));
const AIInsights = lazy(() => Promise.resolve({ default: () => <NotFound /> }));
const ArticleDetail = lazy(() => Promise.resolve({ default: () => <NotFound /> }));
const AccountSettings = lazy(() => Promise.resolve({ default: () => <NotFound /> }));
const PreferencesSettings = lazy(() => Promise.resolve({ default: () => <NotFound /> }));
const SecuritySettings = lazy(() => Promise.resolve({ default: () => <NotFound /> }));
const BillingSettings = lazy(() => Promise.resolve({ default: () => <NotFound /> }));
const NotificationSettings = lazy(() => Promise.resolve({ default: () => <NotFound /> }));

// Preload critical components for better user experience
preloadComponents([
  () => import("@/pages/Landing"),
  () => import("@/pages/SignIn"),
  () => import("@/pages/SignUp")
]);

// Helper function to get page class based on path
const getPageClass = (pathname: string): string => {
  if (pathname === '/') return 'landing-page';
  if (pathname === '/signin' || pathname === '/signup') return 'auth-page';
  if (pathname.startsWith('/dashboard')) return 'dashboard-page';
  return '';
};

// Main routes configuration
const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* Public routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="/job-application" element={<JobApplication />} />
        <Route path="/support" element={<Support />} />
        
        {/* Protected routes - require authentication */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requireSubscription={false}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/debt-planner" 
          element={
            <ProtectedRoute requireSubscription={false}>
              <DebtPlanner />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/savings-planner" 
          element={
            <ProtectedRoute requireSubscription={false}>
              <SavingsPlanner />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/insights" 
          element={
            <ProtectedRoute requireSubscription={true}>
              <AIInsights />
            </ProtectedRoute>
          } 
        />
        
        {/* Settings routes */}
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute requireSubscription={false}>
              <Settings />
            </ProtectedRoute>
          } 
        >
          <Route index element={<Navigate to="/settings/account" replace />} />
          <Route path="account" element={<AccountSettings />} />
          <Route path="preferences" element={<PreferencesSettings />} />
          <Route path="security" element={<SecuritySettings />} />
          <Route path="billing" element={<BillingSettings />} />
          <Route path="notifications" element={<NotificationSettings />} />
        </Route>
        
        {/* Help & Article routes */}
        <Route path="/help" element={<Help />} />
        <Route path="/articles/:slug" element={<ArticleDetail />} />
        
        {/* Admin routes - require admin role */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireSubscription={false}>
              <AdminAuthCheck>
                <AdminLayout />
              </AdminAuthCheck>
            </ProtectedRoute>
          } 
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="security" element={<SecurityEvents />} />
        </Route>
        
        {/* Fallback 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

// New AppNavbar component
function AppNavbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { isMobile } = useDeviceContext();

  const handleSignIn = () => {
    navigate("/signin", { state: { returnTo: window.location.pathname, animation: "slide-in" } });
  };

  const handleSignUp = () => {
    navigate("/signup", { state: { animation: "slide-in" } });
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Navbar
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      onNavigate={scrollToSection}
      isAuthenticated={isAuthenticated}
      userName={user?.name}
      onDashboardClick={handleDashboardClick}
      isMobile={isMobile}
    />
  );
}

// This component will be used inside the AuthProvider
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isInitialized, isAuthenticated, user } = useAuth();
  const { isMobile } = useDeviceContext();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Initialize database tables when the app starts
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log('Checking database tables...');
        
        // Check if the SQL execute function exists
        const sqlFunctionCheck = await checkExecuteSqlFunction();
        if (!sqlFunctionCheck.exists) {
          console.warn('SQL execution function is not available:', sqlFunctionCheck.message);
          // Continue even without SQL execution capability
        }
        
        // Try to access tables (this will validate if they exist)
        const debtsResult = await createDebtTable();
        if (!debtsResult.success) {
          console.log('Note about debts table:', debtsResult.error);
        }
        
        const bankAccountsResult = await createBankAccountsTable();
        if (!bankAccountsResult.success) {
          console.log('Note about bank accounts table:', bankAccountsResult.error);
        }
        
        const transactionHistoryResult = await createTransactionHistoryTable();
        if (!transactionHistoryResult.success) {
          console.log('Note about transaction history table:', transactionHistoryResult.error);
        }
        
        console.log('Database initialization completed');
      } catch (err) {
        console.error('Error during database initialization:', err);
        // Continue with the application regardless of database initialization
      }
    };
    
    // Only run this if the user is authenticated
    if (isAuthenticated) {
      initializeDatabase();
    }
  }, [isAuthenticated]);

  // Show onboarding tour for new users
  const shouldShowTour = !localStorage.getItem("onboardingCompleted");
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';
  const isDashboardPage = location.pathname.startsWith('/dashboard');

  return (
    <Layout>
      <SkipToContent />
      {shouldShowTour && <OnboardingTour />}
      {!isAuthPage && !isDashboardPage && <AppNavbar />}
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <LoadingSpinner />
          </div>
        }
      >
        <main id="main-content">
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </main>
      </Suspense>
      <Toaster />
    </Layout>
  );
}

function App() {
  // Initialize performance monitoring
  usePerformanceMonitoring();
  
  // Initialize error tracking
  useErrorTracking();

  // For development only - get the debug component if available
  useEffect(() => {
    if (IS_DEV && window.__ConnectionStatus) {
      ConnectionStatus = window.__ConnectionStatus;
    }
  }, []);

  return (
    <ErrorBoundary>
      <DeviceProvider>
        <AuthProvider>
          <SecurityProvider>
            <AppContent />
          </SecurityProvider>
        </AuthProvider>
      </DeviceProvider>
      {/* Add the debug component only in development */}
      {IS_DEV && ConnectionStatus && <ConnectionStatus />}
    </ErrorBoundary>
  );
}

export default App;
