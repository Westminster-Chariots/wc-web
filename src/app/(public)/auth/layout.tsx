import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Westminster Chariots",
  description: "Access your Westminster Chariots account to manage bookings, view history, and experience premium executive transportation.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}