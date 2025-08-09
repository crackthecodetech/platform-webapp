import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import Navbar from "@/components/Navbar";

const inter = Inter({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
    title: "Crack the Code",
    description: "Start your coding journey",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={`${inter.className} antialiased`}>
                    <Navbar />
                    {children}
                    <Script src="https://checkout.razorpay.com/v1/checkout.js"></Script>
                    <Analytics />
                    <SpeedInsights />
                </body>
            </html>
        </ClerkProvider>
    );
}
