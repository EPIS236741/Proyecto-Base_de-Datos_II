// --- LÓGICA DE TARJETAS ---

let miTarjeta = null;
let mostrandoDatos = false;

window.onload = async () => {
    const { data: { session } } = await sbClient.auth.getSession();
    if(!session) return window.location.href = 'index.html';
    cargarTarjeta(session.user);
};

async function cargarTarjeta(user) {
    // Buscar la primera tarjeta del cliente
    const { data: cliente } = await sbClient.from('clientes').select('id_cliente').eq('auth_id', user.id).single();
    if(!cliente) return;

    const { data: tarjetas } = await sbClient.from('tarjetas').select('*').eq('id_cliente', cliente.id_cliente);

    document.getElementById('loading').style.display = 'none';

    if (tarjetas && tarjetas.length > 0) {
        miTarjeta = tarjetas[0];
        mostrarVisualTarjeta();
    } else {
        document.getElementById('no-card').style.display = 'block';
    }
}

function mostrarVisualTarjeta() {
    document.getElementById('no-card').style.display = 'none';
    document.getElementById('card-view').style.display = 'block';

    document.getElementById('cc-name').innerText = miTarjeta.titular;
    document.getElementById('cc-exp').innerText = miTarjeta.vencimiento;
    
    // Si está congelada, actualizar UI
    actualizarEstadoVisual(miTarjeta.estado === 'CONGELADA');
}

function actualizarEstadoVisual(congelada) {
    const card = document.getElementById('visual-card');
    const btnTxt = document.getElementById('btn-lock-txt');
    const icon = document.querySelector('.btn-freeze i');

    if (congelada) {
        card.classList.add('congelada');
        btnTxt.innerText = "Descongelar";
        icon.className = 'bx bx-lock-open-alt';
    } else {
        card.classList.remove('congelada');
        btnTxt.innerText = "Congelar";
        icon.className = 'bx bx-lock-alt';
    }
}

// En tarjetas.js

function alternarNumeros() {
    if(!miTarjeta) return;
    const numEl = document.getElementById('cc-num');
    const cvvEl = document.getElementById('cc-cvv'); // Nuevo
    const btnTxt = document.getElementById('btn-show-txt');

    if (mostrandoDatos) {
        // MODO OCULTO
        numEl.innerText = "•••• •••• •••• ••••";
        cvvEl.innerText = "***"; // Ocultar CVV
        btnTxt.innerText = "Mostrar Datos";
    } else {
        // MODO VISIBLE
        numEl.innerText = miTarjeta.numero;
        cvvEl.innerText = miTarjeta.cvv; // Mostrar CVV real
        btnTxt.innerText = "Ocultar Datos";
    }
    mostrandoDatos = !mostrandoDatos;
}
async function crearTarjeta() {
    const user = (await sbClient.auth.getUser()).data.user;
    const { data, error } = await sbClient.rpc('generar_tarjeta_virtual', { p_doc_auth_id: user.id });

    if(error) alert("Error: " + error.message);
    else {
        alert("¡Tarjeta generada exitosamente!");
        location.reload();
    }
}

async function congelarTarjeta() {
    if(!miTarjeta) return;
    
    const nuevoEstado = miTarjeta.estado === 'ACTIVA' ? 'CONGELADA' : 'ACTIVA';
    if(!confirm(`¿Deseas ${nuevoEstado === 'CONGELADA' ? 'bloquear' : 'activar'} tu tarjeta?`)) return;

    const { data, error } = await sbClient.rpc('toggle_tarjeta', { p_id_tarjeta: miTarjeta.id_tarjeta });

    if(error) alert("Error: " + error.message);
    else {
        miTarjeta.estado = data.nuevo_estado;
        actualizarEstadoVisual(miTarjeta.estado === 'CONGELADA');
    }
}