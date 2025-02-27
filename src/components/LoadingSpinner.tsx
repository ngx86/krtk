import React from 'react';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  fullScreen?: boolean;
}

export function LoadingSpinner({ 
  className = "", 
  fullScreen = true,
  ...props 
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <div 
            className={`animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto ${className}`}
            {...props}
          ></div>
        </div>
      </div>
    );
  }
  
  // Just the spinner without the full screen container
  return (
    <div 
      className={`animate-spin rounded-full border-b-2 border-primary ${className}`}
      {...props}
    ></div>
  );
} 