/* ============================================================================
   NAVEGACION.JS — el "caparazón" de la app ya con sesión iniciada
   ----------------------------------------------------------------------------
   Todo lo que no pertenece a una épica en particular, sino a la estructura
   general: el menú lateral, el reloj del topbar, el tema claro/oscuro, la
   campana de notificaciones y los accesos rápidos del dashboard.

   Depende de: utilidades.js (usa mostrarToast).
   De este archivo dependen: autenticacion.js llama a irAPantalla() al
   entrar; los demás archivos de pantallas no dependen de este.
============================================================================ */

/* ---------- RELOJ DEL TOPBAR ---------- */
const elFecha = document.getElementById("fecha-hoy");
function actualizarFecha() {
  elFecha.textContent = new Date().toLocaleDateString("es-CO", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });
}
actualizarFecha();
setInterval(actualizarFecha, 30000); // se repite cada 30s sin bloquear el resto de la app

/* ---------- TEMA CLARO / OSCURO (persistido en localStorage) ---------- */
const botonTema = document.getElementById("btn-tema");
const textoTema = document.getElementById("texto-tema");
const elementoHtml = document.documentElement;

function aplicarTema(tema) {
  elementoHtml.setAttribute("data-theme", tema);
  textoTema.textContent = tema === "dark" ? "Modo claro" : "Modo oscuro";
  localStorage.setItem("salud360-tema", tema);
}
aplicarTema(localStorage.getItem("salud360-tema") || "light");
botonTema.addEventListener("click", () => {
  aplicarTema(elementoHtml.getAttribute("data-theme") === "dark" ? "light" : "dark");
});

document.getElementById("campana-noti").addEventListener("click", () => {
  mostrarToast("No tienes notificaciones nuevas.");
});

/* ---------- NAVEGACIÓN ENTRE PANTALLAS (sidebar) ---------- */
const botonesMenu = document.querySelectorAll("nav.menu button");
const pantallas = document.querySelectorAll(".pantalla");
const tituloTopbar = document.getElementById("titulo-topbar");

function irAPantalla(idDestino, subtab) {
  pantallas.forEach(p => p.classList.remove("active"));
  botonesMenu.forEach(b => b.classList.remove("active"));
  document.getElementById(idDestino).classList.add("active");

  const boton = document.querySelector(`nav.menu button[data-destino="${idDestino}"]`);
  boton.classList.add("active");
  tituloTopbar.textContent = boton.textContent.trim();

  if (idDestino === "citas" && subtab) irASubtab(subtab); // definida en citas.js
  window.scrollTo({ top: 0, behavior: "smooth" });
}
botonesMenu.forEach(b => b.addEventListener("click", () => irAPantalla(b.dataset.destino)));

/* Delegación de eventos: un solo listener para todas las tarjetas de
   "accesos rápidos" del dashboard, aunque cada una lleve a un sitio distinto. */
document.getElementById("grid-accesos").addEventListener("click", (e) => {
  const tarjeta = e.target.closest(".acceso");
  if (tarjeta) irAPantalla(tarjeta.dataset.ir, tarjeta.dataset.subtab);
});
