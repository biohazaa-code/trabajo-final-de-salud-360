/* ============================================================================
   CITAS.JS — Épica 1 (agendar, ver y cancelar citas médicas)
   ----------------------------------------------------------------------------
   El corazón de la app: elegir especialidad, elegir médico, consultar su
   agenda real (simulada con Promise + async/await) y agendar una cita en
   un horario disponible. También lleva el listado de "Mis citas" y su
   cancelación.

   Depende de: utilidades.js, servicio.js, repositorios.js (pacienteActual),
   navegacion.js (irASubtab se usa desde aquí mismo, pero irAPantalla desde
   navegacion.js puede llamar a irASubtab definida abajo).
============================================================================ */

/* ---------- SUBTABS DE LA PANTALLA "MIS CITAS" ---------- */
function irASubtab(nombre) {
  document.querySelectorAll(".subtabs button").forEach(b => b.classList.toggle("active", b.dataset.subtab === nombre));
  document.querySelectorAll(".subpantalla").forEach(s => s.classList.toggle("active", s.id === `subtab-${nombre}`));
}
document.querySelectorAll(".subtabs button").forEach(b => b.addEventListener("click", () => irASubtab(b.dataset.subtab)));

/* ---------- MÉDICOS DISPONIBLES POR ESPECIALIDAD ---------- */
const medicos = [
  { id: "MED-01", nombre: "Dra. Laura Jiménez",    especialidad: "Medicina General", sede: "Salud 360 — Laureles" },
  { id: "MED-02", nombre: "Dr. Santiago Restrepo", especialidad: "Medicina General", sede: "Salud 360 — Centro" },
  { id: "MED-03", nombre: "Dra. Camila Ortiz",     especialidad: "Pediatría",        sede: "Salud 360 — Bello" },
  { id: "MED-04", nombre: "Dr. Andrés Castaño",    especialidad: "Ginecología",      sede: "Salud 360 — Sabaneta" },
  { id: "MED-05", nombre: "Dra. Valentina Ríos",   especialidad: "Odontología",      sede: "Salud 360 — Laureles" },
  { id: "MED-06", nombre: "Dr. Felipe Gómez",      especialidad: "Dermatología",     sede: "Salud 360 — Centro" },
];

let medicoSeleccionado = null;
let slotSeleccionado = null; // { fecha, hora }

/* Simula la llamada a un servidor que calcula la agenda del médico: el
   setTimeout representa la latencia de red (un callback asíncrono), y
   "resolve(dias)" entrega el resultado cuando está listo. Al envolverlo en
   una Promise, quien la usa puede escribir "await obtenerAgendaMedico(...)"
   en vez de anidar el callback a mano. */
function obtenerAgendaMedico(idMedico) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const nombresDia = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
      const horasPosibles = ["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"];
      const hoy = new Date();
      const dias = [];
      for (let i = 1; i <= 4; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + i);
        dias.push({
          fecha: fecha.toISOString().slice(0, 10),
          etiqueta: `${nombresDia[fecha.getDay()]} ${fecha.getDate()}`,
          horas: horasPosibles.filter(() => Math.random() > 0.4),
        });
      }
      resolve(dias);
    }, 700);
  });
}

function dibujarMedicos() {
  const especialidad = document.getElementById("agendar-especialidad").value;
  const filtrados = medicos.filter(m => m.especialidad === especialidad);
  document.getElementById("lista-medicos").innerHTML = filtrados.map(m => `
    <button type="button" class="tarjeta-medico" data-medico="${m.id}">
      <strong>${m.nombre}</strong>
      <span>${m.sede}</span>
    </button>`).join("");
  reiniciarSeleccionCita();
}
document.getElementById("agendar-especialidad").addEventListener("change", dibujarMedicos);

/* Delegación de eventos: un solo listener en el contenedor de médicos;
   closest() identifica sobre cuál tarjeta se hizo clic. */
document.getElementById("lista-medicos").addEventListener("click", async (e) => {
  const tarjeta = e.target.closest("[data-medico]");
  if (!tarjeta) return;

  medicoSeleccionado = medicos.find(m => m.id === tarjeta.dataset.medico);
  slotSeleccionado = null;
  actualizarBotonConfirmar();
  document.querySelectorAll("#lista-medicos .tarjeta-medico").forEach(t => t.classList.toggle("active", t === tarjeta));

  const cargando = document.getElementById("agenda-cargando");
  const contenedorDias = document.getElementById("agenda-dias");
  document.getElementById("bloque-agenda").classList.remove("oculto");
  document.getElementById("agenda-medico-nombre").textContent = medicoSeleccionado.nombre;
  document.getElementById("resumen-cita").classList.add("oculto");
  contenedorDias.innerHTML = "";
  cargando.classList.remove("oculto"); // arranca el spinner mientras "llega" la agenda

  const dias = await obtenerAgendaMedico(medicoSeleccionado.id); // await: pausa esta función, no la página

  cargando.classList.add("oculto");
  contenedorDias.innerHTML = dias.map(dibujarDiaAgenda).join("");
});

function dibujarDiaAgenda(dia) {
  if (dia.horas.length === 0) {
    return `<div class="dia-agenda"><div class="encabezado-dia">${dia.etiqueta}</div><span class="sin-cupos">Sin cupos</span></div>`;
  }
  return `
    <div class="dia-agenda">
      <div class="encabezado-dia">${dia.etiqueta}</div>
      <div class="horas-dia">
        ${dia.horas.map(h => `<button type="button" class="btn-hora" data-fecha="${dia.fecha}" data-hora="${h}">${h}</button>`).join("")}
      </div>
    </div>`;
}

/* Otra delegación de eventos: los botones de hora se crean dinámicamente
   (ni siquiera existen hasta que la agenda termina de cargar). */
document.getElementById("agenda-dias").addEventListener("click", (e) => {
  const boton = e.target.closest(".btn-hora");
  if (!boton) return;

  document.querySelectorAll(".btn-hora").forEach(b => b.classList.remove("active"));
  boton.classList.add("active");
  slotSeleccionado = { fecha: boton.dataset.fecha, hora: boton.dataset.hora };

  const resumen = document.getElementById("resumen-cita");
  resumen.classList.remove("oculto");
  resumen.innerHTML = `Cita con <strong>${medicoSeleccionado.nombre}</strong> en ${medicoSeleccionado.sede}, el <strong>${slotSeleccionado.fecha}</strong> a las <strong>${slotSeleccionado.hora}</strong>.`;
  actualizarBotonConfirmar();
});

function actualizarBotonConfirmar() {
  document.getElementById("btn-confirmar-cita").disabled = !(medicoSeleccionado && slotSeleccionado);
}
function reiniciarSeleccionCita() {
  medicoSeleccionado = null;
  slotSeleccionado = null;
  document.getElementById("bloque-agenda").classList.add("oculto");
  document.getElementById("resumen-cita").classList.add("oculto");
  actualizarBotonConfirmar();
}

document.getElementById("btn-confirmar-cita").addEventListener("click", () => {
  if (!medicoSeleccionado || !slotSeleccionado) return;
  servicioSalud.agendarCita(pacienteActual.id, medicoSeleccionado, `${slotSeleccionado.fecha} ${slotSeleccionado.hora}`);
  mostrarToast("Cita agendada con éxito.", "exito");
  dibujarMedicos();
  dibujarCitas();
  irASubtab("mis-citas");
});

dibujarMedicos(); // pinta los médicos de la especialidad que viene seleccionada por defecto

/* ---------- VER / CANCELAR CITAS ---------- */
function tarjetaCita(cita) {
  const puedeCancelar = cita.estado === "PROGRAMADA";
  return `
    <div class="card fila-lista" data-id="${cita.idCita}">
      <div class="info"><strong>${cita.especialidad} — ${cita.medico}</strong><span>${cita.sede} · ${cita.fechaHora}</span><span class="id-mini">${cita.idCita}</span></div>
      <div class="acciones-fila">
        <span class="pastilla-estado ${cita.estado}">${cita.estado === "PROGRAMADA" ? "Programada" : "Cancelada"}</span>
        ${puedeCancelar ? `<button class="btn-mini peligro" data-cancelar="${cita.idCita}">Cancelar</button>` : ""}
      </div>
    </div>`;
}
function dibujarCitas() {
  if (!pacienteActual) return;
  const citas = servicioSalud.obtenerCitasPaciente(pacienteActual.id);
  const contenedor = document.getElementById("contenedor-citas");
  const vacio = document.getElementById("citas-vacio");
  if (citas.length === 0) { contenedor.innerHTML = ""; vacio.style.display = "block"; }
  else { vacio.style.display = "none"; contenedor.innerHTML = citas.map(tarjetaCita).join(""); }

  const proxima = citas.find(c => c.estado === "PROGRAMADA");
  document.getElementById("stat-proxima-cita").textContent = proxima ? proxima.fechaHora.replace(" ", " · ") : "Sin citas";
}
document.getElementById("contenedor-citas").addEventListener("click", (e) => {
  const boton = e.target.closest("[data-cancelar]");
  if (!boton) return;
  if (!confirm(`¿Seguro que deseas cancelar la cita ${boton.dataset.cancelar}?`)) return;
  servicioSalud.cancelarCita(boton.dataset.cancelar);
  mostrarToast("Cita cancelada. El cupo quedó liberado.", "exito");
  dibujarCitas();
});
