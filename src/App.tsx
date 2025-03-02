import { Suspense, lazy, useEffect } from "react";
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
import PaymentSuccess from './pages/PaymentSuccess';
import SnowballMethodArticle from './components/help/articles/SnowballMethod';
import AvalancheMethodArticle from './components/help/articles/AvalancheMethod';
import AccountSetupArticle from './components/help/articles/account-setup';
import UnderstandingDashboardArticle from './components/help/articles/understanding-dashboard';
import AddingFirstDebtArticle from './components/help/articles/adding-first-debt';
import { createDebtTable, checkExecuteSqlFunction } from "@/lib/supabase/createDebtTable";
import { createBankAccountsTable } from "@/lib/supabase/createBankAccountsTable";
import { supabase } from "@/utils/supabase/client";

// Lazy load routes with prefetching
const Landing = lazy(() => import("@/pages/Landing"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const DebtPlanner = lazy(() => import("@/pages/DebtPlanner"));
const Settings = lazy(() => import("@/pages/Settings"));
const About = lazy(() => import("@/pages/About"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const Support = lazy(() => import("@/pages/Support"));
const Blog = lazy(() => import("@/pages/Blog"));
const Press = lazy(() => import("@/pages/Press"));
const Help = lazy(() => import("@/pages/Help"));
const Docs = lazy(() => import("@/pages/Docs"));
const Api = lazy(() => import("@/pages/Api"));
const Status = lazy(() => import("@/pages/Status"));
const Careers = lazy(() => import("@/pages/Careers"));
const JobApplication = lazy(() => import("@/pages/JobApplication"));
const Compliance = lazy(() => import("@/pages/Compliance"));
const SignUp = lazy(() => 
  import("@/pages/SignUp").catch(error => {
    console.error("Error loading SignUp component:", error);
    return { default: () => <div>Error loading signup page</div> };
  })
);
const SignIn = lazy(() => import("@/pages/SignIn"));
const AuthDemo = lazy(() => import("@/pages/AuthDemo"));

function AppRoutes() {
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
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { isMobile } = useDeviceContext();

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
      {shouldShowTour && <OnboardingTour />}
      {!isAuthPage && !isDashboardPage && <AppNavbar />}
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <LoadingSpinner />
          </div>
        }
      >
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
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
      <SecurityProvider>
        <DeviceProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </DeviceProvider>
      </SecurityProvider>
    </ErrorBoundary>
  );
}

export default App;
