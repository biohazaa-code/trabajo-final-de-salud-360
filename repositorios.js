/* ============================================================================
   REPOSITORIOS.JS — "base de datos" de la app, en memoria
   ----------------------------------------------------------------------------
   Esta es la única capa que sabe CÓMO se guardan los pacientes y las citas
   (aquí: en un Map y en un arreglo). El resto de la app nunca toca estos
   objetos directamente: siempre pasa por servicio.js, igual que en el
   backend de Java (RepositorioPacientePort / RepositorioCitaPort).

   No depende de ningún otro archivo.
   De este archivo dependen: servicio.js (y, a través de él, toda la UI).
============================================================================ */

const repositorioPacientes = {
  baseDeDatos: new Map(),
  guardar(p) { this.baseDeDatos.set(p.correo, p); },
  buscarPorCorreo(c) { return this.baseDeDatos.get(c) || null; },
};

const repositorioCitas = {
  citas: [],
  guardar(c) { this.citas.push(c); },
  buscarPorIdPaciente(id) { return this.citas.filter(c => c.idPaciente === id); },
  cancelar(idCita) { const c = this.citas.find(c => c.idCita === idCita); if (c) c.estado = "CANCELADA"; },
};

/* Contadores para generar IDs legibles (PAC-0001, CITA-0001, RAD-0001),
   igual que el AtomicInteger del backend en Java. */
let contadorPacientes = 0;
let contadorCitas = 0;
let contadorRadicaciones = 0;

/* Estado de sesión: qué paciente tiene la sesión abierta ahora mismo. */
let pacienteActual = null;

/* Valor fijo de la cuota moderadora para la simulación de pago. */
const CUOTA_PENDIENTE = 10500;
