import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import products from "./data/products.json";
import reviews from "./data/reviews.json";

const byCategory = products.reduce<Record<string, number>>(
  (acc, p) => ({ ...acc, [p.category]: (acc[p.category] ?? 0) + 1 }),
  {},
);

function DataSmokeTest() {
  return (
    <main className="mx-auto max-w-3xl p-10 font-mono text-sm">
      <h1 className="mb-6 text-2xl text-amber">Zahra Prints — data layer</h1>
      <p className="mb-6 text-sand/60">
        Phase 1 shell. Confirms the generated JSON reaches the browser. UI lands in Phase 4.
      </p>
      <dl className="space-y-1">
        <div data-testid="product-count">products: {products.length}</div>
        <div data-testid="review-count">reviews: {reviews.length}</div>
        <div data-testid="image-total">
          image urls: {products.reduce((n, p) => n + p.images.length, 0)}
        </div>
        <div data-testid="categories">
          categories:{" "}
          {Object.entries(byCategory)
            .map(([c, n]) => `${c}=${n}`)
            .join(" ")}
        </div>
        <div data-testid="spec-sample">
          sample specs: {Object.keys(products[0].specs).join(", ")}
        </div>
      </dl>
      <img
        src="/brand/logo-mark-on-dark.svg"
        alt="Zahra Prints"
        width={96}
        height={96}
        className="mt-8"
      />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DataSmokeTest />
  </StrictMode>,
);
