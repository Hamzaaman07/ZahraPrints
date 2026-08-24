import { useEffect } from "react";

/** Per-page title, description and Open Graph tags, without pulling in a helmet lib. */
export function useSeo(title: string, description: string, image?: string) {
  useEffect(() => {
    document.title = title;

    const set = (selector: string, attr: string, value: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        const [key, val] = selector.replace(/^meta\[|\]$/g, "").split("=");
        el.setAttribute(key, val.replace(/"/g, ""));
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    set('meta[name="description"]', "content", description);
    set('meta[property="og:title"]', "content", title);
    set('meta[property="og:description"]', "content", description);
    set('meta[property="og:type"]', "content", "website");
    set('meta[name="twitter:card"]', "content", "summary_large_image");
    if (image) {
      set('meta[property="og:image"]', "content", image);
      set('meta[name="twitter:image"]', "content", image);
    }
  }, [title, description, image]);
}
