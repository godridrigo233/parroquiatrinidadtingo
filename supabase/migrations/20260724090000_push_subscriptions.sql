-- Tabla de suscripciones push para notificaciones PWA en Android e iOS
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- El endpoint de push es único por navegador (evita duplicados)
CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint 
  ON push_subscriptions (endpoint);

-- Permitir acceso público para insertar (el frontend guarda las suscripciones sin autenticación)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to push_subscriptions"
  ON push_subscriptions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public select own subscription"
  ON push_subscriptions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Solo el service_role (edge function) puede leer todas y borrar caducadas
-- (la edge function usa SUPABASE_SERVICE_ROLE_KEY, así que tiene acceso total)
