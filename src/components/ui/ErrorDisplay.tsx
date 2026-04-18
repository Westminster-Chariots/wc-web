"use client";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./button";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorDisplay({
  title = "Something went wrong",
  message = "We encountered an error. Please try again.",
  onRetry,
}: ErrorDisplayProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-display font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground font-body mb-6">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: any;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md">
        <Icon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-display font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground font-body mb-6">{message}</p>
        {action}
      </div>
    </div>
  );
}
