import { IBM_Plex_Sans_Arabic, IBM_Plex_Sans_Hebrew } from "next/font/google";

export const ibmPlexSansHebrew = IBM_Plex_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  fallback: ["IBM Plex Sans Arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ibm-plex-sans-hebrew",
});

export const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  fallback: ["IBM Plex Sans Hebrew"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ibm-plex-sans-arabic",
});
