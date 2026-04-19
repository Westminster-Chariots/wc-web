"use client";
import { toast } from "sonner";
import type { ExternalToast } from "sonner";

export const notify = {
  success: (msg: string | React.ReactNode, options?: ExternalToast) => toast.success(msg, options),
  error: (msg: string | React.ReactNode, options?: ExternalToast) => toast.error(msg, options),
  info: (msg: string | React.ReactNode, options?: ExternalToast) => toast.info(msg, options),
  warning: (msg: string | React.ReactNode, options?: ExternalToast) => toast.warning(msg, options),
};
