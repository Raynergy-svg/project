import { Logo } from "@/components/Logo";

interface LoadingSpinnerProps {
  className?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ className = '', fullScreen = false }: LoadingSpinnerProps) {
  const spinnerClasses = `animate-spin rounded-full border-2 border-[#88B04B]/20 border-t-[#88B04B] ${className}`;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#1E1E1E] to-[#121212]">
        <div className="mb-8">
          <Logo size="lg" showText={true} />
        </div>
        <div className={`w-12 h-12 ${spinnerClasses}`} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`w-6 h-6 ${spinnerClasses}`} />
    </div>
  );
}