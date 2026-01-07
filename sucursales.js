// --- LÓGICA DE SUCURSALES ---

let listaGlobal = []; // Para guardar datos y filtrar sin recargar

window.onload = async () => {
    // 1. Verificar sesión
    const { data: { session } } = await sbClient.auth.getSession();
    if (!session) return window.location.href = 'index.html';

    cargarSucursales();
};

async function cargarSucursales() {
    try {
        // 2. Obtener datos de Supabase
        const { data, error } = await sbClient
            .from('sucursales')
            .select('*')
            .order('ciudad', { ascending: true });

        if (error) throw error;

        listaGlobal = data;
        renderizar(listaGlobal);

    } catch (err) {
        console.error(err);
        document.getElementById('loading').innerHTML = "Error al cargar datos.";
    }
}

function renderizar(lista) {
    const contenedor = document.getElementById('grid-sucursales');
    const loading = document.getElementById('loading');
    
    loading.style.display = 'none';
    contenedor.innerHTML = '';

    if(lista.length === 0) {
        contenedor.innerHTML = '<p style="color:#64748b;">No se encontraron sucursales.</p>';
        return;
    }

    lista.forEach(s => {
        // Crear enlace real a Google Maps
        // Si hay lat/long usa coordenadas, sino usa la dirección texto
        let linkMap = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.direccion + ', ' + s.ciudad)}`;
        if (s.latitud && s.longitud) {
            linkMap = `https://www.google.com/maps/search/?api=1&query=${s.latitud},${s.longitud}`;
        }

        const atmBadge = s.tiene_cajero 
            ? `<span class="badge badge-atm"><i class='bx bx-money'></i> Cajero</span>` 
            : `<span class="badge" style="background:#fef2f2; color:#991b1b;"><i class='bx bx-x'></i> Sin Cajero</span>`;

        const html = `
            <div class="branch-card">
                <div>
                    <div class="b-city"><i class='bx bxs-map'></i> ${s.ciudad}</div>
                    <div class="b-name">${s.nombre}</div>
                    <div class="b-address">${s.direccion}</div>
                    
                    <div class="badges">
                        ${atmBadge}
                        <span class="badge badge-time"><i class='bx bx-time'></i> ${s.horario}</span>
                    </div>
                </div>

                <a href="${linkMap}" target="_blank" class="btn-map">
                    <i class='bx bxs-direction-right'></i> Cómo llegar
                </a>
            </div>
        `;
        contenedor.innerHTML += html;
    });
}

// 3. Filtro de búsqueda (Barra superior)
function filtrarSucursales() {
    const texto = document.getElementById('buscador').value.toLowerCase();
    
    const filtrados = listaGlobal.filter(s => 
        s.nombre.toLowerCase().includes(texto) || 
        s.ciudad.toLowerCase().includes(texto) ||
        s.direccion.toLowerCase().includes(texto)
    );

    renderizar(filtrados);
}