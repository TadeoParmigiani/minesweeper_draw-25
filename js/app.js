'use strict';

var formulario = document.getElementById("formulario-configuracion");
var tablero = document.getElementById("tablero");
var tam_casilla = 0;
var btn_reiniciar = document.getElementById("btn-reiniciar");
var panel = document.getElementById("panel-info");
var temporizador = document.getElementById("temporizador");
var contadorBanderas = document.getElementById("contador-banderas");

var celdas = [];
var minas = [];
var totalCeldas = 0;
var celdasReveladas = 0;
var juegoTerminado = false;
var columnas = 0;
var banderasColocadas = 0;
var totalMinasPartida = 0;

var filasActuales = 0;
var columnasActuales = 0;
var minasActuales = 0;

var intervaloTemporizador = null;
var segundos = 0;
var temporizadorActivo = false;

function ajustarTamCasilla() {
    var ancho = window.innerWidth;
    if (ancho <= 320) {
        tam_casilla = 35;
    } else if (ancho <= 768) {
        tam_casilla = 40;
    } else if (ancho <= 1024) {
        tam_casilla = 48;
    } else {
        tam_casilla = 50;
    }
}

formulario.addEventListener("submit", function (eventoFormulario) {
    eventoFormulario.preventDefault();

    ajustarTamCasilla();

    var nombre = formulario.nombreJugador.value.trim();
    var dificultad = formulario.dificultad.value;
    var errorNombre = document.getElementById("error-nombre");

    if (nombre.length < 3) {
        errorNombre.textContent = "El nombre debe tener al menos 3 caracteres.";
        errorNombre.style.display = "block";
        return;
    } else {
        errorNombre.style.display = "none";
    }

    var filas = 0;
    var totalMinas = 0;

    if (dificultad === "facil") {
        filas = 8;
        columnas = 8;
        totalMinas = 10;
    } else if (dificultad === "media") {
        filas = 12;
        columnas = 12;
        totalMinas = 25;
    } else if (dificultad === "dificil") {
        filas = 16;
        columnas = 16;
        totalMinas = 40;
    }

    iniciarJuego(filas, columnas, totalMinas);

    formulario.style.display = "none";
    tablero.style.display = "flex";
    panel.style.display = "flex";
    btn_reiniciar.style.display = "block";
});

window.addEventListener("resize", function () {
    if (!juegoTerminado) {
        ajustarTamCasilla();
        iniciarJuego(filasActuales, columnasActuales, minasActuales);
    }
});

function iniciarJuego(filas, columnasParam, totalMinas) {
    tablero.innerHTML = "";
    columnas = columnasParam;
    totalCeldas = filas * columnas;
    tablero.style.width = (columnas * tam_casilla) + "px";

    celdas = [];
    minas = [];
    celdasReveladas = 0;
    juegoTerminado = false;

    filasActuales = filas;
    columnasActuales = columnasParam;
    minasActuales = totalMinas;

    banderasColocadas = 0;
    totalMinasPartida = totalMinas;
    contadorBanderas.textContent = "Minas restantes: " + (totalMinasPartida - banderasColocadas);

    detenerTemporizador();
    segundos = 0;
    temporizadorActivo = false;
    temporizador.textContent = "00:00";

    for (var i = 0; i < totalCeldas; i++) {
        var celda = document.createElement("div");
        celda.classList.add("celda");
        celda.style.width = tam_casilla + "px";
        celda.style.height = tam_casilla + "px";
        celda.dataset.index = i;
        celda.dataset.revelada = "false";
        celda.dataset.bandera = "false";
        celda.dataset.mina = "false";
        celda.addEventListener("click", revelarCeldaConClickIzquierdo);
        celda.addEventListener("contextmenu", colocarBanderaConClickDerecho);
        tablero.appendChild(celda);
        celdas.push(celda);
    }

    var colocadas = 0;
    while (colocadas < totalMinas) {
        var pos = Math.floor(Math.random() * totalCeldas);
        if (celdas[pos].dataset.mina === "false") {
            celdas[pos].dataset.mina = "true";
            minas.push(pos);
            colocadas++;
        }
    }
}

function revelarCeldaConClickIzquierdo(eventoClick) {
    if (juegoTerminado) return;

    var celda = eventoClick.target;
    var index = parseInt(celda.dataset.index);

    if (celda.dataset.revelada === "true" || celda.dataset.bandera === "true") return;

    if (!temporizadorActivo) {
        temporizadorActivo = true;
        iniciarTemporizador();
    }

    revelar(index);

    if (celdasReveladas === totalCeldas - minas.length) {
        terminarJuego(true);
    }
}

function revelar(index) {
    var celda = celdas[index];
    if (!celda || celda.dataset.revelada === "true" || celda.dataset.bandera === "true") return;

    celda.dataset.revelada = "true";
    celda.classList.add("celda-revelada");
    celdasReveladas++;

    if (celda.dataset.mina === "true") {
        celda.textContent = "💣";
        terminarJuego(false);
        return;
    }

    var minasCerca = contarMinasCercanas(index);
    if (minasCerca > 0) {
        celda.textContent = minasCerca;
        celda.classList.add(`numero-${minasCerca}`);
    } else {
        expandirDesde(index);
    }
}

function expandirDesde(index) {
    var vecinos = obtenerVecinos(index);
    for (var i = 0; i < vecinos.length; i++) {
        var vecino = vecinos[i];
        var celda = celdas[vecino];
        if (celda.dataset.revelada === "false" && celda.dataset.mina === "false") {
            var minasAlrededor = contarMinasCercanas(vecino);
            celda.dataset.revelada = "true";
            celda.classList.add("celda-revelada");
            celdasReveladas++;
            if (minasAlrededor > 0) {
                celda.textContent = minasAlrededor;
                celda.classList.add(`numero-${minasAlrededor}`);
            } else {
                expandirDesde(vecino);
            }
        }
    }
}

function colocarBanderaConClickDerecho(eventoClickDerecho) {
    eventoClickDerecho.preventDefault();
    if (juegoTerminado) return;

    var celda = eventoClickDerecho.target;
    if (celda.dataset.revelada === "true") return;

    if (celda.dataset.bandera === "false") {
        celda.dataset.bandera = "true";
        celda.textContent = "🐒";
        banderasColocadas++;
    } else {
        celda.dataset.bandera = "false";
        celda.textContent = "";
        banderasColocadas--;
    }

    var minasRestantes = totalMinasPartida - banderasColocadas;
    contadorBanderas.textContent = "Minas restantes: " + minasRestantes;
}

function contarMinasCercanas(index) {
    var vecinos = obtenerVecinos(index);
    var cantidad = 0;
    for (var i = 0; i < vecinos.length; i++) {
        if (celdas[vecinos[i]].dataset.mina === "true") {
            cantidad++;
        }
    }
    return cantidad;
}

function obtenerVecinos(index) {
    var fila = Math.floor(index / columnas);
    var col = index % columnas;
    var vecinos = [];

    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            var nuevaFila = fila + i;
            var nuevaCol = col + j;
            if (nuevaFila >= 0 && nuevaFila < totalCeldas / columnas && nuevaCol >= 0 && nuevaCol < columnas) {
                vecinos.push(nuevaFila * columnas + nuevaCol);
            }
        }
    }
    return vecinos;
}

function terminarJuego(gano) {
    juegoTerminado = true;
    detenerTemporizador();

    for (var i = 0; i < celdas.length; i++) {
        if (celdas[i].dataset.mina === "true") {
            celdas[i].textContent = "💣";
        }
    }

    mostrarModal(gano ? "¡Ganaste!" : "¡Perdiste!");
}

var verCodigoBtn = document.getElementById("verCodigoBtn");

verCodigoBtn.addEventListener("click", function () {
  window.open("https://github.com/TadeoParmigiani/minesweeper_draw-25/blob/dev/js/app.js", "_blank");
});


function mostrarModal(mensaje) {
    var modal = document.getElementById("modal-fin-juego");
    var texto = document.getElementById("mensaje-resultado");
    var btnCerrar = document.getElementById("cerrar-modal");

    texto.textContent = mensaje;
    modal.style.display = "flex";

    btnCerrar.onclick = function () {
        modal.style.display = "none";
    };
}
 
btn_reiniciar.addEventListener("click", function () {
    iniciarJuego(filasActuales, columnasActuales, minasActuales);
});

function iniciarTemporizador() {
    intervaloTemporizador = setInterval(() => {
        segundos++;
        const minutos = String(Math.floor(segundos / 60)).padStart(2, '0');
        const seg = String(segundos % 60).padStart(2, '0');
        temporizador.textContent = `${minutos}:${seg}`;
    }, 1000);
}


function detenerTemporizador() {
    clearInterval(intervaloTemporizador);
    intervaloTemporizador = null;
}
//--------------------formulario de mail-----------------------
document.addEventListener('DOMContentLoaded', function () {
    var abrirModalBtn = document.getElementById('abrirModalBtn');
    var cerrarModalBtn = document.getElementById('cerrarModalBtn');
    var modalContacto = document.getElementById('modalContacto');
    var formulario = document.getElementById('formularioContacto');

    var nombre = document.getElementById('nombre');
    var correo = document.getElementById('correo');
    var mensaje = document.getElementById('mensaje');

    var errorNombre = document.getElementById('error-nombre');
    var errorCorreo = document.getElementById('error-correo');
    var errorMensaje = document.getElementById('error-mensaje');

    abrirModalBtn.addEventListener('click', function () {
        modalContacto.classList.add('abierto');

       
        nombre.value = '';
        correo.value = '';
        mensaje.value = '';
        errorNombre.style.display = 'none';
        errorCorreo.style.display = 'none';
        errorMensaje.style.display = 'none';
        errorNombre.textContent = '';
        errorCorreo.textContent = '';
        errorMensaje.textContent = '';

        nombre.focus();
    });

    cerrarModalBtn.addEventListener('click', function () {
        modalContacto.classList.remove('abierto');
    });


    formulario.addEventListener('submit', function (e) {
        e.preventDefault();

        var valido = true;
      
        if (nombre.value.trim().length < 1) {
            errorNombre.textContent = 'El nombre debe tener al menos un caracteres.';
            errorNombre.style.display = 'block';
            valido = false;
        } else {
            errorNombre.style.display = 'none';
        }

        var correoVal = correo.value.trim();
        if (!correoVal.includes('@') || !correoVal.includes('.') || correoVal.length < 6) {
            errorCorreo.textContent = 'Introduce un correo electrónico válido.';
            errorCorreo.style.display = 'block';
            valido = false;
        } else {
            errorCorreo.style.display = 'none';
        }

        if (mensaje.value.trim().length <= 5) {
            errorMensaje.textContent = 'El mensaje debe tener más de 5 caracteres.';
            errorMensaje.style.display = 'block';
            valido = false;
        } else {
            errorMensaje.style.display = 'none';
        }

        if (valido) {
            modalContacto.classList.remove('abierto');

            var nombreVal = nombre.value.trim();
            var mensajeVal = mensaje.value.trim();

            var destinatario = correoVal;
            var asunto = 'Mensaje de contacto de ' + nombreVal;
            var cuerpo = 'Nombre: ' + nombreVal + '\n' +
                'Correo: ' + correoVal + '\n\n' +
                mensajeVal;

            window.location.href =
                'mailto:' + destinatario +
                '?subject=' + encodeURIComponent(asunto) +
                '&body=' + encodeURIComponent(cuerpo);
        }
    });
});
