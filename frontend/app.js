// ==========================================
// DATOS INICIALES (SIMULACIÓN DE ESTADO)
// ==========================================
let usuariosRegistrados = [
    { user: "jprieto", pass: "1234", nombre: "Juan Camilo Prieto", categoria: "Tercera", rol: "caddie" },
    { user: "master", pass: "admin", nombre: "Caddie Master", categoria: "General", rol: "master" }
];

let listaTurnos = [
    { nombre: "Carlos Mendoza", categoria: "Primera", hora: "05:30 AM", estado: "En Campo" },
    { nombre: "Luis Fernando Díaz", categoria: "Primera", hora: "05:45 AM", estado: "Disponible" },
    { nombre: "Andrés Vargas", categoria: "Segunda", hora: "05:50 AM", estado: "Disponible" },
    { nombre: "Juan Camilo Prieto", categoria: "Tercera", hora: "06:05 AM", estado: "Disponible" },
    { nombre: "Sebastián Gómez", categoria: "Tercera", hora: "06:20 AM", estado: "Disponible" }
];

const teeTimes = [
    { hora: "06:30 AM", hoyo: "Hoyo 1", grupo: "Familia Restrepo", caddies: 3, estado: "En Campo" },
    { hora: "07:15 AM", hoyo: "Hoyo 1", grupo: "Dr. Mauricio Gómez", caddies: 2, estado: "En Campo" },
    { hora: "08:00 AM", hoyo: "Hoyo 10", grupo: "Torneo Sénior (Grupo A)", caddies: 4, estado: "Próximo" },
    { hora: "08:45 AM", hoyo: "Hoyo 1", grupo: "Ing. Roberto Silva", caddies: 2, estado: "Próximo" }
];

let usuarioActual = null;
let caddiesCargadosHoy = 11;

// ==========================================
// 1. SPLASH SCREEN AL ABRIR LA APP
// ==========================================
window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const splash = document.getElementById("splash-screen");
        splash.style.opacity = "0";
        setTimeout(() => {
            splash.classList.add("oculto");
            document.getElementById("auth-screen").classList.remove("oculto");
        }, 600);
    }, 2300);
});

// ==========================================
// 2. AUTENTICACIÓN Y REGISTRO
// ==========================================
function cambiarTabAuth(tab) {
    document.getElementById("tab-login").classList.toggle("active", tab === "login");
    document.getElementById("tab-register").classList.toggle("active", tab === "register");
    document.getElementById("form-login").classList.toggle("oculto", tab !== "login");
    document.getElementById("form-register").classList.toggle("oculto", tab !== "register");
}

function autocompletar(user, pass) {
    document.getElementById("login-user").value = user;
    document.getElementById("login-pass").value = pass;
}

function registrarCaddie(e) {
    e.preventDefault();
    const nombre = document.getElementById("reg-nombre").value.trim();
    const user = document.getElementById("reg-user").value.trim().toLowerCase();
    const categoria = document.getElementById("reg-categoria").value;
    const pass = document.getElementById("reg-pass").value;

    const nuevoUsuario = { user, pass, nombre, categoria, rol: "caddie" };
    usuariosRegistrados.push(nuevoUsuario);

    // Agregarlo también a la cola si no estaba
    if (!listaTurnos.some(c => c.nombre === nombre)) {
        listaTurnos.push({ nombre, categoria, hora: obtenerHoraActual(), estado: "Disponible" });
    }

    alert(`Registro exitoso para ${nombre} (${categoria} Categoría). Ahora inicia sesión.`);
    cambiarTabAuth("login");
    autocompletar(user, pass);
}

function iniciarSesion(e) {
    e.preventDefault();
    const user = document.getElementById("login-user").value.trim().toLowerCase();
    const pass = document.getElementById("login-pass").value;

    const encontrado = usuariosRegistrados.find(u => u.user === user && u.pass === pass);

    if (!encontrado) {
        alert("Usuario o contraseña incorrectos.");
        return;
    }

    usuarioActual = encontrado;
    cargarInterfazPorRol();
}

function cerrarSesion() {
    usuarioActual = null;
    document.getElementById("app-shell").classList.add("oculto");
    document.getElementById("auth-screen").classList.remove("oculto");
}

// ==========================================
// 3. MODO TABLET PORTERÍA (RECONOCIMIENTO FACIAL)
// ==========================================
function abrirModoPorteria() {
    const pin = prompt("Ingrese PIN de administrador para activar Terminal de Portería (PIN: 0000):");
    if (pin === "0000") {
        document.getElementById("auth-screen").classList.add("oculto");
        document.getElementById("kiosk-screen").classList.remove("oculto");
    } else if (pin !== null) {
        alert("PIN incorrecto. Acceso exclusivo para personal de portería.");
    }
}

function cerrarModoPorteria() {
    document.getElementById("kiosk-screen").classList.add("oculto");
    document.getElementById("auth-screen").classList.remove("oculto");
}

function simularEscaneoFacial() {
    const seleccion = document.getElementById("select-caddie-sim").value;
    const [nombre, categoria] = seleccion.split("|");
    const hora = obtenerHoraActual();

    // Verificar si ya está en lista
    const existente = listaTurnos.find(c => c.nombre === nombre);
    if (!existente) {
        listaTurnos.push({ nombre, categoria, hora, estado: "Disponible" });
    }

    const msg = document.getElementById("mensaje-kiosk");
    msg.innerHTML = `<strong>✅ Rostro Identificado:</strong> ${nombre}<br>Categoría: ${categoria} | Hora: ${hora} — Añadido a la cola.`;
    msg.classList.remove("oculto");

    setTimeout(() => msg.classList.add("oculto"), 4000);
}

// ==========================================
// 4. LÓGICA DE VISTAS (CADDIE VS CADDIE MASTER)
// ==========================================
function cargarInterfazPorRol() {
    document.getElementById("auth-screen").classList.add("oculto");
    document.getElementById("app-shell").classList.remove("oculto");

    const esMaster = usuarioActual.rol === "master";

    // Encabezado
    document.getElementById("nav-titulo").textContent = usuarioActual.nombre;
    document.getElementById("nav-subtitulo").textContent = esMaster
        ? "Administrador - Caddie Master"
        : `Caddie - ${usuarioActual.categoria} Categoría`;

    // Mostrar/Ocultar elementos según rol
    document.getElementById("btn-tab-dashboard").classList.toggle("oculto", !esMaster);
    document.getElementById("filtro-categoria-master").classList.toggle("oculto", !esMaster);
    document.getElementById("panel-estado-caddie").classList.toggle("oculto", esMaster);

    if (!esMaster) {
        document.getElementById("lbl-mi-categoria").textContent = `${usuarioActual.categoria} Categoría`;
        document.getElementById("titulo-lista-turnos").textContent = `Cola de Turnos - ${usuarioActual.categoria} Categoría`;
    } else {
        document.getElementById("titulo-lista-turnos").textContent = "Control General de Turnos";
        actualizarKPIsMaster();
    }

    renderizarTablaTurnos();
    renderizarTeeTimes();
    mostrarVistaApp("vista-turnos");
}

function mostrarVistaApp(idVista) {
    document.querySelectorAll(".app-section").forEach(sec => sec.classList.add("oculto"));
    document.querySelectorAll(".sub-nav-btn").forEach(btn => btn.classList.remove("active"));

    document.getElementById(idVista).classList.remove("oculto");
    if (idVista === "vista-turnos") document.getElementById("btn-tab-turnos").classList.add("active");
    if (idVista === "vista-teetimes") document.getElementById("btn-tab-teetimes").classList.add("active");
    if (idVista === "vista-dashboard") {
        document.getElementById("btn-tab-dashboard").classList.add("active");
        actualizarKPIsMaster();
    }
}

function renderizarTablaTurnos() {
    const tbody = document.getElementById("tbody-turnos");
    tbody.innerHTML = "";

    const esMaster = usuarioActual.rol === "master";
    const filtro = esMaster
        ? document.getElementById("filtro-categoria-master").value
        : usuarioActual.categoria;

    const filtrados = filtro === "Todas"
        ? listaTurnos
        : listaTurnos.filter(c => c.categoria === filtro);

    filtrados.forEach((caddie, index) => {
        const badgeClass = caddie.estado === "Disponible" ? "disponible" : "en-campo";
        const fila = `
            <tr>
                <td><strong>#${index + 1}</strong></td>
                <td>${caddie.nombre}</td>
                <td>${caddie.categoria}</td>
                <td>${caddie.hora}</td>
                <td><span class="badge ${badgeClass}">${caddie.estado}</span></td>
            </tr>
        `;
        tbody.innerHTML += fila;

        // Actualizar tarjeta personal si es el caddie logueado
        if (!esMaster && caddie.nombre === usuarioActual.nombre) {
            document.getElementById("lbl-mi-posicion").textContent = `#${index + 1}`;
            const badgePersonal = document.getElementById("badge-mi-estado");
            badgePersonal.textContent = caddie.estado;
            badgePersonal.className = `badge ${badgeClass}`;
        }
    });
}

function cambiarMiEstado(nuevoEstado) {
    const registro = listaTurnos.find(c => c.nombre === usuarioActual.nombre);
    if (registro) {
        if (registro.estado !== "En Campo" && nuevoEstado === "En Campo") {
            caddiesCargadosHoy++;
        }
        registro.estado = nuevoEstado;
        renderizarTablaTurnos();
    }
}

function renderizarTeeTimes() {
    const tbody = document.getElementById("tbody-teetimes");
    tbody.innerHTML = teeTimes.map(t => `
        <tr>
            <td><strong>${t.hora}</strong></td>
            <td>${t.hoyo}</td>
            <td>${t.grupo}</td>
            <td>${t.caddies}</td>
            <td><span class="badge ${t.estado === 'En Campo' ? 'en-campo' : 'pendiente'}">${t.estado}</span></td>
        </tr>
    `).join("");
}

function actualizarKPIsMaster() {
    const totalPlantilla = 24;
    const presentes = listaTurnos.length;
    const disponibles = listaTurnos.filter(c => c.estado === "Disponible").length;
    const porcentajeAsistencia = Math.round((presentes / totalPlantilla) * 100);

    document.getElementById("kpi-asistencia").textContent = `${presentes} / ${totalPlantilla}`;
    document.querySelector("#kpi-asistencia + .kpi-desc").textContent = `${porcentajeAsistencia}% de la plantilla en portería`;
    document.getElementById("kpi-cargados").textContent = caddiesCargadosHoy;
    document.getElementById("kpi-disponibles").textContent = disponibles;
}

function obtenerHoraActual() {
    const ahora = new Date();
    return ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}