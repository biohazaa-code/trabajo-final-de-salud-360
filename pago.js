/* ============================================================================
   PAGO.JS — Épica 5.1 (pago de la cuota moderadora por PSE)
   ----------------------------------------------------------------------------
   Simula el proceso de pago con una barra de progreso real (setInterval +
   callback), y genera un comprobante descargable al finalizar.

   Depende de: utilidades.js (descargarArchivoTexto, mostrarToast),
   repositorios.js (pacienteActual, CUOTA_PENDIENTE).
============================================================================ */

const botonPagar = document.getElementById("btn-pagar");
const barraProgreso = document.getElementById("barra-progreso");
const rellenoBarra = document.getElementById("relleno-progreso");
const textoProgreso = document.getElementById("texto-progreso");
const overlayPago = document.getElementById("overlay-pago");
const codigoConf = document.getElementById("codigo-confirmacion");

const pasosProgreso = [
  { hasta: 35, mensaje: "Conectando con tu banco..." },
  { hasta: 70, mensaje: "Verificando fondos disponibles..." },
  { hasta: 100, mensaje: "Confirmando transacción..." },
];
function generarCodigoConfirmacion() { return "SLD-" + Math.floor(100000 + Math.random() * 900000); }

botonPagar.addEventListener("click", () => {
  botonPagar.disabled = true;
  botonPagar.textContent = "Procesando...";
  barraProgreso.classList.add("visible");
  textoProgreso.classList.add("visible");
  let paso = 0;
  rellenoBarra.style.width = "0%";

  const intervalo = setInterval(() => {
    rellenoBarra.style.width = pasosProgreso[paso].hasta + "%";
    textoProgreso.textContent = pasosProgreso[paso].mensaje;
    paso++;
    if (paso === pasosProgreso.length) {
      clearInterval(intervalo); // deja de repetirse: la "tarea" ya terminó
      setTimeout(() => {
        botonPagar.disabled = false;
        botonPagar.textContent = "Pagar con PSE";
        barraProgreso.classList.remove("visible");
        textoProgreso.classList.remove("visible");
        rellenoBarra.style.width = "0%";
        codigoConf.textContent = generarCodigoConfirmacion();
        overlayPago.classList.add("visible");
      }, 400);
    }
  }, 550);
});

document.getElementById("btn-cerrar-modal").addEventListener("click", () => overlayPago.classList.remove("visible"));
overlayPago.addEventListener("click", (e) => { if (e.target === overlayPago) overlayPago.classList.remove("visible"); });

document.getElementById("btn-descargar-comprobante").addEventListener("click", () => {
  const cuotaFormateada = `$ ${CUOTA_PENDIENTE.toLocaleString("es-CO")}`;
  const contenido = `SALUD 360 — Comprobante de pago\n--------------------------------\nAfiliado: ${pacienteActual.nombre}\nConcepto: Consulta de Medicina General\nValor pagado: ${cuotaFormateada}\nCódigo de confirmación: ${codigoConf.textContent}\nFecha de pago: ${new Date().toLocaleString("es-CO")}\nMétodo: PSE\n--------------------------------\nSimulación generada para el proyecto académico Salud 360.`;
  descargarArchivoTexto(contenido, `comprobante-${codigoConf.textContent}.txt`);
});
