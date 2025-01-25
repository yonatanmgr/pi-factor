import "./globals.css";
import { IBM_Plex_Sans_Hebrew } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react"

export const metadata = {
  metadataBase: new URL("https://pi-factor.vercel.app"),
  title: "Pi-Factor",
  description: "TAU-Factor 2",
};

const ibmPlexSansHebrew = IBM_Plex_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he">
      <body className={ibmPlexSansHebrew.className}>
        <main
          dir={"rtl"}
          className={
            "flex sm:overflow-hidden flex-col gap-4 p-4 items-center h-[100dvh] min-h-[100dvh] max-h-[100dvh] justify-between"
          }
        >
          {children}
          <SpeedInsights />
          <Analytics />
        </main>
      </body>
    </html>
  );
}
