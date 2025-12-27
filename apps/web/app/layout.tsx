import type { Metadata } from "next";
import type React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduVerse AI",
  description: "Unified ERP + LMS + AI Platform for Educational Institutions",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="description" content={metadata.description || ""} />
      </head>
      <body className="bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-50 transition-colors">
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
