document.addEventListener("DOMContentLoaded", () => {
    var formulario = document.getElementById("formulario-configuracion");
    var tablero = document.getElementById("tablero");
    var tam_casilla = 50; 
    formulario.addEventListener("submit", (e) => {
        e.preventDefault();

        var nombre = formulario.nombreJugador.value.trim();
        var dificultad = formulario.dificultad.value;

        if (nombre.length < 3) {
            alert("El nombre debe tener al menos 3 letras.");
            return;
        }

        let filas, columnas, minas;

        switch (dificultad) {
            case "facil":
                filas = columnas = 8;
                minas = 10;
                break;
            case "media":
                filas = columnas = 12;
                minas = 25;
                break;
            case "dificil":
                filas = columnas = 16;
                minas = 40;
                break;
            default:
                filas = columnas = 8;
                minas = 10;
        }

        iniciarJuego(filas, columnas, minas, nombre);
        formulario.style.display = "none";
        tablero.hidden = false;
    });

    function iniciarJuego(filas, columnas, minas, jugador) {
        tablero.innerHTML = "";
        tablero.style.width = `${columnas * tam_casilla}px`;

        for (var i = 0; i < filas * columnas; i++) {
            var celda = document.createElement("div");
            celda.classList.add("celda");
            


            tablero.appendChild(celda);
        }

        
    }
});
