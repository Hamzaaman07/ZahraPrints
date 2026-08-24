import { Suspense, lazy } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./routes/Home";
import { Shop } from "./routes/Shop";
import { Product } from "./routes/Product";
import { Reviews } from "./routes/Reviews";
import { NotFound } from "./routes/NotFound";

/* About carries the heavy editorial motion, so it loads on demand. */
const About = lazy(() => import("./routes/About").then((m) => ({ default: m.About })));

export function App() {
  const { pathname, search } = useLocation();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4
                                 focus:z-[100] focus:bg-amber focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Header />
      <main id="main" className={pathname === "/" ? "" : "pt-16"}>
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop key={search} />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
