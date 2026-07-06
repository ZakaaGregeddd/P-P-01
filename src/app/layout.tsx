import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import AdaptiveNavbar from "./AdaptiveNavbar";
import LavaBackground from "./LavaBackground";
import GlobalLoader from "./GlobalLoader";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARCHITEX.v1 - Speculative Engineering Portfolio",
  description: "Crafting digital structures with mathematical precision and ethereal depth. A portfolio of high-fidelity prototypes, systems architectures, and interactive schematics.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has("admin_session");

  return (
    <html lang="en" className="dark h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-background font-body-base min-h-screen blueprint-grid relative flex flex-col justify-between selection:bg-secondary/30 selection:text-primary">
        {/* Global Loading Screen Overlay */}
        <GlobalLoader />

        {/* Global Lava Lamp Background Animation */}
        <LavaBackground />

        {/* Grid Overlay Guide (Development/Aesthetic) */}
        <div className="fixed inset-0 pointer-events-none z-0 hidden md:flex justify-between px-margin-desktop opacity-[0.03]">
          <div className="w-full h-full border-x border-primary"></div>
          <div className="w-full h-full border-r border-primary"></div>
          <div className="w-full h-full border-r border-primary"></div>
          <div className="w-full h-full border-r border-primary"></div>
          <div className="w-full h-full border-r border-primary"></div>
          <div className="w-full h-full border-r border-primary"></div>
          <div className="w-full h-full border-r border-primary"></div>
          <div className="w-full h-full border-r border-primary"></div>
          <div className="w-full h-full border-r border-primary"></div>
          <div className="w-full h-full border-r border-primary"></div>
          <div className="w-full h-full border-r border-primary"></div>
          <div className="w-full h-full border-r border-primary"></div>
        </div>

        {/* Adaptive NavBar */}
        <AdaptiveNavbar isLoggedIn={isLoggedIn} />

        {/* Content Canvas */}
        <main className="flex-grow pt-20">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full py-4 bg-background border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop gap-2 z-10 relative">
          <div className="font-label-caps text-[9px] text-primary opacity-60 tracking-wider">
            © 2024 SYSTEM_REDACTED. ARCHITECTURAL SPECIFICATION V.04
          </div>
          <div className="flex gap-4 font-technical-sm text-[10px] text-on-surface-variant">
            <Link href="#" className="hover:text-secondary opacity-75 hover:opacity-100 transition-opacity">Documentation</Link>
            <Link href="#" className="hover:text-secondary opacity-75 hover:opacity-100 transition-opacity">Source</Link>
            <Link href="#" className="hover:text-secondary opacity-75 hover:opacity-100 transition-opacity">Privacy</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
