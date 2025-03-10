// This is an empty module to replace React Router imports in Next.js
// In Next.js, we use the built-in routing system instead of react-router-dom

import { useRouter as useNextRouter } from "next/router";
import NextLink from "next/link";

// Show a warning in development mode when using react-router
const warnAboutReactRouter = (component) => {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `You're using ${component} from react-router-dom which is not compatible with Next.js. ` +
        `Please use Next.js routing instead. See: https://nextjs.org/docs/pages/building-your-application/routing`
    );
  }
};

// Add empty exports for commonly imported hooks and components from react-router-dom
export const BrowserRouter = ({ children }) => {
  warnAboutReactRouter("BrowserRouter");
  return children;
};

export const Routes = ({ children }) => {
  warnAboutReactRouter("Routes");
  return children;
};

export const Route = () => {
  warnAboutReactRouter("Route");
  return null;
};

export const Link = ({ to, children, ...props }) => {
  warnAboutReactRouter("Link");
  // Return a Next.js Link component instead
  return (
    <NextLink href={to} {...props}>
      {children}
    </NextLink>
  );
};

export const Navigate = ({ to }) => {
  warnAboutReactRouter("Navigate");
  // Use a client-side effect to navigate
  if (typeof window !== "undefined") {
    const router = useNextRouter();
    router.push(to);
  }
  return null;
};

export const useNavigate = () => {
  warnAboutReactRouter("useNavigate");
  const router = useNextRouter();
  return (to) => router.push(to);
};

export const useLocation = () => {
  warnAboutReactRouter("useLocation");
  const router = useNextRouter();

  return {
    pathname: router.pathname,
    search: router.asPath.includes("?")
      ? router.asPath.substring(router.asPath.indexOf("?"))
      : "",
    hash: router.asPath.includes("#")
      ? router.asPath.substring(router.asPath.indexOf("#"))
      : "",
    state: {},
  };
};

export const useParams = () => {
  warnAboutReactRouter("useParams");
  const router = useNextRouter();
  return router.query || {};
};

export const useSearchParams = () => {
  warnAboutReactRouter("useSearchParams");
  const router = useNextRouter();

  // Create a URLSearchParams object from the query
  const searchParams = new URLSearchParams();
  if (router.query) {
    Object.entries(router.query).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, v));
        } else {
          searchParams.append(key, value);
        }
      }
    });
  }

  // Return a function to update search params that uses Next.js router
  const setSearchParams = (newParams) => {
    const updatedQuery = {};

    // Convert the newParams to a query object
    if (newParams instanceof URLSearchParams) {
      for (const [key, value] of newParams.entries()) {
        updatedQuery[key] = value;
      }
    } else if (typeof newParams === "function") {
      const updatedSearchParams = newParams(searchParams);
      for (const [key, value] of updatedSearchParams.entries()) {
        updatedQuery[key] = value;
      }
    } else {
      Object.assign(updatedQuery, newParams);
    }

    // Update the URL with the new query parameters
    router.push({
      pathname: router.pathname,
      query: updatedQuery,
    });
  };

  return [searchParams, setSearchParams];
};

export const Outlet = ({ children }) => {
  warnAboutReactRouter("Outlet");
  return children;
};

// Add default export for components that might use default import
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
