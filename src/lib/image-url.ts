const SUPABASE_STORAGE_PATTERN = /\/storage\/v1\/object\/public\//;

type OptimizeOptions = {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "avif" | "auto";
};

export function getSupabaseImageUrl(url: string | null | undefined, opts: OptimizeOptions = {}): string {
  if (!url) return "";

  const { width = 600, height, quality = 80, format = "webp" } = opts;

  // Si no es URL de Supabase, la devolvemos tal cual
  if (!SUPABASE_STORAGE_PATTERN.test(url)) {
    // Para imágenes estáticas locales, intentamos preferir webp si existe
    if (url.startsWith("/assets/") && /\.(png|jpe?g)$/i.test(url)) {
      const base = url.replace(/\?.*$/, "");
      return base.replace(/\.(png|jpe?g)$/i, ".webp");
    }
    return url;
  }

  // Ya tiene parámetros de transformación? No duplicamos
  if (url.includes("?width=") || url.includes("&width=")) return url;

  const sep = url.includes("?") ? "&" : "?";
  let params = `${sep}width=${width}&quality=${quality}`;
  if (height) params += `&height=${height}`;
  params += "&resize=cover";
  // El parámetro `format` requiere plan Pro en Supabase. Lo omitimos si no está disponible.
  // Dejamos que el navegador negocie vía Accept (Safari/Chrome aceptan webp nativamente).

  return url + params;
}

export function getOptimizedSrc(src: string, opts: OptimizeOptions = {}): string {
  if (src.includes("supabase.co")) {
    return getSupabaseImageUrl(src, opts);
  }
  // Para imágenes estáticas locales, usamos la versión webp generada por el plugin
  if (src.startsWith("/assets/") && /\.(png|jpe?g)$/i.test(src)) {
    const base = src.replace(/\?.*$/, "");
    return base.replace(/\.(png|jpe?g)$/i, ".webp");
  }
  return src;
}
