export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export function sanitizeForJson(obj: unknown): unknown {
  if (typeof obj === "string") {
    return sanitizeHtml(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForJson);
  }
  
  if (obj && typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeForJson(value);
    }
    return sanitized;
  }
  
  return obj;
}

export function validateStructuredData(data: unknown): boolean {
  if (!data || typeof data !== "object") {
    return false;
  }
  
  const obj = data as Record<string, unknown>;
  
  if (!obj["@type"] || typeof obj["@type"] !== "string") {
    return false;
  }
  
  const allowedTypes = [
    "Organization",
    "WebSite",
    "WebPage",
    "Article",
    "BlogPosting",
    "Person",
    "BreadcrumbList",
    "Service",
    "Product",
    "FAQPage",
    "HowTo",
  ];
  
  if (!allowedTypes.includes(obj["@type"] as string)) {
    return false;
  }
  
  return true;
}
