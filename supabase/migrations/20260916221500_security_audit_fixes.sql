-- 1. SECURITY FIX: RLS for gallery_images
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Galería pública para lectura" ON public.gallery_images;
CREATE POLICY "Galería pública para lectura" 
ON public.gallery_images FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Solo admins modifican galería" ON public.gallery_images;
CREATE POLICY "Solo admins modifican galería" 
ON public.gallery_images FOR ALL 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- 2. SECURITY FIX: RLS for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios autenticados leen roles" ON public.user_roles;
CREATE POLICY "Usuarios autenticados leen roles" 
ON public.user_roles FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Solo admins modifican roles" ON public.user_roles;
CREATE POLICY "Solo admins modifican roles" 
ON public.user_roles FOR ALL 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- 3. SECURITY FIX: RLS for push_subscriptions (prevent exposing endpoints)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select own subscription" ON public.push_subscriptions;
CREATE POLICY "Solo admins pueden ver suscripciones" 
ON public.push_subscriptions FOR SELECT 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Allow public insert to push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "Allow public insert to push_subscriptions"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "Allow public update to push_subscriptions"
  ON public.push_subscriptions FOR UPDATE
  USING (true);

-- 4. SECURITY FIX: Storage bucket policies (parroquia-images)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    CREATE POLICY "Public Access" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'parroquia-images');

    DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
    CREATE POLICY "Admin Insert" 
    ON storage.objects FOR INSERT 
    TO authenticated 
    WITH CHECK (
        bucket_id = 'parroquia-images' 
        AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

    DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
    CREATE POLICY "Admin Update" 
    ON storage.objects FOR UPDATE 
    TO authenticated 
    USING (
        bucket_id = 'parroquia-images' 
        AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

    DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
    CREATE POLICY "Admin Delete" 
    ON storage.objects FOR DELETE 
    TO authenticated 
    USING (
        bucket_id = 'parroquia-images' 
        AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );
END $$;
