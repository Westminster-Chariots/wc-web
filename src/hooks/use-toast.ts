"use client";
import { notify } from "@/lib/notify";

export function useToast() {
  return {
    toast: (options: { title?: string; description?: string; variant?: string }) => {
      if (options.variant === "destructive") {
        notify.error(options.description || options.title || "Error");
      } else {
        notify.success(options.description || options.title || "Success");
      }
    },
  };
}
