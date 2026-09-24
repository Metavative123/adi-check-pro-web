import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ADI Check Pro",
  description: "Driver and Vehicle Standards checks for driving instructors",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      {/* suppressHydrationWarning: browser extensions (ColorZilla, Grammarly)
          add attributes to <body> before React hydrates */}
      <body className="min-h-full bg-white text-ink" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
