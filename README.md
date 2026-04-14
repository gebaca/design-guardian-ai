### Instrucciones de Ejecución Local (Entregable 1)

## Clonar y Entrar:

Bash
git clone https://github.com/gebaca/design-guardian-ai.git
cd design-guardian-ai
Variables de Entorno:

Crea un archivo .env en la raíz.

Añade tu clave: VITE_GROQ_API_KEY=tu_clave_aqui.

## Instalar y Correr:

Bash
npm install
npm run dev
La aplicación estará disponible en http://localhost:5173.

### Vídeo de Demostración (Entregable 2)

El enlace al vídeo de 3 minutos explicando el funcionamiento técnico y la toma de decisiones se encuentra aquí:

https://www.loom.com/share/12cb0646aad14714adaa73469a10df15

### Prompt Log (Entregable 3)

1. Identificación de Pain Points (Metodología Gemba)
   Prompt: "Actúa como un Lead de Diseño con experiencia en metodologías Lean y Gemba. Necesito identificar puntos de fricción reales entre un diseñador de producto y un desarrollador frontend durante el 'handoff'. Genera 2 casuísticas detalladas de usuarios: uno que sufre por la inconsistencia de colores/espaciados y otro que pierde tiempo consultando Figma. Define sus 'pain points' y cómo una herramienta de IA validadora podría salvarles el día."

Explicación: Funcionó porque permitió entender el usuario antes de escribir una sola línea de código. Decidí utilizar esta metodología antes que otras ya que ayuda a encontrar la solución a la pérdida de tiempo real en equipos de producto.

2. Definición de Tokens y System Prompt Técnico
   Prompt: "Genera un archivo JSON que represente un 'System Design' simplificado. Después, genera un 'System Prompt' técnico para un LLM. Este prompt debe obligar a la IA a que cualquier componente React/Tailwind que genere utilice ÚNICAMENTE los tokens definidos en ese JSON, rechazando cualquier valor arbitrario de CSS."

Explicación: necesitaba "obligar" a la IA a ser restrictiva, logrando que el código generado fuera 100% fiel al prompt, eliminando la posibilidad de introducir valores hardcodeados los cuales generan muchos problemas en etapa prooducción.

3. Generación del Dashboard Profesional
   Prompt: "Crea una aplicación con React y Tailwind CSS. La interfaz debe ser un dashboard para desarrolladores con tres paneles: a la izquierda un editor para un design-system.json, en el centro un chat de IA, y a la derecha un canvas de previsualización. Usa una estética profesional."

Explicación: Este prompt definió la arquitectura visual (los tres paneles). Funcionó porque separó claramente las responsabilidades de la interfaz, permitiendo que el usuario vea el código, hable con la IA y vea el resultado de forma simultánea y fluida.
