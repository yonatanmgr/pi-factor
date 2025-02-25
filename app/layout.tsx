import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { ibmPlexSansHebrew } from "@/lib/fonts";
import { cn } from "@/lib/utils/utils";
import { SemesterCacheProvider } from '@/lib/store/SemesterCacheContext';

export const metadata = {
  metadataBase: new URL("https://pi-factor.vercel.app"),
  title: "Pi-Factor",
  description: "TAU-Factor 2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he">
      <body className={cn(ibmPlexSansHebrew.className, "overflow-hidden")}>
        <SemesterCacheProvider>
          {children}
        </SemesterCacheProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
