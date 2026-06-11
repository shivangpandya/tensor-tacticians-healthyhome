import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HealthyHome Finder",
  description:
    "A prototype dashboard for finding affordable homes near healthier communities and healthcare resources."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
