// Función para alternar entre las vistas de la interfaz
function mostrarSeccion(idSeccion) {
    // Ocultar todas las secciones
    const secciones = document.querySelectorAll('.seccion');
    secciones.forEach(sec => sec.classList.add('oculto'));
    secciones.forEach(sec => sec.classList.remove('activa'));

    // Remover la clase 'active' de todos los botones
    const botones = document.querySelectorAll('.nav-btn');
    botones.forEach(btn => btn.classList.remove('active'));

    // Mostrar la sección seleccionada y activar el botón
    document.getElementById(idSeccion).classList.remove('oculto');
    document.getElementById(idSeccion).classList.add('activa');
    document.getElementById('btn-' + idSeccion).classList.add('active');
}

// Función para simular el reconocimiento facial
function simularRegistro() {
    const mensajeDiv = document.getElementById('mensaje-registro');
    mensajeDiv.innerHTML = "<strong>✅ Identidad verificada:</strong> Caddie registrado exitosamente. Añadido a la lista de turnos según categoría.";
    mensajeDiv.classList.remove('oculto');

    // Desaparecer el mensaje después de 4 segundos
    setTimeout(() => {
        mensajeDiv.classList.add('oculto');
    }, 4000);
}