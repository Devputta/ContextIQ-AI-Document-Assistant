import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ContextIQ — AI Document Assistant",
  description: "Understand your documents with context-aware AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}