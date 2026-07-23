import { useEffect, useRef, useState } from "react";
import { getOptimizedSrc } from "@/lib/image-url";

type Props = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  /** Carga inmediata y prioritaria (usar solo en imágenes visibles al entrar) */
  priority?: boolean;
  /** Deshabilitar la optimización automática (webp) */
  noOptimize?: boolean;
};

export function OptimizedImage({ src, alt, className, width, height, priority = false, noOptimize = false }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Si la imagen ya estaba en caché, `onLoad` puede no dispararse tras la hidratación.
  // Comprobamos `complete` al montar para no dejarla invisible.
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

  const optimizedSrc = noOptimize ? src : getOptimizedSrc(src, { width: width ?? 800, quality: 80 });

  return (
    <picture>
      {/* Preferir WebP (el navegador decide si lo soporta) */}
      {!noOptimize && optimizedSrc !== src && (
        <source srcSet={optimizedSrc} type="image/webp" />
      )}
      <img
        ref={ref}
        src={noOptimize ? src : optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        onLoad={() => setLoaded(true)}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={`${className ?? ""} transition-[opacity,filter] duration-700 ease-out ${
          loaded ? "opacity-100 blur-0" : "opacity-0 blur-md"
        }`}
      />
    </picture>
  );
}

