import './globals.css'
import {IBM_Plex_Sans_Hebrew} from 'next/font/google'

export const metadata = {
  metadataBase: new URL('https://pi-factor.vercel.app'),
  title: 'Pi-Factor',
  description:
    'TAU-Factor 2',
}

const ibmPlexSansHebrew = IBM_Plex_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap",
})


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={ibmPlexSansHebrew.className}>{children}</body>
    </html>
  )
}
