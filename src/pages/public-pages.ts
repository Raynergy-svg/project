/**
 * Public Pages Integration
 * 
 * This file helps map between React Router paths and Next.js paths
 * during the migration from Vite to Next.js. It provides a centralized
 * place for all public page routes and their Next.js equivalents.
 */

// Page path mapping between React Router and Next.js
export const publicPageRoutes = {
  // Landing and Index Pages
  '/': '/',
  '/landing': '/',
  
  // Information Pages
  '/about': '/about',
  '/terms': '/terms',
  '/privacy': '/privacy',
  '/help': '/help',
  '/support': '/help',
  
  // Content Pages
  '/blog': '/blog',
  '/blog/:slug': '/blog/[slug]',
  '/press': '/press',
  '/status': '/status',
  
  // Career Pages
  '/careers': '/careers',
  '/careers/:jobId': '/careers/[jobId]',
  
  // Error Pages
  '/404': '/404',
  '/not-found': '/404',
  
  // Auth Pages (These will be handled separately but included for completeness)
  '/signin': '/signin',
  '/signup': '/signup',
  '/forgot-password': '/forgot-password',
  '/reset-password': '/reset-password',
}

// List of page titles for SEO and navigation purposes
export const pageMetadata = {
  index: {
    title: 'Smart Debt Flow - Manage Your Debt Smarter',
    description: 'Smart Debt Flow helps you manage your debt, create payment plans, and track your progress toward financial freedom.'
  },
  about: {
    title: 'About Us - Smart Debt Flow',
    description: 'Learn about Smart Debt Flow\'s mission, values, and the team behind our debt management platform.'
  },
  terms: {
    title: 'Terms of Service - Smart Debt Flow',
    description: 'Read our terms of service to understand the agreement between you and Smart Debt Flow.'
  },
  privacy: {
    title: 'Privacy Policy - Smart Debt Flow',
    description: 'Learn about how Smart Debt Flow collects, uses, and protects your personal information.'
  },
  help: {
    title: 'Help Center - Smart Debt Flow',
    description: 'Get help with Smart Debt Flow. Find answers to frequently asked questions, tutorials, and support resources.'
  },
  blog: {
    title: 'Blog - Smart Debt Flow',
    description: 'Read articles on debt management, financial tips, success stories, and more from the Smart Debt Flow team.'
  },
  careers: {
    title: 'Careers - Smart Debt Flow',
    description: 'Join our team and help people achieve financial freedom. Explore open positions at Smart Debt Flow.'
  },
  notFound: {
    title: 'Page Not Found - Smart Debt Flow',
    description: 'The page you\'re looking for doesn\'t exist or has been moved.'
  }
}

/**
 * Helper function to convert a react-router path to its Next.js equivalent
 */
export const toNextPath = (reactRouterPath: string): string => {
  // Handle dynamic routes with parameters
  if (reactRouterPath.includes(':')) {
    // For known dynamic routes, use the direct mapping
    const matchedDynamicRoute = Object.entries(publicPageRoutes).find(
      ([key]) => key.includes(':') && reactRouterPath.startsWith(key.split(':')[0])
    );
    
    if (matchedDynamicRoute) {
      const [routerPath, nextPath] = matchedDynamicRoute;
      // Extract the parameter value and replace in Next.js path
      const paramName = routerPath.split(':')[1];
      const paramValue = reactRouterPath.split('/').pop();
      return nextPath.replace(`[${paramName}]`, paramValue || '');
    }
  }
  
  // For static routes, use direct mapping
  return publicPageRoutes[reactRouterPath as keyof typeof publicPageRoutes] || reactRouterPath;
}

/**
 * Helper function to convert a Next.js path to its react-router equivalent
 */
export const toReactRouterPath = (nextPath: string): string => {
  // Handle dynamic routes
  if (nextPath.includes('[') && nextPath.includes(']')) {
    // Extract the parameter pattern and value
    const paramPattern = nextPath.match(/\[(.*?)\]/)?.[0] || '';
    const paramName = paramPattern.replace('[', '').replace(']', '');
    
    // Find the corresponding React Router path
    const matchedRoute = Object.entries(publicPageRoutes).find(
      ([_, path]) => path === nextPath
    );
    
    if (matchedRoute) {
      const [routerPath] = matchedRoute;
      return routerPath;
    }
  }
  
  // For static routes, find the key by value
  const match = Object.entries(publicPageRoutes).find(
    ([_, path]) => path === nextPath
  );
  
  return match ? match[0] : nextPath;
}

// Export default for convenience
export default { 
  publicPageRoutes, 
  pageMetadata, 
  toNextPath, 
  toReactRouterPath 
}; 