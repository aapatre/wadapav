import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/** Request fullscreen on first user tap (mobile browsers). */
function useRequestFullscreen() {
  useEffect(() => {
    // Skip if already in standalone/fullscreen PWA mode
    if (window.matchMedia("(display-mode: fullscreen)").matches ||
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone) {
      return;
    }

    const request = () => {
      const el = document.documentElement;
      const rfs =
        el.requestFullscreen ||
        (el as any).webkitRequestFullscreen ||
        (el as any).msRequestFullscreen;
      if (rfs) {
        rfs.call(el).catch(() => {});
      }
      // Remove listeners after first attempt
      window.removeEventListener("touchstart", request);
      window.removeEventListener("click", request);
    };

    window.addEventListener("touchstart", request, { once: true });
    window.addEventListener("click", request, { once: true });

    return () => {
      window.removeEventListener("touchstart", request);
      window.removeEventListener("click", request);
    };
  }, []);
}

const App = () => {
  useRequestFullscreen();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
