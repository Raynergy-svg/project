import { useToast as useToastOriginal } from '@/components/ui/use-toast';
import { Toast } from '@/components/ui/toast';

export type ToastType = 'default' | 'success' | 'info' | 'warning' | 'error';

interface UseToastOptions {
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  action?: React.ReactNode;
}

/**
 * Custom hook for managing toast notifications
 * 
 * This hook extends the base toast hook to provide additional functionality
 * like typed toasts (success, error, etc.) and consistent styling.
 */
export function useToast() {
  const { toast } = useToastOriginal();

  const showToast = (options: UseToastOptions) => {
    const { title, description, type = 'default', duration = 5000, action } = options;

    // Apply appropriate styling based on type
    let toastVariant: 'default' | 'destructive' = 'default';
    let toastClassName = '';

    switch (type) {
      case 'success':
        toastClassName = 'toast-success';
        break;
      case 'error':
        toastVariant = 'destructive';
        break;
      case 'warning':
        toastClassName = 'toast-warning';
        break;
      case 'info':
        toastClassName = 'toast-info';
        break;
      default:
        break;
    }

    return toast({
      title,
      description,
      variant: toastVariant,
      duration,
      action,
      className: toastClassName,
    });
  };

  // Convenience methods for different toast types
  const success = (options: Omit<UseToastOptions, 'type'>) => 
    showToast({ ...options, type: 'success' });
  
  const error = (options: Omit<UseToastOptions, 'type'>) => 
    showToast({ ...options, type: 'error' });
  
  const warning = (options: Omit<UseToastOptions, 'type'>) => 
    showToast({ ...options, type: 'warning' });
  
  const info = (options: Omit<UseToastOptions, 'type'>) => 
    showToast({ ...options, type: 'info' });

  return {
    toast: showToast,
    success,
    error,
    warning,
    info,
  };
}

export default useToast; 