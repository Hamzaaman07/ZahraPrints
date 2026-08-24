import { Link } from "react-router-dom";
import { money, type Product } from "../lib/catalog";

/**
 * Card swaps to the second image on hover. All product imagery is portrait, so
 * the 4:5 box is reserved up front and nothing shifts as images stream in.
 */
export function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  const [first, second] = product.images;
  return (
    <Link
      to={`/product/${product.id}`}
      className="group block focus-visible:outline focus-visible:outline-2
                 focus-visible:outline-offset-4 focus-visible:outline-amber"
    >
      <div className="relative aspect-[4/5] overflow-hidden border border-transparent
                      bg-ink-raised transition-colors duration-300 group-hover:border-gold/45">
        <img
          src={first}
          alt={product.title}
          width={800}
          height={1000}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500
                     group-hover:opacity-0 motion-reduce:transition-none"
        />
        {second && (
          <img
            src={second}
            alt=""
            aria-hidden="true"
            width={800}
            height={1000}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full scale-[1.03] object-cover opacity-0
                       transition-opacity duration-500 group-hover:opacity-100
                       motion-reduce:transition-none"
          />
        )}
      </div>
      <h3 className="mt-3 line-clamp-2 font-ui text-sm leading-snug text-sand/85
                     transition-colors group-hover:text-sand">
        {product.title}
      </h3>
      <p className="mt-1 font-ui text-sm text-amber">{money(product.price)}</p>
    </Link>
  );
}
