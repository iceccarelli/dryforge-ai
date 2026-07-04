import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dryforge.ai"),
  title: {
    default: "DryForge | Autonomous Drywall Finishing Robots | RaaS Platform",
    template: "%s | DryForge",
  },
  description: "The Operating System for Autonomous Drywall Finishing. Finish drywall 3× faster with semi-autonomous robots. RaaS pricing per sqft. Deploy in under 14 days in Ontario & beyond. Eliminate labor headaches forever.",
  keywords: [
    "drywall finishing robots",
    "construction robotics",
    "autonomous drywall",
    "RaaS construction",
    "drywall automation",
    "Level 5 finish robot",
    "Ontario construction tech",
    "labor shortage solution drywall",
    "robot as a service drywall",
  ],
  authors: [{ name: "DryForge", url: "https://dryforge.ai" }],
  creator: "DryForge Inc.",
  publisher: "DryForge",
  openGraph: {
    title: "DryForge — Finish Drywall 3× Faster. Eliminate Labor Headaches Forever.",
    description: "The dominant platform for autonomous drywall finishing. RaaS model. Proven in GTA job sites. 65% faster. 40-60% labor cost reduction. Book your site assessment today.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DryForge - Autonomous Drywall Finishing Robots dominating the job site",
      },
    ],
    siteName: "DryForge",
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DryForge | The Operating System for Autonomous Drywall Finishing",
    description: "Finish Drywall 3× Faster with ruthless efficiency. RaaS for contractors winning the labor war.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://dryforge.ai",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: "bg-[#F97316] hover:bg-[#EA580C] text-white",
          card: "shadow-xl border border-slate-200",
        },
      }}
    >
      <html
        lang="en"
        className={cn(
          geistSans.variable,
          geistMono.variable,
          inter.variable,
          "h-full antialiased scroll-smooth"
        )}
      >
        <body className="min-h-full flex flex-col bg-[#FAFBFC] text-slate-950 font-sans">
          {children}
          <Toaster position="top-center" richColors closeButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
