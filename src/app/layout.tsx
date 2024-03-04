"use client";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from 'react';

import { HandleOnComplete } from "@lib/router-events";
import Loader from "@components/core/Loader";
import Header from "@components/core/Header";
import Footer from "@components/core/Footer";
import SideNavigation from "@components/core/SideNavigation";
import ToastProvider from "@lib/ToastProvider";
import useRouter from "@hooks/useRouter";
import { useRouter as useNextRouter } from "next/navigation";
import { LanguageProvider } from "context/languageContext";
import { LoadingProvider } from "context/LoadingContext";
import "../../public/css/external.css"
import "./globals.css";
import { ContextProvider } from "context/ContextProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loading = useRouter();
  const router = useNextRouter();
  const path = usePathname();
  const route = path.split("/");
  const locale = "en";

  const [isMenuCollapsed, setIsMenuCollapsed] = useState(true);
  const loadScript = (src: any) =>
    new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

  async function loadScriptsSequentially() {
    try {
      setTimeout(async () => {
        await loadScript('/js/jquery.js');
        await loadScript('/js/popper.min.js');
        await loadScript('/js/bootstrap.min.js');
        await loadScript('/js/mCustomScrollbar.min.js')
        await loadScript('/js/slick.min.js')
        await loadScript('/js/select2.min.js')
        await loadScript('/js/custom.js')
      }, 1000);

    } catch (error) {
      console.log(error)
    }
  }

  const isDashboard = () => {
    return !route.includes("auth") ? !route.includes("maintenance") ? true : false : false;
  }

  const isQrDetailsPage = () => {
    return path === "/brand/qr-details/garment-sales" ? true : false
  }

  useEffect(() => {
    loadScriptsSequentially()
    if (!isQrDetailsPage() && !isDashboard() && !localStorage.getItem("accessToken")) {
      router.push("/auth/login");
    }
  }, [])

  if (loading) {
    return (
      <>
        <html lang="en">
          <body>
            <div className="w-screen h-screen flex justify-center items-center">
              <Loader />
            </div>
          </body>
        </html>
      </>
    );
  } else {
    return (
      <html lang={locale}>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap" rel="stylesheet" />
          {/* <link rel="stylesheet" href="/css/external.css" /> */}
        </head>
        <body>
          <LoadingProvider>
            <LanguageProvider>
              <ContextProvider>
                <main>
                  {
                    isQrDetailsPage() ? (
                      <div>
                        {children}
                      </div>
                    ) :
                      isDashboard() ? (
                        <div className="wrapper">
                          <section className={`layout-wrapper ${isMenuCollapsed ? "layout-wrapper-collapsed" : ""}`}>
                            <SideNavigation isMenuCollapsed={isMenuCollapsed} setIsMenuCollapsed={setIsMenuCollapsed} />
                            <section className="layout-wrapper-content">
                              <Header />
                              <section className="right-content">
                                <div className="right-content-inner">
                                  <HandleOnComplete />
                                  {children}
                                </div>
                              </section>
                              <Footer />
                            </section>
                          </section>
                        </div>
                      ) : (
                        <div>
                          {children}
                        </div>
                      )
                  }
                  <ToastProvider />
                </main>
              </ContextProvider>
            </LanguageProvider >
          </LoadingProvider>
        </body>
      </html>
    );
  }
}
