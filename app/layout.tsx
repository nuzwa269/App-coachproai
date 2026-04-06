import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoachPro AI — Your AI-Powered Development Coach",
  description:
    "CoachPro AI helps developers build better software faster with context-aware AI assistance, project workspaces, and specialised coding assistants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
