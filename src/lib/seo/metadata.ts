/**
 * Client-side Document Head / Meta dynamic injecter
 */

export interface HeadMetadata {
  title: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

export function updateDocumentMetadata(meta: HeadMetadata) {
  if (typeof document === "undefined") return;

  // Title
  document.title = `${meta.title} | Student AI Hub`;

  // Meta Elements
  const updateMetaTag = (selectors: string, propertyName: string, content: string) => {
    let element = document.querySelector(selectors);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(selectors.includes("name") ? "name" : "property", propertyName);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
  };

  if (meta.description) {
    updateMetaTag('meta[name="description"]', 'description', meta.description);
    updateMetaTag('meta[property="og:description"]', 'og:description', meta.description);
  }

  if (meta.keywords) {
    updateMetaTag('meta[name="keywords"]', 'keywords', meta.keywords.join(", "));
  }

  if (meta.ogImage) {
    updateMetaTag('meta[property="og:image"]', 'og:image', meta.ogImage);
  }

  // Canonical Link
  if (meta.canonicalUrl) {
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", meta.canonicalUrl);
  }
}
