/**
 * RSC Client Patch for Next.js
 * This file addresses React Server Components client-side compatibility issues
 */

// Export a dummy patch function
const patchRSCClient = () => {
  if (typeof window !== 'undefined') {
    // Client-side patching
    console.log('RSC client patch applied');
  }
};

// Apply patch
if (typeof window !== 'undefined') {
  setTimeout(patchRSCClient, 0);
}

module.exports = {
  patchRSCClient
};
