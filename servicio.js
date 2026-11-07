/* ============================================================================
   SERVICIO.JS — reglas de negocio (equivalente a ServicioSaludAdapter.java)
   ----------------------------------------------------------------------------
   Toda decisión de negocio vive aquí: validar login, generar IDs, decidir
   qué datos componen una cita, etc. La interfaz (los demás archivos js/*)
   solo le pide cosas a "servicioSalud" y pinta la respuesta — nunca decide
   reglas de negocio por su cuenta.

   Depende de: repositorios.js (debe cargarse antes en index.html).
   De este archivo dependen: autenticacion.js, citas.js, tramites.js.
============================================================================ */

const servicioSalud = {

  registrarPaciente(nombre, correo, telefono, contrasena) {
    if (repositorioPacientes.buscarPorCorreo(correo)) return false;
    contadorPacientes++;
    const id = "PAC-" + String(contadorPacientes).padStart(4, "0");
    repositorioPacientes.guardar({ id, nombre, correo, telefono, contrasena, afiliacionActiva: true });
    return true;
  },

  iniciarSesion(correo, contrasena) {
    const p = repositorioPacientes.buscarPorCorreo(correo);
    return (p && p.contrasena === contrasena) ? p : null;
  },

  agendarCita(idPaciente, medico, fechaHora) {
    contadorCitas++;
    const cita = {
      idCita: "CITA-" + String(contadorCitas).padStart(4, "0"),
      idPaciente,
      especialidad: medico.especialidad,
      medico: medico.nombre,
      sede: medico.sede,
      fechaHora,
      estado: "PROGRAMADA",
    };
    repositorioCitas.guardar(cita);
    return cita;
  },

  obtenerCitasPaciente(id) {
    return repositorioCitas.buscarPorIdPaciente(id);
  },

  cancelarCita(idCita) {
    repositorioCitas.cancelar(idCita);
  },

  generarFolioRadicacion() {
    contadorRadicaciones++;
    return "RAD-" + String(contadorRadicaciones).padStart(4, "0");
  },
};
