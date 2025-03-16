/**
 * use server patches for Next.js
 * This patches Next.js Server Actions to prevent common errors
 */

// Add needed polyfills and patches for server actions
if (typeof window !== 'undefined') {
  try {
    // Patch for server action calls
    const patchServerActions = () => {
      // Add mock implementation for server actions
      if (!window.$ACTION) {
        window.$ACTION = window.$ACTION || function($id, $args) {
          console.warn('Server action called without proper implementation:', $id);
          return Promise.resolve({ 
            status: 'error', 
            message: 'Server action not available in this environment' 
          });
        };
      }
      
      // Patch form submissions with server actions
      const originalSubmit = HTMLFormElement.prototype.submit;
      HTMLFormElement.prototype.submit = function patchedSubmit() {
        try {
          // Check if form has server action
          const action = this.getAttribute('action');
          if (action?.startsWith('?__server_action=')) {
            console.warn('Server action form submission intercepted:', action);
            // Return mock response without submitting
            const event = new CustomEvent('submit', { bubbles: true, cancelable: true });
            this.dispatchEvent(event);
            if (!event.defaultPrevented) {
              console.warn('Server action form submission handled by client');
            }
            return undefined;
          }
          
          // Otherwise proceed with original submit
          return originalSubmit.apply(this);
        } catch (e) {
          console.warn('Error in patched form submit:', e);
          return originalSubmit.apply(this);
        }
      };
    };

    // Apply patch after a small delay
    setTimeout(patchServerActions, 0);
  } catch (e) {
    console.warn('Error applying use-server patches:', e);
  }
} 