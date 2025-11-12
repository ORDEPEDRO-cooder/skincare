import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkinGuide AI - Personalized Skincare Routines",
  description: "AI-powered skincare routine planner with product analysis and personalized recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-inter antialiased bg-gradient-to-br from-rose-50 via-white to-purple-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
