-- 1. FUNCIÓN SECURITY DEFINER (Previene recursión infinita en PostgreSQL RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role::text = _role
  );
$$;

-- 2. CORREGIR POLÍTICAS DE USER_ROLES
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo admins modifican roles" ON public.user_roles;
DROP POLICY IF EXISTS "Usuarios autenticados leen roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Lectura de roles propia" ON public.user_roles;
DROP POLICY IF EXISTS "Solo admins insertan roles" ON public.user_roles;
DROP POLICY IF EXISTS "Solo admins actualizan roles" ON public.user_roles;
DROP POLICY IF EXISTS "Solo admins eliminan roles" ON public.user_roles;

-- Lectura: los usuarios autenticados pueden consultar sus roles para que el frontend no dé 500
CREATE POLICY "Usuarios autenticados leen roles" 
ON public.user_roles FOR SELECT 
TO authenticated 
USING (true);

-- Escritura: solo admins modifican roles (usando has_role SECURITY DEFINER para evitar recursión)
CREATE POLICY "Solo admins insertan roles" 
ON public.user_roles FOR INSERT 
TO authenticated 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Solo admins actualizan roles" 
ON public.user_roles FOR UPDATE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Solo admins eliminan roles" 
ON public.user_roles FOR DELETE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- 3. CORREGIR POLÍTICAS DE GALLERY_IMAGES
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo admins modifican galería" ON public.gallery_images;
DROP POLICY IF EXISTS "Galería pública para lectura" ON public.gallery_images;

CREATE POLICY "Galería pública para lectura" 
ON public.gallery_images FOR SELECT 
USING (true);

CREATE POLICY "Solo admins modifican galería" 
ON public.gallery_images FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Asegurar rol admin para el usuario actual
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES ('ce8e8de5-f8e1-4a08-b0a6-52a3e41dbef2', 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES ('ce8e8de5-f8e1-4a08-b0a6-52a3e41dbef2', 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;
