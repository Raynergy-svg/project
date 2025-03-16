// This is an empty module to replace React Router imports in Next.js
// In Next.js, we use the built-in routing system instead of react-router-dom

import { useRouter } from "next/navigation";
import NextLink from "next/link";
import React, { createContext, useContext, useState, useEffect } from "react";

// Simple location context to avoid circular dependencies
const LocationContext = createContext({
  pathname: typeof window !== "undefined" ? window.location.pathname : "/",
});

// Simple implementation of BrowserRouter
export const BrowserRouter = ({ children }) => {
  const [pathname, setPathname] = useState(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );

  // Update pathname when location changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleRouteChange = () => {
        setPathname(window.location.pathname);
      };

      window.addEventListener("popstate", handleRouteChange);

      return () => {
        window.removeEventListener("popstate", handleRouteChange);
      };
    }
  }, []);

  return (
    <LocationContext.Provider value={{ pathname }}>
      {children}
    </LocationContext.Provider>
  );
};

// Simple Routes implementation
export const Routes = ({ children }) => {
  return <>{children}</>;
};

// Simple Route implementation
export const Route = ({ path, element }) => {
  const { pathname } = useContext(LocationContext);

  // Basic path matching
  if (
    path === "*" ||
    pathname === path ||
    (path === "/" && (pathname === "" || pathname === "/"))
  ) {
    return element;
  }

  return null;
};

// Link component that uses Next.js Link
export const Link = ({ to, children, ...props }) => {
  return (
    <NextLink href={to} {...props}>
      {children}
    </NextLink>
  );
};

// Navigate component that performs navigation
export const Navigate = ({ to, replace }) => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    }
  }, [to, replace, router]);

  return null;
};

// Simple implementation of useNavigate
export const useNavigate = () => {
  const router = useRouter();

  return React.useCallback(
    (to, options) => {
      if (typeof window !== "undefined") {
        if (options?.replace) {
          router.replace(to);
        } else {
          router.push(to);
        }
      }
    },
    [router]
  );
};

// Simple implementation of useLocation
export const useLocation = () => {
  const { pathname } = useContext(LocationContext);

  return {
    pathname,
    search: typeof window !== "undefined" ? window.location.search : "",
    hash: typeof window !== "undefined" ? window.location.hash : "",
    state: {},
  };
};

// Other hooks with minimal implementations
export const useParams = () => ({});
export const useSearchParams = () => [new URLSearchParams(), () => {}];
export const Outlet = ({ children }) => children;

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
};
