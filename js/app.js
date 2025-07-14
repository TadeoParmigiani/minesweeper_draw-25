'use strict';
document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formulario-configuracion");
    const tablero = document.getElementById("tablero");
    const tam_casilla = 50;
    const btn_reiniciar = document.getElementById("btn-reiniciar");
    const panel = document.getElementById("panel-info");
    const temporizadorSpan = document.getElementById("temporizador");


    let celdas = [];
    let minas = [];
    let totalCeldas = 0;
    let celdasReveladas = 0;
    let juegoTerminado = false;
    let columnas = 0;

    // variables del temporizador
    let intervaloTemporizador;
    let segundos = 0;
    let temporizadorActivo = false;

    formulario.addEventListener("submit", (e) => {
        e.preventDefault();

        const nombre = formulario.nombreJugador.value.trim();
        const dificultad = formulario.dificultad.value;

        if (nombre.length < 3) {
            alert("El nombre debe tener al menos 3 letras.");
            return;
        }

        let filas, totalMinas;

        switch (dificultad) {
            case "facil": filas = columnas = 8; totalMinas = 10; break;
            case "media": filas = columnas = 12; totalMinas = 25; break;
            case "dificil": filas = columnas = 16; totalMinas = 40; break;
        }

        iniciarJuego(filas, columnas, totalMinas);
        formulario.style.display = "none";
        tablero.hidden = false;
        panel.style.display = "flex";
        btn_reiniciar.style.display = "block";
    });

    function iniciarJuego(filas, columnasParam, totalMinas) {
        tablero.innerHTML = "";
        columnas = columnasParam;
        const filasTotal = filas;
        totalCeldas = filas * columnas;
        tablero.style.width = `${columnas * tam_casilla}px`;
        celdas = [];
        minas = [];
        celdasReveladas = 0;
        juegoTerminado = false;

        // Reiniciar temporizador
        detenerTemporizador();
        segundos = 0;
        temporizadorActivo = false;
        temporizadorSpan.textContent = "00:00";

        // Crear celdas
        for (let i = 0; i < totalCeldas; i++) {
            const celda = document.createElement("div");
            celda.classList.add("celda");
            celda.dataset.index = i;
            celda.dataset.revelada = "false";
            celda.dataset.bandera = "false";
            celda.dataset.mina = "false";
            celda.addEventListener("click", revelarCelda);
            celda.addEventListener("contextmenu", colocarBandera);
            tablero.appendChild(celda);
            celdas.push(celda);
        }

        // Colocar minas aleatoriamente
        let colocadas = 0;
        while (colocadas < totalMinas) {
            let i = Math.floor(Math.random() * totalCeldas);
            if (celdas[i].dataset.mina === "false") {
                celdas[i].dataset.mina = "true";
                minas.push(i);
                colocadas++;
            }
        }
    }

    // Temporizador
    function iniciarTemporizador() {
        intervaloTemporizador = setInterval(() => {
            segundos++;
            const minutos = String(Math.floor(segundos / 60)).padStart(2, '0');
            const seg = String(segundos % 60).padStart(2, '0');
            temporizadorSpan.textContent = `${minutos}:${seg}`;
        }, 1000);
    }

    function detenerTemporizador() {
        clearInterval(intervaloTemporizador);
    }


function revelarCelda(e) {
    if (juegoTerminado) return;
    const celda = e.target;
    const index = parseInt(celda.dataset.index);

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
        const celda = celdas[index];
        if (!celda || celda.dataset.revelada === "true" || celda.dataset.bandera === "true") return;

        celda.dataset.revelada = "true";
        celda.style.backgroundColor = "#d0eaff";
        celdasReveladas++;

        if (celda.dataset.mina === "true") {
            celda.style.backgroundColor = "red";
            celda.textContent = "💣";
            terminarJuego(false);
            return;
        }

        const minasCerca = contarMinasCercanas(index);
        if (minasCerca > 0) {
            celda.textContent = minasCerca;
        } else {
            expandirDesde(index);
        }
    }

    function expandirDesde(index) {
        const vecinos = obtenerVecinos(index);
        for (const vecino of vecinos) {
            const celda = celdas[vecino];
            if (celda.dataset.revelada === "false" && celda.dataset.mina === "false") {
                const minasAlrededor = contarMinasCercanas(vecino);
                celda.dataset.revelada = "true";
                celda.style.backgroundColor = "#d0eaff";
                celdasReveladas++;
                if (minasAlrededor > 0) {
                    celda.textContent = minasAlrededor;
                } else {
                    expandirDesde(vecino);
                }
            }
        }
    }

    function colocarBandera(e) {
        e.preventDefault();
        if (juegoTerminado) return;

        const celda = e.target;
        if (celda.dataset.revelada === "true") return;

        if (celda.dataset.bandera === "false") {
            celda.dataset.bandera = "true";
            celda.textContent = "🚩";
        } else {
            celda.dataset.bandera = "false";
            celda.textContent = "";
        }
    }

    function contarMinasCercanas(index) {
        const vecinos = obtenerVecinos(index);
        let cantidad = 0;
        for (const vecino of vecinos) {
            if (celdas[vecino].dataset.mina === "true") {
                cantidad++;
            }
        }
        return cantidad;
    }

    function obtenerVecinos(index) {
        const fila = Math.floor(index / columnas);
        const col = index % columnas;
        const vecinos = [];

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const nuevaFila = fila + i;
                const nuevaCol = col + j;
                if (nuevaFila >= 0 && nuevaFila < totalCeldas / columnas &&
                    nuevaCol >= 0 && nuevaCol < columnas) {
                    vecinos.push(nuevaFila * columnas + nuevaCol);
                }
            }
        }
        return vecinos;
    }

    function terminarJuego(gano) {
        juegoTerminado = true;

        detenerTemporizador();
        
        celdas.forEach((celda) => {
            if (celda.dataset.mina === "true") {
                celda.textContent = "💣";
                celda.style.backgroundColor = "red";
            }
        });

        setTimeout(() => {
            alert(gano ? "¡Ganaste! 🎉" : "¡Perdiste! 💥");
        }, 100);//cambiar por modal
    }

    btn_reiniciar.addEventListener("click", () => {
        location.reload();
    });
});
