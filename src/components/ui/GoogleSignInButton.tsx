"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError?: () => void;
  text?: "signin_with" | "signup_with" | "continue_with";
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function GoogleSignInButton({ 
  onSuccess, 
  onError,
  text = "signin_with" 
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      console.error("Google Client ID not configured");
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    
    if (existingScript) {
      initializeGoogleButton();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      initializeGoogleButton();
    };

    script.onerror = () => {
      console.error("Failed to load Google Sign-In script");
      setHasError(true);
      setIsLoading(false);
    };

    return () => {
      if (!existingScript && script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, [clientId]);

  const initializeGoogleButton = () => {
    if (window.google && buttonRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response.credential) {
              onSuccess(response.credential);
            } else {
              onError?.();
            }
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text,
          width: buttonRef.current.offsetWidth || 320,
          logo_alignment: "left",
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing Google button:", error);
        setHasError(true);
        setIsLoading(false);
      }
    }
  };

  if (!clientId || hasError) {
    return (
      <div className="w-full h-11 rounded-md border border-border bg-muted flex items-center justify-center text-sm text-muted-foreground">
        Google Sign-In unavailable
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {isLoading && (
        <div className="w-full h-11 rounded-md border border-border bg-secondary flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
      <div 
        ref={buttonRef} 
        className="w-full [&>div]:!w-full [&>div>div]:!w-full [&_iframe]:!w-full" 
        style={{ minHeight: '44px', display: isLoading ? 'none' : 'block' }} 
      />
    </div>
  );
}
