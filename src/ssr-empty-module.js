/**
 * This is a specialized empty module for React Router that works exclusively
 * for server-side rendering, completely bypassing any routing functionality.
 * It provides inert stubs for all React Router components and hooks.
 */

// Import React - needed for JSX
import React from "react";

// Utility function to log attempts to use React Router on the server
const logServerSideUsage = (component, props = {}) => {
  if (typeof window === "undefined") {
    console.warn(
      `[SSR] Attempt to use ${component} from react-router-dom during server-side rendering`,
      props
    );
  }
};

// Safe stub components that do nothing during SSR
export const BrowserRouter = ({ children }) => {
  logServerSideUsage("BrowserRouter");
  return children || null;
};

export const Routes = ({ children }) => {
  logServerSideUsage("Routes");
  return children || null;
};

export const Route = (props) => {
  logServerSideUsage("Route", props);
  return null;
};

export const Link = ({ to, children, ...props }) => {
  logServerSideUsage("Link", { to });
  // Return a simple <a> tag with href="/" during SSR
  return <a href="/">{children}</a>;
};

export const Navigate = ({ to, ...props }) => {
  // Log the attempt with the actual value of 'to'
  logServerSideUsage("Navigate", { to, ...props });

  // The component just returns null during SSR, no navigation happens
  return null;
};

// Safe stub hooks that return dummy values during SSR
export const useNavigate = () => {
  logServerSideUsage("useNavigate");
  // Return a function that logs but does nothing
  return (to) => {
    logServerSideUsage("useNavigate.navigate", { to });
  };
};

export const useLocation = () => {
  logServerSideUsage("useLocation");
  return {
    pathname: "/",
    search: "",
    hash: "",
    state: null,
  };
};

export const useParams = () => {
  logServerSideUsage("useParams");
  return {};
};

export const useSearchParams = () => {
  logServerSideUsage("useSearchParams");
  const params = new URLSearchParams();
  const setParams = () => {
    logServerSideUsage("useSearchParams.setSearchParams");
  };
  return [params, setParams];
};

export const Outlet = ({ children }) => {
  logServerSideUsage("Outlet");
  return children || null;
};

// Add any other React Router exports with safe dummy implementations
export const useRouteMatch = () => {
  logServerSideUsage("useRouteMatch");
  return { path: "/", url: "/" };
};

export const useHistory = () => {
  logServerSideUsage("useHistory");
  return {
    push: (to) => {
      logServerSideUsage("useHistory.push", { to });
    },
    replace: (to) => {
      logServerSideUsage("useHistory.replace", { to });
    },
    go: (n) => {
      logServerSideUsage("useHistory.go", { n });
    },
    goBack: () => {
      logServerSideUsage("useHistory.goBack");
    },
    goForward: () => {
      logServerSideUsage("useHistory.goForward");
    },
  };
};

// Default export for components that might use default import
export default {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  Outlet,
  useRouteMatch,
  useHistory,
};
