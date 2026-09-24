# DECISIONS.md — Decisiones del Proyecto

## 1. Producto y Enfoque del Problema

* **Entender antes de programar:** Lo primero que hice fue leer el PDF una y otra vez. Tenía que comprender muy bien qué se necesitaba exactamente antes de tirar una sola línea de código, porque si no entendía el problema real, no podía hacer nada.
* **Primero la funcionalidad:** Me enfoqué en que las funciones principales sirvieran bien desde el inicio, que es lo más importante de la prueba. 
* **No es un simple listado CRUD:** En vez de hacer una tabla común y corriente de registros, dividí el sistema en tres modos de trabajo bien diferenciados:
  1. *Muestreo diario:* Para que los líderes de equipo revisen y califiquen las respuestas del día a día.
  2. *Biblioteca pedagógica:* Para enseñar a la gente nueva que entra al equipo, mostrando ejemplos de lo que está bien hecho y de los errores críticos, para que el líder no tenga que buscar ejemplos la noche anterior.
  3. *Reporte ejecutivo para marcas:* Un panel que muestra con barras y porcentajes qué cosas se están haciendo bien y en qué se está fallando. También resume cómo debe hablar cada marca (por ejemplo, respuestas cortas de tres líneas para una empresa, o respuestas más detalladas y amables para otra).

---

## 2. Aislamiento por Rol y Servidor

* **Separación clara entre Especialistas y Líderes:**
  * **Los Especialistas:** Tienen su espacio privado. Ningún especialista puede ver las notas, respuestas ni comentarios que recibieron los demás compañeros. Cada quien solo ve lo suyo, y esta regla se asegura directamente desde el servidor para que nadie pueda saltársela desde el navegador.
  * **Los Líderes de Equipo (Team Leads):** Pueden ver todas las marcas y supervisar todo el trabajo de los especialistas. Además, un líder puede ver lo que evaluó y comentó el otro líder para que los dos mantengan el mismo criterio de calidad.
* **Base de datos relacional:** Se organizó con tablas en SQL conectadas de forma ordenada (marcas, usuarios, respuestas y auditorías) para que todo funcione con fluidez y sin desorden.

---

## 3. Ingeniería Asistida y Correcciones Manuales

* **Uso de la IA y control humano:** Me apoyé en la IA para avanzar rápido con la estructura inicial, pero todo el orden, la lógica de cómo se conectan las cosas y las decisiones las fui guiando y corrigiendo yo mismo.
* **Más datos de prueba:** Los datos que venían inicialmente eran muy pocos, así que aumenté la cantidad de respuestas y tickets para que las barras, porcentajes y promedios tuvieran sentido real y no se vieran vacíos.
* **Diseño pensado para jornadas largas:** Cambié los colores y mejoré el tipo de letra. Como los líderes y los especialistas trabajan jornadas completas de 8 horas frente a la pantalla, una interfaz muy oscura o con colores chillones cansa la vista. Por eso cambié a un diseño claro, limpio y cómodo para trabajar muchas horas seguidas sin fatiga visual.

---

## 4. Estado de la Entrega y Deuda Técnica

* **Lo que quedó listo y funcionando al 100%:**
  * **Aislamiento estricto por servidor y privacidad operativa:** 
    * El especialista solo ve sus propios casos. Está bloqueado a nivel de backend para que no pueda acceder al menú de los líderes ni ver las notas o comentarios de los otros especialistas. Esto no es solo por seguridad técnica, sino por cuidar el ambiente de trabajo: si un agente comete un error y recibe una calificación baja o una corrección, no debe ser expuesto frente a sus compañeros para evitar momentos incómodos o desmotivación.
  * **Colaboración y calibración entre Líderes:** 
    * Cuando entras como Team Lead, las tres pantallas funcionan completamente conectadas. Los líderes pueden auditar, dejar feedback formal y ver lo que el otro líder comentó y calificó en cada ticket, logrando que ambos mantengan siempre el mismo estándar de exigencia.
  * **Reportes ejecutivos basados en datos reales:** 
    * Se agregaron suficientes datos para que las tres marcas reflejen métricas y barras de porcentaje verosímiles según las reglas de comunicación de cada empresa.

* **Deuda técnica y lo que me gustaría agregar a futuro:**
  * **Asistente de respuestas con IA para el especialista:** 
    * Cuando el especialista no quiera escribir todo desde cero o para agilizar el tiempo de respuesta, una IA sugerirá un borrador. El humano simplemente lo lee, comprueba que cumpla con el tono y decide con un clic si lo envía, lo edita o lo descarta.
  * **Retroalimentación inteligente de casos (IA Coach):** 
    * Que la IA analice cada respuesta emitida, tanto las de 5 estrellas (para explicar por qué salieron bien) como los casos negativos, indicando el paso a paso exacto de lo que se debió hacer.
  * **Adaptación de estrategia por marca según contexto:** 
    * Si una plantilla o respuesta funcionó perfecto para una tienda pero en otra generó reclamos, la IA debe reestructurar el mensaje según el manual del cliente. Al final, el comprador final piensa que está hablando directamente con la marca oficial y no con una agencia externa; por eso cada respuesta tiene que entregar una solución real y cuidar la reputación de la empresa.
  * **Automatización de tickets:** 
    * Conectar la plataforma directamente mediante webhooks a Zendesk o Gorgias para que los mensajes entren en tiempo real sin requerir carga manual.