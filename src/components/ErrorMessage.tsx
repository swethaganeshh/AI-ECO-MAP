import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="eco-card border-red-200 bg-red-50">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-1">
            Something went wrong
          </h3>
          <p className="text-sm text-red-700">{message}</p>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};