import { Logo } from "@/components/Logo";

interface LoadingSpinnerProps {
  className?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ className = '', fullScreen = false }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#1E1E1E] to-[#121212]">
        <div className="mb-8">
          <Logo size="lg" showText={true} />
        </div>
        <div className="w-16 h-16 flex items-center justify-center">
          <div className="text-[#88B04B] text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-[#88B04B] text-sm">Loading...</div>
    </div>
  );
}