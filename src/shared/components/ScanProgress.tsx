import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Loader2, Shield, Brain, Zap } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';

interface ScanProgressProps {
  isRunning: boolean;
  progress: number;
  currentStep: 'ocr' | 'analysis' | 'complete' | 'error';
  errorMessage?: string;
  onRetry?: () => void;
}

const ScanProgress: React.FC<ScanProgressProps> = ({
  isRunning,
  progress,
  currentStep,
  errorMessage,
  onRetry
}) => {
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    if (isRunning) {
      setShowProgress(true);
    }
  }, [isRunning]);

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'ocr':
        return <Shield className="w-6 h-6 text-blue-500" />;
      case 'analysis':
        return <Brain className="w-6 h-6 text-purple-500" />;
      case 'complete':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      default:
        return <Zap className="w-6 h-6 text-primary" />;
    }
  };

  const getStepLabel = (step: string) => {
    switch (step) {
      case 'ocr':
        return 'Extracting Text';
      case 'analysis':
        return 'Analyzing Ingredients';
      case 'complete':
        return 'Analysis Complete';
      case 'error':
        return 'Analysis Failed';
      default:
        return 'Processing';
    }
  };

  const getStepDescription = (step: string) => {
    switch (step) {
      case 'ocr':
        return 'Using AI to read and extract ingredient text from your image...';
      case 'analysis':
        return 'Evaluating health impact and flagging potential concerns...';
      case 'complete':
        return 'Your ingredient analysis is ready!';
      case 'error':
        return errorMessage || 'Something went wrong. Please try again.';
      default:
        return 'Processing your request...';
    }
  };

  if (!showProgress && !isRunning) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 p-6 card-elevated">
        <div className="text-center">
          {/* Animated Icon */}
          <div className="mb-6">
            {currentStep === 'error' ? (
              <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center error-shake">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
            ) : currentStep === 'complete' ? (
              <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center success-checkmark">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center scan-loading">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            )}
          </div>

          {/* Step Header */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {getStepIcon(currentStep)}
            <h3 className="text-xl font-semibold">
              {getStepLabel(currentStep)}
            </h3>
          </div>

          {/* Step Description */}
          <p className="text-muted-foreground mb-6">
            {getStepDescription(currentStep)}
          </p>

          {/* Progress Bar */}
          {isRunning && currentStep !== 'complete' && currentStep !== 'error' && (
            <div className="mb-6">
              <div className="progress-bar h-3 w-full">
                <div 
                  className="progress-fill h-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {currentStep === 'error' && onRetry && (
            <div className="flex gap-3 justify-center">
              <button
                onClick={onRetry}
                className="btn-scan px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => setShowProgress(false)}
                className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {currentStep === 'complete' && (
            <button
              onClick={() => setShowProgress(false)}
              className="btn-scan px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              View Results
            </button>
          )}

          {/* Loading Animation for Running State */}
          {isRunning && (
            <div className="mt-4">
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ScanProgress;
