import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { authOptions } from "@/utils/auth";
import { getServerSession } from "next-auth";
import { ModalProvider } from "./contexts/ModalContext";
import ConditionalLayout from "./components/layout/ConditionalLayout";
import SessionProvider from "./providers/SessionProvider";
import { headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tutorlytics",
  description: "Multi-tenant tutoring management platform",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    if (error instanceof Error && error.message.includes('decryption operation failed')) {
      session = null;
    } else {
      console.error('Session error in layout:', error);
      session = null;
    }
  }

  let initialPathname: string | undefined = undefined;
  try {
    const headersList = await headers();
    initialPathname = headersList.get('x-pathname') || undefined;
  } catch {
    // Client-side usePathname() will handle it
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-gray-900`}
        style={{ backgroundColor: '#ffffff', fontFamily: "'Work Sans', sans-serif" }}
        suppressHydrationWarning={true}
      >
        <SessionProvider session={session}>
          <ModalProvider>
            <ConditionalLayout session={session} initialPathname={initialPathname || undefined}>
              {children}
            </ConditionalLayout>
          </ModalProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
