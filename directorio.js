/* ============================================================================
   DIRECTORIO.JS — Épica 6.2 (sedes y urgencias)
   ----------------------------------------------------------------------------
   Búsqueda y filtrado del directorio de sedes: por texto (nombre o ciudad)
   y por tipo (sede / urgencias), combinados.

   Depende de: ninguno (es autónomo: define y pinta sus propios datos).
============================================================================ */

const sedes = [
  { nombre: "Salud 360 — Laureles", ciudad: "Medellín", tipo: "sede",      direccion: "Cra 76 # 33-40",     telefono: "604 444 1010" },
  { nombre: "Salud 360 — Centro",   ciudad: "Medellín", tipo: "sede",      direccion: "Cl 50 # 45-20",      telefono: "604 444 1020" },
  { nombre: "Urgencias Envigado",   ciudad: "Envigado",  tipo: "urgencias", direccion: "Cra 43A # 35-15",   telefono: "604 444 1030" },
  { nombre: "Salud 360 — Bello",    ciudad: "Bello",     tipo: "sede",      direccion: "Cl 30 # 50-12",     telefono: "604 444 1040" },
  { nombre: "Urgencias Itagüí",     ciudad: "Itagüí",    tipo: "urgencias", direccion: "Cra 52 # 70-30",    telefono: "604 444 1050" },
  { nombre: "Salud 360 — Sabaneta", ciudad: "Sabaneta",  tipo: "sede",      direccion: "Cl 77 Sur # 42-18", telefono: "604 444 1060" },
];

const contenedorSedes = document.getElementById("contenedor-sedes");
const mensajeSinResultados = document.getElementById("mensaje-sin-resultados");
const buscadorSedes = document.getElementById("buscador-sedes");
const chipsFiltro = document.querySelectorAll(".chip");
let filtroTipoActual = "todas";

function iconoTelefono() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 3a2 2 0 0 1-.4 2.1L8 10.1a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c1 .3 2 .5 3 .6a2 2 0 0 1 1.7 2z"/></svg>`;
}
function tarjetaSede(sede) {
  const esUrgencias = sede.tipo === "urgencias";
  return `<div class="card sede-card"><div class="fila-top"><h3>${sede.nombre}</h3><span class="pastilla ${sede.tipo}">${esUrgencias ? "Urgencias" : "Sede"}</span></div><p>${sede.direccion}, ${sede.ciudad}</p><span class="telefono">${iconoTelefono()} ${sede.telefono}</span></div>`;
}
function dibujarSedes() {
  const texto = buscadorSedes.value.trim().toLowerCase();
  const filtradas = sedes.filter(s =>
    (s.nombre.toLowerCase().includes(texto) || s.ciudad.toLowerCase().includes(texto)) &&
    (filtroTipoActual === "todas" || s.tipo === filtroTipoActual)
  );
  if (filtradas.length === 0) { contenedorSedes.innerHTML = ""; mensajeSinResultados.style.display = "block"; return; }
  mensajeSinResultados.style.display = "none";
  contenedorSedes.innerHTML = filtradas.map(tarjetaSede).join("");
}
buscadorSedes.addEventListener("input", dibujarSedes);
chipsFiltro.forEach(chip => chip.addEventListener("click", () => {
  chipsFiltro.forEach(c => c.classList.remove("active"));
  chip.classList.add("active");
  filtroTipoActual = chip.dataset.filtro;
  dibujarSedes();
}));
dibujarSedes();
