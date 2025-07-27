import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Net Zero",
  description: "Effortless networking at climate events. Powered by Next.js.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
        {/* Optional: Galactic/star bg for whole app */}
        <div
          aria-hidden
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 60% 20%, #20134e 0%, #100924 60%, #080017 100%), " +
              "repeating-radial-gradient(circle at 20% 30%, rgba(255,255,255,0.11) 1px, transparent 1.5px, transparent 100px), " +
              "repeating-radial-gradient(circle at 80% 70%, rgba(255,255,255,0.08) 1px, transparent 1.3px, transparent 100px)",
            backgroundSize: "cover",
            opacity: 0.55,
            filter: "blur(0.5px)",
          }}
        />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
