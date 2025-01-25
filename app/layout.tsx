import "./globals.css";
import { IBM_Plex_Sans_Arabic, IBM_Plex_Sans_Hebrew } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { cn } from "@/lib/utils";

export const metadata = {
  metadataBase: new URL("https://pi-factor.vercel.app"),
  title: "Pi-Factor",
  description: "TAU-Factor 2",
};

const ibmPlexSansHebrew = IBM_Plex_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  fallback: ["IBM Plex Sans Arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ibm-plex-sans-hebrew",
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  fallback: ["IBM Plex Sans Hebrew"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ibm-plex-sans-arabic",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he">
      <body className={cn(ibmPlexSansHebrew.className, ibmPlexSansArabic.className)}>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
