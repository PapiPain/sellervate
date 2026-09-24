-- 1. Tabla de Usuarios (Team Leads y Especialistas)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('team_lead', 'specialist')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Marcas
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tone_guidelines TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Asignación de Marcas a Usuarios
CREATE TABLE IF NOT EXISTS user_brands (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, brand_id)
);

-- 4. Respuestas de soporte (El material a auditar)
CREATE TABLE IF NOT EXISTS replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
  specialist_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  customer_query TEXT NOT NULL,
  specialist_reply TEXT NOT NULL,
  ticket_context TEXT,
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Revisiones / Auditorías de calidad hechas por Team Leads
CREATE TABLE IF NOT EXISTS audit_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reply_id UUID REFERENCES replies(id) ON DELETE CASCADE NOT NULL UNIQUE,
  auditor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  flag TEXT CHECK (flag IN ('too_slow', 'wrong_tone', 'wrong_question', 'unresolved_risk', 'flawless')),
  feedback TEXT NOT NULL,
  reviewed_at TIMESTAMPTZ DEFAULT now()
);

-- DATOS SEMILLA (Seed Data)
-- Insertar usuarios según las notas de Sellervate
INSERT INTO users (id, name, email, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Marta', 'marta@sellervate.com', 'team_lead'),
  ('22222222-2222-2222-2222-222222222222', 'Nuria', 'nuria@sellervate.com', 'team_lead'),
  ('33333333-3333-3333-3333-333333333333', 'Dani', 'dani@sellervate.com', 'specialist'),
  ('44444444-4444-4444-4444-444444444444', 'Carlos', 'carlos@sellervate.com', 'specialist'),
  ('55555555-5555-5555-5555-555555555555', 'Elena', 'elena@sellervate.com', 'specialist')
ON CONFLICT (id) DO NOTHING;

-- Insertar marcas (Scooters técnicos vs Empaques rápidos)
INSERT INTO brands (id, name, tone_guidelines) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'VoltScooters', 'Técnico y metódico. Diagnosticar el problema antes de ofrecer devolución.'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'PackFast Logistics', 'Rápido, exacto y de 3 líneas máximo. Enfoque directo.')
ON CONFLICT (id) DO NOTHING;

-- Asignaciones: Marta cubre ambas marcas de ejemplo, Dani y Carlos son especialistas
INSERT INTO user_brands (user_id, brand_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT DO NOTHING;

-- Insertar respuestas de soporte creíbles
INSERT INTO replies (id, brand_id, specialist_id, customer_query, specialist_reply, ticket_context) VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    'Mi scooter no enciende después de cargarlo toda la noche.',
    'Lamento el inconveniente. Por favor indíquenos su dirección para tramitar la devolución de inmediato.',
    'Cliente compró hace 5 días. No se realizó verificación de batería ni fusible.'
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '44444444-4444-4444-4444-444444444444',
    'El freno trasero hace un chirrido metálico al frenar fuerte.',
    'Hola Marcos. Antes de tramitar cualquier cambio, ¿podrías verificar si la zapata tiene residuos acumulados? Te adjunto la guía de ajuste en 2 pasos.',
    'Soporte técnico estándar. Respuesta con diagnóstico previo según manual.'
  ),
  (
    'b1111111-1111-1111-1111-111111111111',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '33333333-3333-3333-3333-333333333333',
    'Necesito confirmar las medidas exactas de la caja estándar M.',
    'Hola. Las medidas son 35x25x20 cm con resistencia de hasta 15 kg. Despachamos en 24 horas hábiles.',
    'Consulta de catálogo estándar.'
  )
ON CONFLICT (id) DO NOTHING;

-- Insertar auditorías previas
INSERT INTO audit_reviews (reply_id, auditor_id, score, flag, feedback) VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    2,
    'wrong_tone',
    'Ofreciste devolución sin antes pedir comprobación del conector ni diagnóstico básico. En VoltScooters primero diagnosticamos.'
  )
ON CONFLICT (reply_id) DO NOTHING;