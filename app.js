document.addEventListener("DOMContentLoaded",() =>{
    const tablero = document.querySelector(".tablero");
    const filas = 8;
    const columnas = 8;

    for (let i = 0; i < filas * columnas; i++){
        const celda = document.createElement("div");
        celda.classList.add("celda");
        tablero.appendChild(celda);
    }
} )