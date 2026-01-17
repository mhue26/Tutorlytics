"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardLayout from "./DashboardLayout";
import Header from "../../Header";
import Footer from "../../Footer";

interface ConditionalLayoutProps {
  children: React.ReactNode;
  session: any;
  initialPathname?: string;
}

// Public routes that should not use DashboardLayout
const publicRoutes = ["/", "/signin", "/signup", "/about", "/contact", "/cookie-policy"];

export default function ConditionalLayout({ children, session, initialPathname }: ConditionalLayoutProps) {
  const clientPathname = usePathname();
  // Use client pathname if available, otherwise fall back to initialPathname from server
  const pathname = clientPathname || initialPathname || "";
  
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/175c5cc9-0563-48f8-b397-7b7e227ddec8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ConditionalLayout.tsx:25',message:'ConditionalLayout mounted',data:{pathname,clientPathname,initialPathname,hasSession:!!session,hasUser:!!session?.user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  }, [pathname, clientPathname, initialPathname, session]);
  // #endregion
  
  const isPublicRoute = publicRoutes.includes(pathname || "");
  const shouldUseDashboardLayout = session?.user && !isPublicRoute;
  
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/175c5cc9-0563-48f8-b397-7b7e227ddec8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ConditionalLayout.tsx:32',message:'layout decision',data:{shouldUseDashboardLayout,isPublicRoute,pathname,hasUser:!!session?.user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  }, [shouldUseDashboardLayout, isPublicRoute, pathname, session]);
  // #endregion

  if (shouldUseDashboardLayout) {
    return (
      <div suppressHydrationWarning>
        <DashboardLayout session={session}>{children}</DashboardLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" suppressHydrationWarning>
      <Header session={session} />
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 pt-20">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
