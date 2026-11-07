/* ============================================================================
   RESULTADOS.JS — Épica 4 (resultados de laboratorio e historial clínico)
   ----------------------------------------------------------------------------
   Lista de resultados ya disponibles y el modal con el detalle de cada uno.

   Depende de: ninguno (es autónomo: define y pinta sus propios datos).
============================================================================ */

const resultados = [
  { nombre: "Cuadro Hemático completo", fecha: "10 de febrero de 2026", detalle: "<b>Hemoglobina:</b> 14.5 g/dL (normal)<br><b>Leucocitos:</b> 6.800/mm³ (normal)<br><b>Plaquetas:</b> 250.000/mm³ (normal)" },
  { nombre: "Perfil Lipídico (colesterol y triglicéridos)", fecha: "15 de enero de 2026", detalle: "<b>Colesterol total:</b> 180 mg/dL (óptimo)<br><b>LDL:</b> 95 mg/dL (óptimo)<br><b>Triglicéridos:</b> 110 mg/dL (normal)" },
];

function tarjetaResultado(resultado, indice) {
  return `<div class="card fila-lista"><div class="info"><strong>${resultado.nombre}</strong><span>Fecha: ${resultado.fecha}</span></div><button class="btn-mini" data-ver-resultado="${indice}">Ver resultado</button></div>`;
}
document.getElementById("contenedor-resultados").innerHTML = resultados.map(tarjetaResultado).join("");

document.getElementById("contenedor-resultados").addEventListener("click", (e) => {
  const boton = e.target.closest("[data-ver-resultado]");
  if (!boton) return;
  const resultado = resultados[Number(boton.dataset.verResultado)];
  document.getElementById("resultado-titulo").textContent = resultado.nombre;
  document.getElementById("resultado-fecha").textContent = "Fecha: " + resultado.fecha;
  document.getElementById("resultado-detalle").innerHTML = resultado.detalle;
  document.getElementById("overlay-resultado").classList.add("visible");
});
document.getElementById("btn-cerrar-resultado").addEventListener("click", () => {
  document.getElementById("overlay-resultado").classList.remove("visible");
});
