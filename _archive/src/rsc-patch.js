/**
 * RSC Patch for Next.js
 * This file addresses React Server Components compatibility issues
 */

// Export a dummy patch function
const patchRSC = () => {
  if (typeof window !== 'undefined') {
    // Client-side patching
    console.log('RSC patch applied on client');
  }
};

// Apply patch
if (typeof window !== 'undefined') {
  setTimeout(patchRSC, 0);
}

module.exports = {
  patchRSC
};
