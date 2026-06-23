export function SkeletonCard() {
  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      {/* Simulación de la Imagen superior */}
      <div className="h-48 bg-gray-200 w-full"></div>
      
      {/* Simulación del Contenido (Textos) */}
      <div className="p-5 flex flex-col gap-3">
        {/* Título principal (más grueso) */}
        <div className="h-6 bg-gray-300 rounded-md w-3/4"></div>
        
        {/* Párrafo de descripción (líneas delgadas) */}
        <div className="space-y-2 mt-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        
        {/* Simulación de un botón de "Ver más" */}
        <div className="h-10 bg-gray-300 rounded-full w-1/3 mt-4"></div>
      </div>
    </div>
  );
}