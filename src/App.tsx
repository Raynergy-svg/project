import { Suspense, lazy } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { DeviceProvider, useDeviceContext } from "@/components/DeviceProvider";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";
import { useErrorTracking } from "@/hooks/useErrorTracking";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/layout/Navbar";
import { Layout } from "@/components/layout/Layout";

// Lazy load routes with prefetching
const Landing = lazy(() => import("@/pages/Landing"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const DebtPlanner = lazy(() => import("@/pages/DebtPlanner"));
const Settings = lazy(() => import("@/pages/Settings"));
const SignUp = lazy(() => 
  import("@/pages/SignUp").catch(error => {
    console.error("Error loading SignUp component:", error);
    return { default: () => <div>Error loading signup page</div> };
  })
);
const SignIn = lazy(() => import("@/pages/SignIn"));

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<SignIn />} />
      <Route
        path="/signup"
        element={
          <ErrorBoundary>
            <SignUp />
          </ErrorBoundary>
        }
      />
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
  const { performanceLevel, isMobile } = useDeviceContext();

  const handleSignIn = () => {
    navigate("/signin", { state: { returnTo: window.location.pathname, animation: "slide-in" } });
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
      onNavigate={scrollToSection}
      isAuthenticated={isAuthenticated}
      userName={user?.name}
      onDashboardClick={handleDashboardClick}
    />
  );
}

function App() {
  // Initialize monitoring hooks
  usePerformanceMonitoring();
  useErrorTracking();
  const location = useLocation();

  // Show onboarding tour for new users
  const shouldShowTour = !localStorage.getItem("onboardingCompleted");
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';

  return (
    <ErrorBoundary>
      <SecurityProvider>
        <DeviceProvider>
          <AuthProvider>
            <Layout>
              {shouldShowTour && <OnboardingTour />}
              {!isAuthPage && <AppNavbar />}
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-[50vh]">
                    <LoadingSpinner />
                  </div>
                }
              >
                <AppRoutes />
              </Suspense>
              <Toaster />
            </Layout>
          </AuthProvider>
        </DeviceProvider>
      </SecurityProvider>
    </ErrorBoundary>
  );
}

export default App;
