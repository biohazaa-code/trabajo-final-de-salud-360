/* ============================================================================
   UTILIDADES.JS — funciones genéricas de interfaz, usadas por varias pantallas
   ----------------------------------------------------------------------------
   Nada de esto es "negocio": son herramientas de UI (mostrar un toast, marcar
   un campo en rojo, sacar las iniciales de un nombre, generar un archivo de
   texto descargable). Se cargan temprano porque casi todos los demás
   archivos las usan.

   No depende de ningún otro archivo propio de la app.
   De este archivo dependen: prácticamente todos los demás js/*.js.
============================================================================ */

/* ---------- TOASTS (notificaciones flotantes) ---------- */
const contenedorToasts = document.getElementById("contenedor-toasts");

function mostrarToast(mensaje, tipo = "") {
  const toast = document.createElement("div");       // 1. crea el nodo en memoria
  toast.className = "toast" + (tipo ? " " + tipo : "");
  toast.textContent = mensaje;                        // 2. le pone el texto
  contenedorToasts.appendChild(toast);                // 3. lo inserta en el DOM
  setTimeout(() => toast.remove(), 3800);             // 4. lo retira solo, tras un tiempo
}

/* ---------- VALIDACIÓN VISUAL DE FORMULARIOS ---------- */
function marcarError(idCampo, mostrar) {
  document.getElementById(idCampo).classList.toggle("con-error", mostrar);
}

/* ---------- INICIALES DE UN NOMBRE (para el avatar) ---------- */
function iniciales(nombre) {
  return nombre.split(" ").filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join("");
}

/* ---------- DESCARGA DE ARCHIVOS DE TEXTO (comprobantes, certificados) ----------
   Construye el archivo en el navegador con un Blob y dispara su descarga
   con un <a download> temporal. En una versión real esto llegaría como PDF
   generado por un servidor; aquí se simula como .txt porque no se usó
   ninguna librería de PDF en clase. */
function descargarArchivoTexto(contenido, nombreArchivo) {
  const archivo = new Blob([contenido], { type: "text/plain" });
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(archivo);
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}
