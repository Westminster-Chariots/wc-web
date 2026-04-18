import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Westminster Chariots",
  description: "Set a new password for your Westminster Chariots account.",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}