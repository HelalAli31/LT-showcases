import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Head from "next/head";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as Toast } from "@/components/ui/toaster";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import { ScrollToTop } from "@/components/ScrollToTop";
import "@/index.css";
import "@/private/private.css";
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter(),
    privatePage = ["/admin", "/offer", "/contract-access"].some((p) =>
      router.pathname.startsWith(p),
    );
  return (
    <TooltipProvider>
      {privatePage ? (
        <Component {...pageProps} />
      ) : (
        <LanguageProvider>
          <Head>
            <title>Luxury Tech | פיתוח אתרים ומערכות ניהול</title>
            <meta
              name="description"
              content="פיתוח אתרי פרימיום, חנויות מסחר אלקטרוני ומערכות ניהול לעסקים. Luxury Tech."
            />
            <link
              rel="canonical"
              href={"https://www.luxurytech.org" + router.asPath.split("?")[0]}
            />
          </Head>
          <ScrollToTop />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </LanguageProvider>
      )}
      <Toaster />
      <Toast />
    </TooltipProvider>
  );
}
