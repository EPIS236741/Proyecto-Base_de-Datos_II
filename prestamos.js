/**
 * LÓGICA DE PÁGINA: prestamos.html
 * Depende de: config.js (para la variable sbClient)
 */

// 1. AL CARGAR LA PÁGINA
window.onload = async () => {
    // Verificar si hay usuario logueado
    const { data: { session } } = await sbClient.auth.getSession();

    if (!session) {
        // Si no hay sesión, lo devolvemos al index para que se loguee
        window.location.href = 'index.html';
        return;
    }

    console.log("Usuario en Préstamos:", session.user.email);
    cargarLista(session.user);
};

// 2. SOLICITAR PRÉSTAMO
async function solicitarPrestamo() {
    const monto = document.getElementById('pres-monto').value;
    const cuotas = document.getElementById('pres-cuotas').value;
    
    if (!monto || monto <= 0) return alert("Ingresa un monto válido.");
    
    if (!confirm(`¿Solicitar préstamo de S/ ${monto} en ${cuotas} cuotas?`)) return;

    try {
        const user = (await sbClient.auth.getUser()).data.user;

        // Llamada a la Base de Datos
        const { data, error } = await sbClient.rpc('solicitar_prestamo', {
            p_monto: monto,
            p_cuotas: parseInt(cuotas),
            p_doc_auth_id: user.id
        });

        if (error) throw error;

        if (data.status === 'ok') {
            alert(data.mensaje);
            document.getElementById('pres-monto').value = ''; // Limpiar campo
            cargarLista(user); // Actualizar tabla
        } else {
            alert("Error: " + data.mensaje);
        }

    } catch (err) {
        alert("Error del sistema: " + err.message);
    }
}

// 3. CARGAR TABLA
async function cargarLista(user) {
    const tbody = document.getElementById('lista-prestamos');
    
    try {
        // Obtener ID de Cliente
        const { data: cliente } = await sbClient.from('clientes')
            .select('id_cliente')
            .eq('auth_id', user.id)
            .single();

        if (!cliente) return;

        // Obtener préstamos
        const { data: prestamos } = await sbClient.from('prestamos')
            .select('*')
            .eq('id_cliente', cliente.id_cliente)
            .order('created_at', { ascending: false });

        tbody.innerHTML = "";

        if (!prestamos || prestamos.length === 0) {
            tbody.innerHTML = "<tr><td colspan='3' style='text-align:center; color:#999;'>No tienes préstamos activos.</td></tr>";
            return;
        }

        prestamos.forEach(p => {
            let color = '#f59e0b'; // Pendiente
            let bg = '#fffbeb';
            
            if (p.estado === 'APROBADO') { color = '#10b981'; bg = '#ecfdf5'; }
            if (p.estado === 'RECHAZADO') { color = '#ef4444'; bg = '#fef2f2'; }

            tbody.innerHTML += `
                <tr>
                    <td>${new Date(p.created_at).toLocaleDateString()}</td>
                    <td style="font-weight:bold;">S/ ${p.monto_total}</td>
                    <td>
                        <span style="background:${bg}; color:${color}; padding:4px 10px; border-radius:12px; font-weight:bold; font-size:0.8em;">
                            ${p.estado}
                        </span>
                    </td>
                </tr>
            `;
        });

    } catch (err) {
        console.error(err);
        tbody.innerHTML = "<tr><td colspan='3'>Error al cargar datos.</td></tr>";
    }
}

// 4. CERRAR SESIÓN (Utilidad para el sidebar)
async function cerrarSesion() {
    await sbClient.auth.signOut();
    window.location.href = 'index.html';
}