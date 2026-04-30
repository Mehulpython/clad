import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import JsonLd from "@/components/JsonLd";

const inter = Inter({ subsets: ["latin"] });
  title: {
    default: "Clad — AI Smart Wardrobe & Outfit Generator",
    template: "%s | Clad — AI Smart Wardrobe",
  },
  description:
    "Your personal AI stylist. Upload your wardrobe, get daily outfit suggestions powered by GPT-4o Vision, discover wardrobe gaps, and shop smarter.",
  keywords: [
    "AI wardrobe",
    "smart closet app",
    "outfit generator",
    "digital wardrobe",
    "AI stylist",
    "fashion AI",
    "wardrobe organizer",
    "clothing analyzer",
    "outfit planner",
    "AI fashion assistant",
    "capsule wardrobe",
    "virtual closet",
  ],
  creators: ["Clad"],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Clad",
    title: "Clad — AI Smart Wardrobe & Outfit Generator",
    description:
      "Your personal AI stylist. Upload your wardrobe, get daily outfit suggestions powered by GPT-4o Vision.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clad — AI Smart Wardrobe",
    description:
      "Your personal AI stylist. Upload your wardrobe, get daily outfit suggestions.",
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Clad",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#FDF2F8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ─── Structured Data ───────────────────────────────
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Clad",
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    description:
      "AI-powered smart wardrobe application that helps you organize, style, and optimize your clothing using GPT-4o Vision.",
    sameAs: [], // Add social URLs when available
    foundingDate: "2026",
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@clad.app",
      contactType: "customer support",
    },
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Clad",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web, iOS, Android",
    description:
      "Upload your clothes. Get AI-powered outfit suggestions every day. Discover gaps in your wardrobe and shop smarter with Clad's pre-purchase scanner.",
    url: SITE_URL,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "AI-powered wardrobe digitization",
      "GPT-4o Vision clothing analysis",
      "Smart outfit generation",
      "Weather-aware styling",
      "Weekly outfit planner",
      "Wardrobe gap analysis",
      "Pre-purchase scanner",
      "Color theory engine",
    ],
  };

  return (
<<<<<<< HEAD
    <html lang="en">
      <body className="pb-20 md:pb-0">
