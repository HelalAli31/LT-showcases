import type { AppProps } from "next/app";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "@/index.css";
import "@/private/private.css";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <TooltipProvider>
      <Component {...pageProps} />
      <Toaster />
    </TooltipProvider>
  );
}
