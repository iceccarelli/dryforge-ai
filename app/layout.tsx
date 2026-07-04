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
    default: "DryForge | Autonomous Drywall Finishing — Founding Pilot Program",
    template: "%s | DryForge",
  },
  description:
    "DryForge is building robot-assisted drywall finishing as a service for GTA contractors: semi-autonomous robots supervised by trained operators, priced per square foot with no capex. Now recruiting founding pilot partners.",
  keywords: [
    "drywall finishing robots",
    "construction robotics",
    "autonomous drywall",
    "RaaS construction",
    "drywall automation",
    "Ontario construction tech",
    "drywall labor shortage",
    "robot as a service drywall",
  ],
  authors: [{ name: "DryForge", url: "https://dryforge.ai" }],
  creator: "DryForge",
  publisher: "DryForge",
  openGraph: {
    title: "DryForge — Autonomous Drywall Finishing. Founding Pilot Program.",
    description:
      "Robot-assisted drywall finishing as a service, in development for GTA contractors. Per-sqft pricing, no capex, human-supervised. Apply to be a founding pilot partner.",
    siteName: "DryForge",
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "DryForge | Autonomous Drywall Finishing — Founding Pilot Program",
    description:
      "Robot-assisted drywall finishing as a service, in development for GTA contractors. Apply to be a founding pilot partner.",
  },
  robots: {
    index: true,
    follow: true,
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

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
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
  );

  if (!clerkEnabled) return content;

  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: "bg-[#F97316] hover:bg-[#EA580C] text-white",
          card: "shadow-xl border border-slate-200",
        },
      }}
    >
      {content}
    </ClerkProvider>
  );
}
