import { Suspense, useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { DeviceProvider } from "@/contexts/DeviceContext";
import { useDeviceContext } from "@/contexts/DeviceContext";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";
import { useErrorTracking } from "@/hooks/useErrorTracking";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/layout/Navbar";
import { Layout } from "@/components/layout/Layout";
import { lazyLoad, preloadComponents } from "@/utils/lazyLoad";
import { createDebtTable, checkExecuteSqlFunction } from "@/lib/supabase/createDebtTable";
import { createBankAccountsTable } from "@/lib/supabase/createBankAccountsTable";
import { createTransactionHistoryTable } from "@/lib/supabase/createTransactionHistoryTable";
import { supabase } from "@/utils/supabase/client";
import SkipToContent from "@/components/SkipToContent";

// Import debug components only in development mode
const isDevelopment = import.meta.env.DEV;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let ConnectionStatus: React.ComponentType<any> | null = null;

// Replace dynamic import with conditional import
if (isDevelopment) {
  // Only attempt to load debug components in development
  import('@/components/debug/ConnectionStatus').then(module => {
    ConnectionStatus = module.ConnectionStatus;
  }).catch(error => {
    console.warn('Debug component could not be loaded:', error);
  });
}

// Lazy load routes with enhanced error handling and loading
const Landing = lazyLoad(() => import("@/pages/Landing"));
const Dashboard = lazyLoad(() => import("@/pages/Dashboard"));
const DebtPlanner = lazyLoad(() => import("@/pages/DebtPlanner"));
const Settings = lazyLoad(() => import("@/pages/Settings"));
const About = lazyLoad(() => import("@/pages/About"));
const Privacy = lazyLoad(() => import("@/pages/Privacy"));
const Terms = lazyLoad(() => import("@/pages/Terms"));
const Support = lazyLoad(() => import("@/pages/Support"));
const Blog = lazyLoad(() => import("@/pages/Blog"));
const Press = lazyLoad(() => import("@/pages/Press"));
const Help = lazyLoad(() => import("@/pages/Help"));
const Docs = lazyLoad(() => import("@/pages/Docs"));
const Api = lazyLoad(() => import("@/pages/Api"));
const Status = lazyLoad(() => import("@/pages/Status"));
const Careers = lazyLoad(() => import("@/pages/Careers"));
const JobApplication = lazyLoad(() => import("@/pages/JobApplication"));
const Compliance = lazyLoad(() => import("@/pages/Compliance"));
const AdminTools = lazyLoad(() => import("@/pages/AdminTools"));
const SignUp = lazyLoad(() => 
  import("@/pages/SignUp").catch(error => {
    console.error("Error loading SignUp component:", error);
    return { default: () => <div>Error loading signup page</div> };
  }),
  { retry: 3, retryDelay: 1000 }
);
const SignIn = lazyLoad(() => import("@/pages/SignIn"));
const AuthDemo = lazyLoad(() => import("@/pages/AuthDemo"));
const PaymentSuccess = lazyLoad(() => import("@/pages/PaymentSuccess"));

// Lazy load articles
const SnowballMethodArticle = lazyLoad(() => import('@/components/help/articles/SnowballMethod'));
const AvalancheMethodArticle = lazyLoad(() => import('@/components/help/articles/AvalancheMethod'));
const AccountSetupArticle = lazyLoad(() => import('@/components/help/articles/account-setup'));
const UnderstandingDashboardArticle = lazyLoad(() => import('@/components/help/articles/understanding-dashboard'));
const AddingFirstDebtArticle = lazyLoad(() => import('@/components/help/articles/adding-first-debt'));

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

function AppRoutes() {
  const location = useLocation();
  const pageClass = getPageClass(location.pathname);
  
  // Apply page-specific class to main content
  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.className = pageClass;
    }
  }, [location.pathname, pageClass]);
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/about" element={<About />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/support" element={<Support />} />
      <Route path="/security" element={<Navigate to="/support" replace />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/press" element={<Press />} />
      <Route path="/help" element={<Help />} />
      <Route path="/help/articles/snowball-method" element={<SnowballMethodArticle />} />
      <Route path="/help/articles/avalanche-method" element={<AvalancheMethodArticle />} />
      <Route path="/help/articles/account-setup" element={<AccountSetupArticle />} />
      <Route path="/help/articles/dashboard-overview" element={<UnderstandingDashboardArticle />} />
      <Route path="/help/articles/adding-debts" element={<AddingFirstDebtArticle />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/api" element={<Api />} />
      <Route path="/status" element={<Status />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/apply" element={<JobApplication />} />
      <Route path="/compliance" element={<Compliance />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/auth-demo" element={<AuthDemo />} />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminTools />
        </ProtectedRoute>
      } />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/debt-planner" element={<DebtPlanner />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

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
        console.log('Initializing database tables...');
        
        // Check if the SQL execute function exists
        const sqlFunctionCheck = await checkExecuteSqlFunction();
        if (!sqlFunctionCheck.exists) {
          console.warn('SQL execution function is not available:', sqlFunctionCheck.message);
          return;
        }
        
        // Create the debts table if it doesn't exist
        const debtsResult = await createDebtTable();
        if (debtsResult.success) {
          console.log('Debts table initialization successful');
        } else {
          console.error('Failed to initialize debts table:', debtsResult.error);
        }
        
        // Create the bank_accounts table if it doesn't exist
        const bankAccountsResult = await createBankAccountsTable();
        if (bankAccountsResult.success) {
          console.log('Bank accounts table initialization successful');
        } else {
          console.error('Failed to initialize bank_accounts table:', bankAccountsResult.error);
        }
        
        // Create the payment_transactions table if it doesn't exist
        const transactionHistoryResult = await createTransactionHistoryTable();
        if (transactionHistoryResult.success) {
          console.log('Payment transactions table initialization successful');
        } else {
          console.error('Failed to initialize payment_transactions table:', transactionHistoryResult.error);
        }
        
      } catch (err) {
        console.error('Error initializing database:', err);
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

  return (
    <ErrorBoundary>
      <DeviceProvider>
        <AuthProvider>
          <SecurityProvider>
            <AppContent />
          </SecurityProvider>
        </AuthProvider>
      </DeviceProvider>
      {/* Add the debug component */}
      {isDevelopment && ConnectionStatus && <ConnectionStatus />}
    </ErrorBoundary>
  );
}

export default App;
