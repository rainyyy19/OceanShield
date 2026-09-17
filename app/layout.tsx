import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OceanShield AI | AI Maritime GPS/AIS Spoofing Investigation Platform",
  description: "Enterprise maritime cybersecurity platform for AIS/GPS spoofing detection, GNSS signal integrity monitoring, and dark fleet tracking.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-navy-900 text-slate-100 antialiased selection:bg-cyan-500 selection:text-navy-950 bg-radar-grid">
        {children}
      </body>
    </html>
  );
}
