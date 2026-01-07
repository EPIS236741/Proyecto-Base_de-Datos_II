// --- INTERFAZ DE USUARIO (UI) ---

const views = {
    loading: 'view-loading',
    login: 'view-login',
    registroDatos: 'view-registro-datos',
    dashboard: 'view-dashboard'
};

// Función global para cambiar vistas principales (Login vs Dashboard)
function mostrarVista(vistaId) {
    // Ocultamos todas las vistas principales
    Object.values(views).forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
    
    // Mostramos la deseada
    const target = document.getElementById(views[vistaId] || vistaId);
    if(target) target.classList.remove('hidden');
}

// --- FUNCIÓN DEL MENÚ LATERAL (SIDEBAR) ---
function navegarMenu(opcion) {
    // 1. DEFINIR PANELES QUE EXISTEN EN EL HTML
    // Solo listamos los que realmente están en index.html
    const paneles = ['panel-resumen', 'panel-transferir'];

    // 2. OCULTAR TODOS LOS PANELES (Limpieza segura)
    paneles.forEach(p => {
        const elemento = document.getElementById(p);
        if (elemento) {
            elemento.classList.add('hidden');
        }
    });
    
    // 3. DESACTIVAR CLASES DEL MENÚ
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));

    // 4. MOSTRAR EL PANEL SELECCIONADO
    // Usamos un if/else simple para saber cuál activar
    if (opcion === 'resumen') {
        const panel = document.getElementById('panel-resumen');
        const nav = document.getElementById('nav-resumen');
        if(panel) panel.classList.remove('hidden');
        if(nav) nav.classList.add('active');
    } 
    else if (opcion === 'transferir') {
        const panel = document.getElementById('panel-transferir');
        const nav = document.getElementById('nav-transferir');
        if(panel) panel.classList.remove('hidden');
        if(nav) nav.classList.add('active');
    }
    
    // Nota: 'prestamos' ya no está aquí porque ahora es un archivo .html separado
}

// --- ARRANQUE DE LA APP ---
window.onload = async () => {
    // Verificar si existe la librería Supabase antes de usarla
    if (typeof sbClient === 'undefined') {
        console.error("Error crítico: config.js no se ha cargado.");
        return;
    }

    const { data: { session } } = await sbClient.auth.getSession();
    
    if (session) {
        console.log("Sesión activa recuperada");
        // Llamamos a la función de dashboard.js para cargar los datos
        if (typeof cargarDatosUsuario === 'function') {
            cargarDatosUsuario(session.user); 
        }
    } else {
        mostrarVista('login');
    }
};