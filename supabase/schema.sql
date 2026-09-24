-- Reiniciar esquema
DROP TABLE IF EXISTS audit_reviews CASCADE;
DROP TABLE IF EXISTS replies CASCADE;
DROP TABLE IF EXISTS brand_assignments CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Tabla de Usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('team_lead', 'specialist')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Marcas
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    tone_guidelines TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Asignaciones Multimarca
CREATE TABLE brand_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, brand_id)
);

-- 4. Respuestas de Soporte
CREATE TABLE replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    specialist_id UUID REFERENCES users(id) ON DELETE CASCADE,
    customer_query TEXT NOT NULL,
    specialist_reply TEXT NOT NULL,
    ticket_context TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Revisiones de Auditoría de Calidad
CREATE TABLE audit_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reply_id UUID UNIQUE REFERENCES replies(id) ON DELETE CASCADE,
    auditor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
    flag VARCHAR(50) NOT NULL CHECK (flag IN (
        'flawless',
        'wrong_tone',
        'no_order_history_check',
        'wrong_question',
        'too_slow',
        'technically_correct_poor_retention'
    )),
    feedback TEXT NOT NULL,
    reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS y políticas permisivas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read users" ON users FOR SELECT USING (true);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read brands" ON brands FOR SELECT USING (true);

ALTER TABLE brand_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read brand_assignments" ON brand_assignments FOR SELECT USING (true);

ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read replies" ON replies FOR SELECT USING (true);

ALTER TABLE audit_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read audit_reviews" ON audit_reviews FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update audit_reviews" ON audit_reviews FOR ALL USING (true);

-- ==========================================
-- DATOS SEMILLA (SEED DATA)
-- ==========================================

-- Usuarios (IDs fijos)
INSERT INTO users (id, name, email, role) VALUES
('11111111-1111-1111-1111-111111111111', 'Marta Gómez', 'marta@sellervate.com', 'team_lead'),
('22222222-2222-2222-2222-222222222222', 'Nuria Fernández', 'nuria@sellervate.com', 'team_lead'),
('33333333-3333-3333-3333-333333333333', 'Dani Romero', 'dani@sellervate.com', 'specialist'),
('44444444-4444-4444-4444-444444444444', 'Carlos Mendoza', 'carlos@sellervate.com', 'specialist'),
('55555555-5555-5555-5555-555555555555', 'Elena Vega', 'elena@sellervate.com', 'specialist');

-- 3 Marcas
INSERT INTO brands (id, name, tone_guidelines) VALUES
('aaaa1111-1111-1111-1111-111111111111', 'VoltScooters', 'Tono técnico, resolutivo y profesional. Regla de oro: diagnosticar siempre el problema físico o de firmware (cables, batería, códigos de error en pantalla E01-E08) antes de ofrecer reemplazos o devoluciones.'),
('bbbb2222-2222-2222-2222-222222222222', 'EcoPack Solutions', 'Tono B2B directo, rápido y sumamente conciso (máximo 3-4 líneas). Respuestas directas sobre dimensiones, gramaje, tiempos de entrega y lotes mínimos. Sin rodeos introductorios innecesarios.'),
('cccc3333-3333-3333-3333-333333333333', 'Nordic Glow', 'Tono cálido, empático y orientado al bienestar. Foco en la experiencia sensorial de los productos de cosmética, agradeciendo al cliente y ofreciendo consejos de uso complementarios.');

-- Asignaciones de Marca
INSERT INTO brand_assignments (user_id, brand_id) VALUES
('11111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111'),
('11111111-1111-1111-1111-111111111111', 'bbbb2222-2222-2222-2222-222222222222'),
('11111111-1111-1111-1111-111111111111', 'cccc3333-3333-3333-3333-333333333333'),
('22222222-2222-2222-2222-222222222222', 'aaaa1111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222222222', 'bbbb2222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333333', 'aaaa1111-1111-1111-1111-111111111111'),
('33333333-3333-3333-3333-333333333333', 'bbbb2222-2222-2222-2222-222222222222'),
('44444444-4444-4444-4444-444444444444', 'aaaa1111-1111-1111-1111-111111111111'),
('44444444-4444-4444-4444-444444444444', 'cccc3333-3333-3333-3333-333333333333'),
('55555555-5555-5555-5555-555555555555', 'bbbb2222-2222-2222-2222-222222222222'),
('55555555-5555-5555-5555-555555555555', 'cccc3333-3333-3333-3333-333333333333');

-- 30 Respuestas de Soporte (con UUIDs hexadecimales válidos 0-9, a-f)
INSERT INTO replies (id, brand_id, specialist_id, customer_query, specialist_reply, ticket_context, sent_at) VALUES
-- DANI (10 respuestas)
('a1010000-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 
 'Mi scooter GT-500 no acelera tras una frenada brusca, en la pantalla parpadea E03.', 
 'Lamentamos mucho la falla. Parece que el controlador se dañó; si nos envías el comprobante te procesamos el reembolso inmediato.', 
 'El especialista ofreció reembolso directo ignorando el manual que indica que E03 es bloqueo del sensor de freno desajustado.', 
 NOW() - INTERVAL '1 day 4 hours'),

('a1010000-0000-0000-0000-000000000002', 'aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 
 '¿Cómo puedo calibrar la presión adecuada de los neumáticos con cámara del Pro V2?', 
 'Hola Marcos. La presión sugerida de fábrica es de 45 a 50 PSI para un conductor de hasta 85 kg. Recomendamos verificarla en frío una vez por semana con la válvula incluida.', 
 'Respuesta precisa y técnica siguiendo el manual.', 
 NOW() - INTERVAL '1 day 3 hours'),

('a1010000-0000-0000-0000-000000000003', 'bbbb2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 
 'Necesito cotización urgente para 5000 cajas autoarmables Kraft calibre 24.', 
 'Hola, gracias por contactar a la familia de EcoPack, esperamos que tu día esté lleno de bendiciones y éxitos en tus metas comerciales. El costo por millar es $420...', 
 'Tono sumamente informal y dilatado para un cliente B2B de empaques.', 
 NOW() - INTERVAL '1 day 2 hours'),

('a1010000-0000-0000-0000-000000000004', 'bbbb2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 
 '¿Tienen entrega en 24 horas para bolsas compostables tamaño M en Valencia?', 
 'Lotes disponibles para despacho hoy mismo si confirmas antes de las 14:00h. Entrega estimada: 24h hábiles por GLS Express.', 
 'Conciso y exacto.', 
 NOW() - INTERVAL '22 hours'),

('a1010000-0000-0000-0000-000000000005', 'aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 
 'El cargador tiene la luz verde fija pero la batería marca 0% al conectar.', 
 'Por favor desconecta el scooter y revisa la patilla central del puerto de carga. Si está doblada o sucia, no hará contacto aunque el cargador reciba corriente.', 
 'Diagnóstico guiado correcto.', 
 NOW() - INTERVAL '20 hours'),

('a1010000-0000-0000-0000-000000000006', 'bbbb2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 
 '¿El fleje biodegradable soporta pallets de 800 kg?', 
 'Carga máxima recomendada: 450 kg por tensión estándar. Para pallets de 800 kg requerirías doble envoltura o modelo reforzado EcoTough.', 
 'Dato técnico exacto.', 
 NOW() - INTERVAL '18 hours'),

('a1010000-0000-0000-0000-000000000007', 'aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 
 '¿Puedo mojar el scooter bajo lluvia moderada?', 
 'El modelo cuenta con certificación IPX5 contra salpicaduras, pero no se recomienda circular por charcos profundos para proteger la placa controladora.', 
 'Respuesta preventiva clara.', 
 NOW() - INTERVAL '16 hours'),

('a1010000-0000-0000-0000-000000000008', 'bbbb2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 
 '¿El pedido #48291 ya salió del almacén central?', 
 'Su pedido está en preparación.', 
 'No revisó el panel de envíos donde figuraba que estaba retenido por falta de código postal.', 
 NOW() - INTERVAL '14 hours'),

('a1010000-0000-0000-0000-000000000009', 'aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 
 '¿Cómo cambio la velocidad máxima de 20 a 25 km/h?', 
 'Debes ingresar a la app VoltConnect, vincular vía Bluetooth y desactivar el modo Eco en la pestaña Rendimiento.', 
 'Instrucciones claras.', 
 NOW() - INTERVAL '12 hours'),

('a1010000-0000-0000-0000-000000000010', 'bbbb2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 
 '¿Cuál es el grosor del film alveolar reciclado?', 
 'Espesor: 60 micras. Disponible en bobinas de 1,20 x 150 metros.', 
 'Respuesta técnica de 2 líneas.', 
 NOW() - INTERVAL '10 hours'),

-- CARLOS (10 respuestas)
('a1010000-0000-0000-0000-000000000011', 'aaaa1111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 
 'Se me apagó en una cuesta empinada y no enciende de inmediato.', 
 'Eso sucede porque es un scooter básico sin potencia suficiente para cuestas. Debiste comprar la versión Pro.', 
 'Tono despectivo y culpabilizador hacia la compra del cliente.', 
 NOW() - INTERVAL '1 day 5 hours'),

('a1010000-0000-0000-0000-000000000012', 'cccc3333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 
 'El sérum de noche me causa un ligero cosquilleo en las mejillas los primeros minutos.', 
 '¡Hola Sofía! Gracias por compartirlo. El sérum contiene un 5% de ácido glicólico puro, por lo que una sensación de cosquilleo leve es normal al inicio. Te sugerimos aplicarlo noche por medio mientras tu piel se adapta.', 
 'Tono empático y recomendación cosmética impecable.', 
 NOW() - INTERVAL '1 day 2 hours'),

('a1010000-0000-0000-0000-000000000013', 'aaaa1111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 
 '¿Cómo ajusto el disco de freno si roza con la pastilla?', 
 'Afloja ligeramente los dos tornillos Allen del caliper, presiona la maneta de freno para centrarlo y aprieta alternadamente.', 
 'Guía de reparación perfecta.', 
 NOW() - INTERVAL '23 hours'),

('a1010000-0000-0000-0000-000000000014', 'cccc3333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 
 '¿El bálsamo labial contiene cera de abejas o es 100% vegano?', 
 'Hola Clara, toda nuestra línea Nordic Glow es 100% vegana certificada. Usamos ceras vegetales de candelilla y jojoba orgánica.', 
 'Claro y alineado con los valores de marca.', 
 NOW() - INTERVAL '21 hours'),

('a1010000-0000-0000-0000-000000000015', 'aaaa1111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 
 'El display muestra E07 al acelerar a fondo.', 
 'E07 indica fallo en la comunicación del sensor Hall del motor. Verifica el conector hermético ubicado en el eje trasero.', 
 'Diagnóstico certero.', 
 NOW() - INTERVAL '19 hours'),

('a1010000-0000-0000-0000-000000000016', 'cccc3333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 
 '¿Cuánto tarda el envío estándar de la crema hidratante?', 
 'Tarda de 3 a 5 días laborables.', 
 'Respuesta seca, sin calidez de marca.', 
 NOW() - INTERVAL '17 hours'),

('a1010000-0000-0000-0000-000000000017', 'aaaa1111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 
 '¿Tienen stock de la batería extendida de 48V?', 
 'El lote ingresa a aduana este viernes y estará disponible en tienda el lunes 28.', 
 'Fecha precisa.', 
 NOW() - INTERVAL '15 hours'),

('a1010000-0000-0000-0000-000000000018', 'cccc3333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 
 '¿El tónico facial huele muy fuerte a flores?', 
 'No tiene fragancias sintéticas añadidas; su aroma proviene del hidrolato de aciano y lavanda alpina.', 
 'Buena explicación de producto.', 
 NOW() - INTERVAL '13 hours'),

('a1010000-0000-0000-0000-000000000019', 'aaaa1111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 
 'El manillar tiene juego hacia adelante y atrás.', 
 'Ajusta el tornillo central del mecanismo de plegado con llave de 10mm hasta que la palanca cierre con firmeza.', 
 'Procedimiento de seguridad adecuado.', 
 NOW() - INTERVAL '11 hours'),

('a1010000-0000-0000-0000-000000000020', 'cccc3333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 
 '¿En qué orden aplico el tónico, el sérum y la crema?', 
 'Primero limpias la piel, luego aplicas el tónico ligero, sigues con el sérum concentrado y sellas con la crema.', 
 'Rutina bien guiada.', 
 NOW() - INTERVAL '9 hours'),

-- ELENA (10 respuestas)
('a1010000-0000-0000-0000-000000000021', 'bbbb2222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 
 'Mi paquete de sobres acolchados llegó abierto y faltan unidades.', 
 'Debe reclamarle directamente a la empresa de mensajería porque nosotros despachamos todo sellado desde fábrica.', 
 'Cierre de ticket abrupto sin revisar historial de reclamos previos del cliente.', 
 NOW() - INTERVAL '1 day 6 hours'),

('a1010000-0000-0000-0000-000000000022', 'cccc3333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 
 '¿Tienen muestras gratuitas para pieles con rosácea antes de comprar el kit completo?', 
 '¡Hola Lucía! Qué alegría saludarte. Por supuesto, con cualquier pedido de prueba incluimos 2 sachets de nuestra crema calmante de avena nórdica ideal para piel reactiva.', 
 'Cálido, empático y con tono exacto.', 
 NOW() - INTERVAL '1 day 1 hour'),

('a1010000-0000-0000-0000-000000000023', 'bbbb2222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 
 '¿Tienen ficha técnica descargable de la cinta adhesiva de papel engomado?', 
 'Ficha técnica adjunta en PDF: gramaje 70g/m2, adhesivo de almidón activable por agua.', 
 'Exacto y rápido.', 
 NOW() - INTERVAL '22 hours'),

('a1010000-0000-0000-0000-000000000024', 'cccc3333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 
 '¿La mascarilla purificante se usa de día o de noche?', 
 'Recomendamos usarla de noche, una o dos veces por semana tras la limpieza, dejándola actuar 10 minutos.', 
 'Recomendación clara.', 
 NOW() - INTERVAL '20 hours'),

('a1010000-0000-0000-0000-000000000025', 'bbbb2222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 
 '¿Cuál es el pedido mínimo para cajas personalizadas con logotipo?', 
 'Pedido mínimo de 500 unidades para impresión a 1 tinta. Tiempo de clichés: 4 días laborables.', 
 'Respuesta concisa B2B.', 
 NOW() - INTERVAL '18 hours'),

('a1010000-0000-0000-0000-000000000026', 'cccc3333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 
 '¿El protector solar deja residuo blanco en la piel bronceada?', 
 '¡Para nada! Su fórmula mineral micronizada se absorbe al instante sin efecto blanquecino ni brillo graso.', 
 'Alineado con el producto.', 
 NOW() - INTERVAL '16 hours'),

('a1010000-0000-0000-0000-000000000027', 'bbbb2222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 
 '¿Emiten factura con recargo de equivalencia?', 
 'Sí, indícalo en las observaciones del checkout junto con tu NIF y emitimos la factura rectificada en 24h.', 
 'Resolutivo y conciso.', 
 NOW() - INTERVAL '14 hours'),

('a1010000-0000-0000-0000-000000000028', 'cccc3333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 
 '¿El contorno de ojos reduce las bolsas por falta de sueño?', 
 'Contiene cafeína botánica y extracto de té verde nórdico que drenan la zona ocular en 15 minutos.', 
 'Respuesta técnica de producto.', 
 NOW() - INTERVAL '12 hours'),

('a1010000-0000-0000-0000-000000000029', 'bbbb2222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 
 '¿Pueden fabricar esquineras de cartón de 2 metros de largo?', 
 'Medidas estándar hasta 1,60m. Para 2 metros se cotiza bajo pedido especial con mínimo de 2000 metros lineales.', 
 'Preciso y rápido.', 
 NOW() - INTERVAL '8 hours'),

('a1010000-0000-0000-0000-000000000030', 'cccc3333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 
 '¿El frasco de vidrio es reciclable o retornable?', 
 'Todos nuestros envases son de vidrio ámbar 100% reciclable en el contenedor verde local.', 
 'Respuesta orientada a la sostenibilidad.', 
 NOW() - INTERVAL '6 hours');

-- 5 Auditorías Iniciales
INSERT INTO audit_reviews (id, reply_id, auditor_id, score, flag, feedback, reviewed_at) VALUES
-- 1. Marta audita a Dani en VoltScooters
('a1111111-1111-1111-1111-111111111111', 'a1010000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 
 1, 'technically_correct_poor_retention', 
 'Error operacional grave. Para VoltScooters la regla de oro es diagnosticar el código en pantalla antes de prometer reembolsos. E03 suele ser solo un sensor flojo.', 
 NOW() - INTERVAL '18 hours'),

-- 2. Marta audita a Dani en EcoPack
('a2222222-2222-2222-2222-222222222222', 'a1010000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 
 2, 'wrong_tone', 
 'Tono inadecuado. EcoPack es un cliente industrial B2B. Saludos informales y extensos molestan al comprador. La respuesta debe ser de 3 líneas con precio y lote.', 
 NOW() - INTERVAL '16 hours'),

-- 3. Nuria audita a Carlos en VoltScooters
('a3333333-3333-3333-3333-333333333333', 'a1010000-0000-0000-0000-000000000011', '22222222-2222-2222-2222-222222222222', 
 1, 'wrong_tone', 
 'Inaceptable culpar al cliente por su compra. El apagado en subida es protección térmica del BMS, debiste explicar el procedimiento de enfriamiento con calma.', 
 NOW() - INTERVAL '15 hours'),

-- 4. Nuria audita a Carlos en Nordic Glow
('a4444444-4444-4444-4444-444444444444', 'a1010000-0000-0000-0000-000000000012', '22222222-2222-2222-2222-222222222222', 
 5, 'flawless', 
 'Ejemplo excelente. Explicación empática del activo cosmético y consejo de frecuencia de uso. Ideal para incluir en la biblioteca de onboarding.', 
 NOW() - INTERVAL '14 hours'),

-- 5. Marta audita a Elena en EcoPack
('a5555555-5555-5555-5555-555555555555', 'a1010000-0000-0000-0000-000000000021', '11111111-1111-1111-1111-111111111111', 
 1, 'no_order_history_check', 
 'Cerramos un ticket enviando al cliente al transportista sin mirar que ya era su segundo envío afectado. Este tipo de respuestas hace que perdamos cuentas corporativas.', 
 NOW() - INTERVAL '12 hours');