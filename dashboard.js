// --- LÓGICA DE DASHBOARD ---

async function cargarDatosUsuario(user) {
    try {
        // 1. Obtener Cliente y su Cuenta Principal
        const { data: cliente, error } = await sbClient
            .from('clientes')
            .select(`
                id_cliente,
                personas (nombres, apellido_paterno),
                cuentas (id_cuenta, numero_cuenta, saldo_disponible, moneda)
            `)
            .eq('auth_id', user.id)
            .maybeSingle();

        if (error) throw error;

        if (cliente) {
            // A. Llenar Header
            document.getElementById('dash-nombre').innerText = `${cliente.personas.nombres} ${cliente.personas.apellido_paterno}`;
            document.getElementById('dash-email').innerText = user.email;

            // B. Llenar Saldo y Cuentas
            if (cliente.cuentas && cliente.cuentas.length > 0) {
                const cta = cliente.cuentas[0];
                const saldoTexto = `S/ ${cta.saldo_disponible}`;
                
                // Saldo en el Dashboard Principal
                document.getElementById('dash-saldo').innerText = saldoTexto;
                
                // Saldo en la Pantalla de Transferencias (ACTUALIZADO)
                const labelTransferencia = document.getElementById('tf-saldo-disp');
                if(labelTransferencia) labelTransferencia.innerText = saldoTexto;

                // Cargar movimientos de esa cuenta
                cargarMovimientosRecientes(cta.id_cuenta);
            } else {
                document.getElementById('dash-saldo').innerText = "S/ 0.00";
            }
            
            // Mostrar Dashboard
            mostrarVista('dashboard');
        } else {
            // Si no tiene perfil, mandar a registro
            mostrarVista('registroDatos');
        }
    } catch (err) {
        console.error("Error cargando dashboard:", err);
    }
}

async function cargarMovimientosRecientes(idCuenta) {
    const { data: movimientos } = await sbClient
        .from('transacciones')
        .select('*')
        .or(`id_cuenta_origen.eq.${idCuenta},id_cuenta_destino.eq.${idCuenta}`)
        .order('fecha_operacion', { ascending: false })
        .limit(5);

    const tbody = document.getElementById('tabla-movimientos');
    tbody.innerHTML = "";

    if (!movimientos || movimientos.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4' style='text-align:center; padding:20px; color:#999;'>No hay movimientos recientes.</td></tr>";
        return;
    }

    movimientos.forEach(mov => {
        const esIngreso = mov.tipo_operacion === 'DEPOSITO' || mov.id_cuenta_destino === idCuenta;
        const color = esIngreso ? 'text-green' : 'text-red';
        const signo = esIngreso ? '+' : '-';
        
        tbody.innerHTML += `
            <tr>
                <td>${new Date(mov.fecha_operacion).toLocaleDateString()}</td>
                <td>${mov.tipo_operacion}</td>
                <td class="${color}" style="font-weight:bold;">${signo} S/ ${mov.monto}</td>
                <td><span class="badge badge-success">Completado</span></td>
            </tr>`;
    });
}