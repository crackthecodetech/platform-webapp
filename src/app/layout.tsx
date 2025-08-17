import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import NextJsScripts from "@/components/NextJsScripts";

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
                <head>
                    <link
                        rel="preload"
                        as="image"
                        href="/homepage-hero.svg"
                        type="image/svg+xml"
                    />
                    <link
                        rel="preload"
                        as="image"
                        href="/logo.png"
                        type="image/png"
                    />
                    <link
                        rel="preconnect"
                        href="https://fonts.gstatic.com"
                        crossOrigin="use-credentials"
                    />
                    <link
                        rel="preconnect"
                        href="https://fonts.googleapis.com"
                    />
                </head>
                <body className={`${inter.className} antialiased`}>
                    <Navbar />
                    {children}
                    <Toaster />
                    <NextJsScripts />
                </body>
            </html>
        </ClerkProvider>
    );
}
