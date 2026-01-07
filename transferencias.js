// --- LÓGICA DE TRANSFERENCIAS ---

// 1. Rellenar cuenta al hacer click en un contacto
function llenarCuenta(cuenta) {
    document.getElementById('tf-destino').value = cuenta;
}

// 2. Actualizar el resumen en tiempo real al escribir el monto
function actualizarResumen() {
    const monto = document.getElementById('tf-monto').value || 0;
    const montoFormateado = parseFloat(monto).toFixed(2);
    
    document.getElementById('res-monto').innerText = `S/ ${montoFormateado}`;
    document.getElementById('res-total').innerText = `S/ ${montoFormateado}`;
}

// 3. Ejecutar Transferencia
async function realizarTransferencia() {
    const destino = document.getElementById('tf-destino').value;
    const monto = parseFloat(document.getElementById('tf-monto').value);
    const btn = document.getElementById('btn-transferir');

    // Validaciones
    if(!destino || destino.length < 5) return alert("Ingresa una cuenta destino válida.");
    if(!monto || monto <= 0) return alert("Ingresa un monto mayor a 0.");
    
    // Confirmación
    if(!confirm(`¿Estás seguro de transferir S/ ${monto} a la cuenta ${destino}?`)) return;

    // Bloquear botón
    btn.disabled = true;
    btn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Procesando...";

    try {
        const { data: { session } } = await sbClient.auth.getSession();

        // Llamada RPC
        const { data, error } = await sbClient.rpc('transferir_fondos', {
            p_cuenta_destino: destino,
            p_monto: monto,
            p_doc_auth_id: session.user.id
        });

        if (error) {
            alert("Error: " + error.message);
        } else if (data.status === 'ok') {
            alert("✅ ¡Transferencia Exitosa!");
            // Limpiar formulario
            document.getElementById('tf-destino').value = '';
            document.getElementById('tf-monto').value = '';
            actualizarResumen();
            
            // Recargar para ver nuevo saldo
            window.location.reload();
        } else {
            alert("Error: " + data.mensaje);
        }

    } catch (err) {
        alert("Error inesperado: " + err.message);
    } finally {
        // Restaurar botón si falló (si fue exitoso se recarga la página antes)
        btn.disabled = false;
        btn.innerText = "Confirmar Envío";
    }
}