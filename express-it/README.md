# Express IT Assistant

Userscript para Tampermonkey: inspector H5P para las lecciones de `expressit.edu.co`, con ventana arrastrable, efecto cristal y pegado asistido. Detecta las actividades H5P de la lección, muestra su contenido (incluidas las respuestas que traen configuradas) y permite copiarlas o pegarlas en los campos.

> **Proyecto independiente. No está afiliado ni respaldado por Express IT ni por ninguna institución educativa.**

---

## Instalación

1. Instala la extensión **Tampermonkey** en tu navegador.
2. Abre el archivo `.user.js` de este repositorio y pulsa **Instalar** cuando Tampermonkey te lo ofrezca.
3. Entra a una lección en `expressit.edu.co`. Debe aparecer el cuadro **"Ingresa tu key"**.

## Cómo conseguir tu key

1. En el cuadro, marca la casilla de **términos de uso** (la primera vez).
2. Pulsa **Obtener key**. Se abrirá un enlace de **Linkvertise**: completa los pasos.
3. Al terminar llegarás a una página con tu key y su fecha de vencimiento. Cópiala.
4. Pégala en el cuadro y pulsa **Verificar**.

Cómo funcionan las keys:
- Cada key es **única** y **dura 24 horas**. Luego debes conseguir otra.
- Cada key se **vincula al primer dispositivo/navegador** donde la uses y no funciona en otros.
- Si el servidor se reinicia, las keys pueden perderse. En ese caso solo consigue una nueva.
- El primer acceso puede tardar hasta un minuto si el servidor estaba inactivo.

## Qué datos se envían y se guardan

Al verificar tu key, el script envía al servidor:
- La **key** que pegaste.
- Un **identificador aleatorio de dispositivo**, generado en tu navegador (no contiene tu nombre ni tus datos).

El servidor guarda únicamente: la key, su fecha de creación y vencimiento, el identificador de dispositivo y el código de verificación de Linkvertise. **No guarda tu nombre, tus cuentas, tus respuestas ni el contenido de tus lecciones.** Ten en cuenta que el proveedor de hosting y Linkvertise pueden mantener sus propios registros técnicos (por ejemplo, direcciones IP) bajo sus propias políticas.

El script guarda en tu navegador (`localStorage`) tu key, tu identificador de dispositivo y la aceptación de estos términos.

## Términos de uso

Al instalar o usar este script aceptas lo siguiente:

1. **Uso bajo tu propia responsabilidad.** Eres el único responsable de cómo lo uses y de cumplir las normas de tu institución y de la plataforma. Antes de usarlo, revisa esas normas.
2. **Sin garantías.** Se ofrece "tal cual", sin garantía de funcionamiento, disponibilidad ni resultados. Puede dejar de funcionar en cualquier momento, por ejemplo si la plataforma cambia.
3. **Sin responsabilidad del autor.** El autor no responde por sanciones académicas, bloqueos o suspensiones de cuentas, pérdida de datos, calificaciones ni ningún otro perjuicio derivado de su uso.
4. **Keys personales.** Cada key es para un solo dispositivo. No se permite revenderlas, compartirlas masivamente ni intentar saltarse el sistema de keys.
5. **Anuncios de terceros.** Linkvertise muestra publicidad de terceros. Ten cuidado con lo que descargas o instalas desde esos anuncios; el autor no controla ese contenido.
6. **Cambios y retiro.** El autor puede modificar estos términos, desactivar keys o retirar el proyecto en cualquier momento. Si los términos cambian, se te volverá a pedir tu aceptación.
7. **Aceptación.** Marcar la casilla del script y usarlo implica que leíste y aceptas estos términos. Si no estás de acuerdo, desinstala el script.

## Problemas frecuentes

| Mensaje | Qué hacer |
|---|---|
| "Debes aceptar los términos de uso" | Marca la casilla antes de pulsar los botones. |
| "No se pudo conectar con el servidor" | Espera un minuto (el servidor puede estar despertando) y reintenta. |
| "Key expirada" | Consigue una nueva con **Obtener key**. |
| "Key usada en otro dispositivo" | La key solo funciona en el dispositivo donde se usó primero. |
| "Verificación fallida" (al llegar a la página de la key) | Vuelve a pasar por el enlace de Linkvertise completando todos los pasos. |
