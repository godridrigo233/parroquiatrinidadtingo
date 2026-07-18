import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  /** Carga inmediata y prioritaria (usar solo en imágenes visibles al entrar) */
  priority?: boolean;
};

export function OptimizedImage({ src, alt, className, width, height, priority = false }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Si la imagen ya estaba en caché, `onLoad` puede no dispararse tras la hidratación.
  // Comprobamos `complete` al montar para no dejarla invisible.
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

  return (
    <img
      ref={ref}
      src={src}
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
  );
}
