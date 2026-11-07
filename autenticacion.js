/* ============================================================================
   AUTENTICACION.JS — Épica 2 (login, registro, afiliación inactiva)
   ----------------------------------------------------------------------------
   Todo lo que ocurre ANTES de entrar a la app: tabs de login/registro,
   mostrar/ocultar contraseña, validaciones en vivo, el login y el registro
   en sí (con Promise + async/await simulando un servidor real), y la
   pantalla de "afiliación inactiva" para quien inició sesión pero aún no
   puede usar la app.

   Depende de: utilidades.js (mostrarToast, marcarError, iniciales),
   servicio.js (servicioSalud), repositorios.js (pacienteActual).
   De este archivo dependen: citas.js llama a pacienteActual y usa
   entrarComo() indirectamente a través del flujo de login.
============================================================================ */

/* ---------- TABS DE AUTENTICACIÓN (con indicador deslizante) ---------- */
const botonesAuthTab = document.querySelectorAll(".auth-tabs button");
const indicadorTab = document.getElementById("tab-indicator");
botonesAuthTab.forEach((boton, indice) => {
  boton.addEventListener("click", () => {
    botonesAuthTab.forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".form-auth").forEach(f => f.classList.remove("active"));
    boton.classList.add("active");
    document.getElementById(`form-${boton.dataset.tab}`).classList.add("active");
    indicadorTab.style.transform = `translateX(${indice * 100}%)`;
  });
});

/* ---------- MOSTRAR / OCULTAR CONTRASEÑA ---------- */
document.querySelectorAll(".btn-ojo").forEach(boton => {
  boton.addEventListener("click", () => {
    const input = document.getElementById(boton.dataset.objetivo);
    const mostrando = input.type === "text";
    input.type = mostrando ? "password" : "text";
    boton.querySelector(".ojo-abierto").classList.toggle("oculto", !mostrando);
    boton.querySelector(".ojo-cerrado").classList.toggle("oculto", mostrando);
  });
});

/* ---------- VALIDACIÓN DE CORREO EN VIVO ---------- */
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function enlazarValidacionCorreo(idInput) {
  const input = document.getElementById(idInput);
  const icono = input.parentElement.querySelector(".icono-valido"); // DOM traversing: sube al padre y baja
  input.addEventListener("input", () => {
    const esValido = PATRON_CORREO.test(input.value.trim());
    icono.classList.toggle("oculto", !esValido);
    input.classList.toggle("valido", esValido);
  });
}
enlazarValidacionCorreo("login-correo");
enlazarValidacionCorreo("reg-correo");

/* ---------- INDICADOR DE FUERZA DE LA CONTRASEÑA (solo registro) ---------- */
const inputRegContrasena = document.getElementById("reg-contrasena");
const rellenoFuerza = document.getElementById("fuerza-relleno");
const textoFuerza = document.getElementById("fuerza-texto");
inputRegContrasena.addEventListener("input", () => {
  const longitud = inputRegContrasena.value.length;
  if (longitud === 0) {
    rellenoFuerza.style.width = "0%";
    textoFuerza.textContent = "";
  } else if (longitud < 4) {
    rellenoFuerza.style.width = "30%";
    rellenoFuerza.style.background = "var(--rojo)";
    textoFuerza.textContent = "Muy corta";
  } else if (longitud < 8) {
    rellenoFuerza.style.width = "65%";
    rellenoFuerza.style.background = "var(--ambar)";
    textoFuerza.textContent = "Aceptable";
  } else {
    rellenoFuerza.style.width = "100%";
    rellenoFuerza.style.background = "var(--verde)";
    textoFuerza.textContent = "Segura";
  }
});

/* ---------- ANIMACIÓN DE LA TARJETA CUANDO ALGO FALLA ---------- */
function sacudirTarjeta() {
  const tarjeta = document.querySelector(".auth-card");
  tarjeta.classList.add("sacudir");
  setTimeout(() => tarjeta.classList.remove("sacudir"), 400);
}

/* ---------- PROMESA + ASYNC/AWAIT ----------
   "esperar" envuelve un setTimeout en una Promise: en vez de recibir un
   callback, el código que la usa puede escribirse con await como si fuera
   secuencial, aunque por dentro siga siendo asíncrono (el motor de JS no
   se bloquea: sigue atendiendo clics y otros eventos mientras se espera). */
function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ---------- REGISTRO ---------- */
document.getElementById("form-registro").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("reg-nombre").value.trim();
  const correo = document.getElementById("reg-correo").value.trim();
  const telefono = document.getElementById("reg-telefono").value.trim();
  const contrasena = document.getElementById("reg-contrasena").value;

  marcarError("campo-reg-nombre", !nombre);
  marcarError("campo-reg-correo", !correo);
  marcarError("campo-reg-telefono", !telefono);
  marcarError("campo-reg-contrasena", contrasena.length < 4);
  if (!nombre || !correo || !telefono || contrasena.length < 4) return;

  const botonRegistro = document.getElementById("btn-submit-registro");
  botonRegistro.disabled = true;
  botonRegistro.innerHTML = '<span class="spinner"></span> Creando cuenta...';

  await esperar(650); // simula la latencia real de guardar en un servidor

  const registroExitoso = servicioSalud.registrarPaciente(nombre, correo, telefono, contrasena);
  botonRegistro.disabled = false;
  botonRegistro.textContent = "Crear mi cuenta";

  if (!registroExitoso) {
    mostrarToast("Ya existe una cuenta registrada con ese correo.", "error");
    sacudirTarjeta();
    return;
  }
  mostrarToast("Cuenta creada. ¡Ahora inicia sesión!", "exito");
  document.querySelector('.auth-tabs button[data-tab="login"]').click();
  document.getElementById("login-correo").value = correo;
  document.getElementById("login-correo").dispatchEvent(new Event("input"));
});

/* ---------- LOGIN ---------- */
document.getElementById("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const correo = document.getElementById("login-correo").value.trim();
  const contrasena = document.getElementById("login-contrasena").value;
  marcarError("campo-login-correo", !correo);
  marcarError("campo-login-contrasena", !contrasena);
  if (!correo || !contrasena) return;

  const botonLogin = document.getElementById("btn-submit-login");
  botonLogin.disabled = true;
  botonLogin.innerHTML = '<span class="spinner"></span> Verificando...';

  await esperar(550); // misma idea: await "pausa" esta función, no el navegador

  const paciente = servicioSalud.iniciarSesion(correo, contrasena);
  botonLogin.disabled = false;
  botonLogin.textContent = "Ingresar";

  if (!paciente) {
    mostrarToast("Correo o contraseña incorrectos.", "error");
    sacudirTarjeta();
    return;
  }

  if (!paciente.afiliacionActiva) {
    mostrarPantallaInactivo(paciente);
    return;
  }

  entrarComo(paciente);
});

document.getElementById("btn-cuenta-demo").addEventListener("click", () => {
  const correoDemo = "maria.demo@salud360.co";
  let paciente = servicioSalud.iniciarSesion(correoDemo, "demo1234");
  if (!paciente) {
    servicioSalud.registrarPaciente("María Fernanda Gómez", correoDemo, "300 555 0199", "demo1234");
    paciente = servicioSalud.iniciarSesion(correoDemo, "demo1234");
  }
  entrarComo(paciente);
});

document.getElementById("btn-cuenta-demo-inactiva").addEventListener("click", () => {
  const correoDemo = "carlos.pendiente@salud360.co";
  let paciente = servicioSalud.iniciarSesion(correoDemo, "demo1234");
  if (!paciente) {
    servicioSalud.registrarPaciente("Carlos Andrés Pérez", correoDemo, "300 555 0220", "demo1234");
    paciente = servicioSalud.iniciarSesion(correoDemo, "demo1234");
    paciente.afiliacionActiva = false;
  }
  mostrarPantallaInactivo(paciente);
});

/* ---------- AFILIACIÓN INACTIVA ---------- */
function mostrarPantallaInactivo(paciente) {
  pacienteActual = paciente;
  document.getElementById("inactivo-nombre").textContent = paciente.nombre.split(" ")[0];
  document.getElementById("vista-auth").classList.remove("active");
  document.getElementById("vista-inactivo").classList.add("active");
}

document.getElementById("btn-activar-demo").addEventListener("click", () => {
  if (!pacienteActual) return;
  pacienteActual.afiliacionActiva = true;
  mostrarToast("¡Afiliación activada! Ya puedes usar todos los servicios.", "exito");
  document.getElementById("vista-inactivo").classList.remove("active");
  entrarComo(pacienteActual);
});

document.getElementById("btn-volver-login").addEventListener("click", () => {
  pacienteActual = null;
  document.getElementById("vista-inactivo").classList.remove("active");
  document.getElementById("vista-auth").classList.add("active");
  document.getElementById("form-login").reset();
});

/* ---------- ENTRAR A LA APP ---------- */
function entrarComo(paciente) {
  pacienteActual = paciente;
  document.getElementById("vista-auth").classList.remove("active");
  document.getElementById("vista-inactivo").classList.remove("active");
  document.getElementById("vista-app").classList.add("active");
  document.getElementById("saludo-afiliado").textContent = `Hola, ${paciente.nombre.split(" ")[0]}`;
  document.getElementById("mini-avatar").textContent = iniciales(paciente.nombre);
  document.getElementById("pago-nombre").textContent = paciente.nombre;

  const statAfiliacion = document.getElementById("stat-afiliacion");
  const iconoAfiliacion = document.getElementById("icono-stat-afiliacion");
  if (paciente.afiliacionActiva) {
    statAfiliacion.textContent = "Activo";
    iconoAfiliacion.className = "icono-stat ico-verde";
  } else {
    statAfiliacion.textContent = "Inactivo";
    iconoAfiliacion.className = "icono-stat ico-ambar";
  }

  const cuotaFormateada = `$ ${CUOTA_PENDIENTE.toLocaleString("es-CO")}`;
  document.getElementById("stat-cuota").textContent = cuotaFormateada;
  document.getElementById("monto-cuota").textContent = cuotaFormateada;

  irAPantalla("dashboard");   // definida en navegacion.js
  dibujarCitas();             // definida en citas.js
}

document.getElementById("btn-salir").addEventListener("click", () => {
  pacienteActual = null;
  document.getElementById("vista-app").classList.remove("active");
  document.getElementById("vista-auth").classList.add("active");
  document.getElementById("form-login").reset();
  mostrarToast("Sesión cerrada.");
});
