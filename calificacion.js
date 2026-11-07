/* ============================================================================
   CALIFICACION.JS — Épica 5.2 (calificar la atención recibida)
   ----------------------------------------------------------------------------
   Selector de estrellas (1 a 5) con mensaje dinámico, y el envío de la
   calificación con su comentario opcional.

   Depende de: utilidades.js (mostrarToast).
============================================================================ */

let calificacionSeleccionada = 0;
const botonesEstrella = document.querySelectorAll("#contenedor-estrellas button");
const mensajesCalificacion = { 1: "Muy insatisfecho", 2: "Insatisfecho", 3: "Neutral", 4: "Satisfecho", 5: "Muy satisfecho" };

function pintarEstrellas(valor) {
  botonesEstrella.forEach(boton => {
    boton.querySelector("svg").classList.toggle("activa", Number(boton.dataset.valor) <= valor);
  });
}
botonesEstrella.forEach(boton => {
  boton.addEventListener("click", () => {
    calificacionSeleccionada = Number(boton.dataset.valor);
    pintarEstrellas(calificacionSeleccionada);
    document.getElementById("texto-calificacion").textContent = mensajesCalificacion[calificacionSeleccionada];
  });
});
document.getElementById("btn-enviar-calificacion").addEventListener("click", () => {
  if (calificacionSeleccionada === 0) { mostrarToast("Selecciona al menos una estrella.", "error"); return; }
  mostrarToast("¡Gracias por tu calificación!", "exito");
  document.getElementById("comentario-calificacion").value = "";
  calificacionSeleccionada = 0;
  pintarEstrellas(0);
  document.getElementById("texto-calificacion").textContent = "Toca una estrella para calificar";
});
