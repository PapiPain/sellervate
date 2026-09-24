# Sellervate CX Hub — Control de Calidad, Onboarding & Demostración

> **Tiempo efectivo de desarrollo:** ~4 horas y 45 minutos (dentro del límite estricto de 6 horas).

Plataforma interna para la gestión, auditoría y aseguramiento de calidad en soporte al cliente para marcas de comercio electrónico (*VoltScooters*, *EcoPack*, *Nordic Glow*).

---

## 📸 Capturas de Pantalla

### 1. Consola de Muestreo Diario y Auditoría (Team Lead)
![Consola de Auditoría](docs/screenshots/lead-audit.png)

> **Flujo Operativo Documentado en la Captura:**
> * **Identidad del Auditor:** La consola reconoce activamente al líder en turno (ej. *Marta Gómez* o *Nuria Fernández*), permitiéndole supervisar todas las marcas asignadas sin restricciones de lectura.
> * **Bandeja de Muestreo:** En el lateral izquierdo se organizan las respuestas enviadas por los especialistas, diferenciando de un vistazo los casos pendientes de evaluación de aquellos ya auditados con su respectiva calificación.
> * **Panel de Evaluación Activa:** Al seleccionar un ticket, el auditor revisa la consulta del cliente, la respuesta enviada y el contexto operativo para asignar la calificación (1 a 5), la bandera de diagnóstico y el feedback pedagógico firmado.

### 2. Flujo de Evaluación de Calidad (Scoring Cuantitativo y Diagnóstico Operativo)
![Flujo de Evaluación](docs/screenshots/audit-evaluation-flow.png)

> **Desacoplamiento de Métrica y Causa Raíz:**
> * **Puntaje Numérico (1 al 5):** Cuantifica la adherencia al estándar de servicio para alimentar las métricas globales del equipo y el cumplimiento de SLAs corporativos.
> * **Diagnóstico Operacional:** Clasifica el motivo exacto de la calificación (ej. *Impecable*, *Tono incorrecto*, *Sin historial de pedido*), permitiendo enviar los casos de estudio directamente a la Biblioteca de Formación y mapear las áreas de riesgo por marca.
> * **Retroalimentación Firmada:** Registro cualitativo obligatorio que queda vinculado permanentemente al identificador del líder auditor para garantizar transparencia y calibración de criterios.

### 3. Biblioteca Pedagógica y Filtrado por Marca (Training & Onboarding Problem)

| Vista Global: Todas las Marcas | Vista Aislada: Marca Específica y Guía de Tono |
| :---: | :---: |
| ![Biblioteca Global](docs/screenshots/coaching-library-all.png) | ![Biblioteca Filtrada](docs/screenshots/coaching-library-brand.png) |

> **Resolución del Problema de Onboarding:**
> * **Vista Global (Todas las marcas):** Agrupa automáticamente los casos auditados del sistema en dos secciones clave: *Respuestas Modelo (5/5)* y *Errores Críticos (≤ 2)*, permitiendo a los líderes capacitar a nuevos especialistas con lecciones reales sin tener que buscar tickets manualmente la noche anterior.
> * **Aislamiento y Contexto por Marca:** Al filtrar por una cuenta (ej. *EcoPack Solutions*), la biblioteca reduce los casos al contexto específico de ese cliente y despliega la **Guía de Voz y Tono Oficial**, asegurando que los agentes comprendan por qué una respuesta breve o técnica aplica a un cliente y desentona en otro.

### 4. Informe Ejecutivo para el Cliente (Resolución del "Proof Problem")
![Informe Ejecutivo para el Cliente](docs/screenshots/client-report.png)

> **Evidencia Cuantitativa y Mitigación Operativa:**
> * **Guía de Voz y Tono de la Marca:** Muestra las directrices operativas específicas en la cabecera (ej. la regla de oro de VoltScooters de diagnosticar cables, batería o códigos E01-E08 antes de tramitar garantías).
> * **Métricas Ejecutivas Clave:** Consolida el volumen del muestreo analizado, el promedio de calidad frente al SLA contractual (≥ 4.5), el recuento de respuestas impecables y el principal foco de mitigación detectado en el período.
> * **Distribución de Calidad por Diagnóstico:** Barras porcentuales ordenadas jerárquicamente por nivel de severidad, permitiendo demostrar con datos auditados las mejoras operativas trimestrales ante comités directivos.

Sigue estos pasos para clonar y levantar el proyecto en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/PapiPain/sellervate.git
cd sellervate

### 2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
Crea un archivo .env.local en la raíz del proyecto y añade tus credenciales de Supabase:

Fragmento de código
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

4. Inicializar base de datos y datos de prueba (Seed Data)
Ingresa a tu proyecto en Supabase y ve al SQL Editor.

Copia y ejecuta el contenido del script ubicado en supabase/schema.sql.

Esto generará las tablas relacionales (brands, users, support_replies, audit_reviews) y cargará 30 tickets contextuales distribuidos entre las 3 marcas y 3 especialistas.

5. Iniciar el servidor local
Bash
npm run dev
Abre en el navegador: http://localhost:3000.

👥 Cómo Probar y Cambiar de Rol (How to Switch Role)
El sistema cuenta con un selector de usuario en la barra superior para verificar el control de acceso en servidor:


Líderes de Equipo (Team Leads):

Selecciona a Marta Gómez o Nuria Fernández.

Acceso: Supervisión transversal de marcas, consola de auditoría activa, biblioteca pedagógica de coaching e informes ejecutivos de clientes.

Especialistas de Soporte:

Selecciona a Dani Rivas, Elena Torres o Carlos Morales.

Acceso: Vista personal restringida en servidor. Solo pueden visualizar sus propias respuestas enviadas y las notas/feedback firmados que recibieron de los líderes.


🛠️ Stack Tecnológico
Framework: Next.js 15 (App Router, Server Actions)

Lenguaje: TypeScript (Strict Mode)

Base de Datos: PostgreSQL vía Supabase

Estilos & UI: Tailwind CSS y DaisyUI

Diseño: Paleta ergonómica Light Clean (#F1F3F5) orientada a turnos prolongados de soporte.