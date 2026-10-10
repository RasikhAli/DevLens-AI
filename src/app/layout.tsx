import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevLens AI — Understand Skills. Compare Evidence. Find the Right Match.",
  description:
    "Professional AI-Powered Developer Profile Analyzer, Technical Skills Assessment, Developer Comparison, and Job Matching Platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        {children}
      </body>
    </html>
  );
}
