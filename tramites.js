/* ============================================================================
   TRAMITES.JS — Épica 3 (certificado de afiliación y radicación de órdenes)
   ----------------------------------------------------------------------------
   Descarga del certificado de afiliación (texto plano generado en el
   navegador) y el flujo de adjuntar + radicar una orden médica.

   Depende de: utilidades.js (descargarArchivoTexto, mostrarToast),
   servicio.js (generarFolioRadicacion), repositorios.js (pacienteActual).
============================================================================ */

document.getElementById("btn-descargar-certificado").addEventListener("click", () => {
  const contenido = `SALUD 360 — Certificado de Afiliación\n--------------------------------\nSe certifica que:\n${pacienteActual.nombre}\nidentificado con el correo ${pacienteActual.correo},\nse encuentra ACTIVO como afiliado de Salud 360\na la fecha ${new Date().toLocaleDateString("es-CO")}.\n--------------------------------\nDocumento simulado para el proyecto académico Salud 360\n(en una versión real, este archivo se generaría como PDF desde el servidor).`;
  descargarArchivoTexto(contenido, `certificado-afiliacion-${pacienteActual.id}.txt`);
  mostrarToast("Certificado descargado.", "exito");
});

const inputOrden = document.getElementById("input-orden");
const textoArchivoOrden = document.getElementById("texto-archivo-orden");
inputOrden.addEventListener("change", () => {
  textoArchivoOrden.textContent = inputOrden.files.length > 0 ? inputOrden.files[0].name : "Ningún archivo seleccionado";
});
document.getElementById("btn-radicar-orden").addEventListener("click", () => {
  if (inputOrden.files.length === 0) { mostrarToast("Primero adjunta el archivo de tu orden médica.", "error"); return; }
  document.getElementById("folio-radicacion").textContent = servicioSalud.generarFolioRadicacion();
  document.getElementById("overlay-radicacion").classList.add("visible");
});
document.getElementById("btn-cerrar-radicacion").addEventListener("click", () => {
  document.getElementById("overlay-radicacion").classList.remove("visible");
  inputOrden.value = "";
  textoArchivoOrden.textContent = "Ningún archivo seleccionado";
});
