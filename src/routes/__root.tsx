import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/contexts/AuthContext";
import { CookieBanner } from '../components/auth/CookieBanner';
import { useAnalytics } from '../hooks/useAnalytics';
const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["CatholicChurch", "PlaceOfWorship", "LocalBusiness"],
      "@id": "https://parroquiatrinidadtingo.vercel.app/#church",
      "name": "Parroquia Santísima Trinidad de Tingo",
      "alternateName": [
        "Parroquia de Tingo",
        "Parroquia Trinidad Tingo",
        "Iglesia Santísima Trinidad de Tingo",
        "Santuario Parroquial de Tingo"
      ],
      "url": "https://parroquiatrinidadtingo.vercel.app",
      "logo": "https://parroquiatrinidadtingo.vercel.app/assets/logo.webp",
      "image": [
        "https://parroquiatrinidadtingo.vercel.app/assets/hero-church.webp",
        "https://parroquiatrinidadtingo.vercel.app/assets/logo.webp"
      ],
      "description": "Parroquia católica Santísima Trinidad de Tingo en Arequipa, dirigida por la congregación de los Padres Carmelitas de María Inmaculada (CMI). Horarios de misa, confesiones, sacramentos, secretaría parroquial y vida pastoral comunitaria.",
      "telephone": "+51 915 049 850",
      "email": "pstrinidadtingo@gmail.com",
      "priceRange": "Gratuito / Ofrenda voluntaria",
      "currenciesAccepted": "PEN",
      "paymentAccepted": "Efectivo, Yape, Plin, Transferencia bancaria",
      "publicAccess": true,
      "isAccessibleForFree": true,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Calle Ferrocarril 200, Av. Alfonso Ugarte (Frente al Parque Principal de Tingo)",
        "addressLocality": "Tingo, Cercado",
        "addressRegion": "Arequipa",
        "postalCode": "04011",
        "addressCountry": "PE"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -16.4262,
        "longitude": -71.5542
      },
      "hasMap": "https://www.google.com/maps/dir/?api=1&destination=Parroquia+Santísima+Trinidad+Tingo+Arequipa",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
          ],
          "opens": "15:00",
          "closes": "18:00",
          "description": "Atención presencial y telefónica en Secretaría Parroquial"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
          ],
          "opens": "18:00",
          "closes": "19:00",
          "description": "Santa Misa vespertina comunitaria (martes a sábado)"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Sunday",
          "opens": "07:00",
          "closes": "19:30",
          "description": "Celebraciones Eucarísticas Dominicales comunitarias"
        }
      ],
      "sameAs": [
        "https://www.facebook.com/parroquiasantisimatrinidadtingo/",
        "https://www.instagram.com/stma_trinidad_tingo/"
      ],
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+51 915 049 850",
          "contactType": "Secretaría Parroquial y Atención",
          "availableLanguage": ["es"],
          "areaServed": "PE"
        }
      ],
      "parentOrganization": {
        "@type": "Organization",
        "name": "Arquidiócesis de Arequipa",
        "url": "https://arzobispadodearequipa.org.pe"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://parroquiatrinidadtingo.vercel.app/#website",
      "url": "https://parroquiatrinidadtingo.vercel.app",
      "name": "Parroquia Santísima Trinidad de Tingo",
      "description": "Sitio web oficial de la Parroquia Santísima Trinidad de Tingo en Arequipa.",
      "inLanguage": "es-PE",
      "publisher": {
        "@id": "https://parroquiatrinidadtingo.vercel.app/#church"
      }
    }
  ]
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Parroquia Santísima Trinidad de Tingo · Arequipa" },
      {
        name: "description",
        content:
          "Portal digital de la Parroquia Santísima Trinidad de Tingo en Arequipa. Consulta horarios de Misa, sacramentos, intenciones y actividades comunitarias.",
      },
      { name: "theme-color", content: "#0F1B2D" },
      { name: "application-name", content: "Trinidad Tingo" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Trinidad Tingo" },
      
      // ── OpenGraph / Facebook / WhatsApp Preview ──
      { property: "og:site_name", content: "Parroquia Santísima Trinidad de Tingo" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "es_PE" },
      { property: "og:url", content: "https://parroquiatrinidadtingo.vercel.app/" },
      { property: "og:title", content: "Parroquia Santísima Trinidad de Tingo · Arequipa" },
      {
        property: "og:description",
        content:
          "Portal digital oficial de la Parroquia Santísima Trinidad de Tingo. Horarios de Misa, sacramentos, intenciones y comunidad parroquial.",
      },
      { property: "og:image", content: "https://parroquiatrinidadtingo.vercel.app/assets/hero-church.webp" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Templo Parroquia Santísima Trinidad de Tingo" },

      // ── Twitter / X Card ──
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Parroquia Santísima Trinidad de Tingo · Arequipa" },
      {
        name: "twitter:description",
        content:
          "Portal digital de la Parroquia Santísima Trinidad de Tingo en Arequipa. Horarios de Misa, sacramentos y comunidad.",
      },
      { name: "twitter:image", content: "https://parroquiatrinidadtingo.vercel.app/assets/hero-church.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/pwa-192x192.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/pwa-192x192.png" },
      { rel: "preload", as: "image", href: "/assets/logo.webp", fetchPriority: "high" } as any,
      { rel: "preload", as: "image", href: "/assets/hero-church.webp", fetchPriority: "high" } as any,
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600;700&display=swap",
        media: "print",
        onLoad: (e: any) => { e.currentTarget.media = 'all'; },
      } as any,
    ],

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(ORG_JSONLD),
      },
      {
        // Swap non-blocking Google Fonts stylesheet from media=print to all
        children:
          "document.querySelectorAll('link[rel=stylesheet][media=print]').forEach(function(l){l.addEventListener('load',function(){l.media='all'});if(l.sheet)l.media='all';});",
      },
    ],

  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});


function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useAnalytics('G-PHPPD45JSX')
  const { queryClient } = Route.useRouteContext();
    useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Service Worker PWA registrado'))
        .catch((err) => console.log('Error en SW:', err));
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
        <Outlet />
      </AuthProvider>
      <CookieBanner />
    </QueryClientProvider>
    
  );
}