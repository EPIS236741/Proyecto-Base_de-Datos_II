// --- LÓGICA DE PERFIL ---
window.onload = async () => {
    const { data: { session } } = await sbClient.auth.getSession();
    if(!session) return window.location.href = 'index.html';
    
    cargarPerfil(session.user);
};

async function cargarPerfil(user) {
    document.getElementById('p-email').innerText = user.email;

    const { data: cliente } = await sbClient.from('clientes')
        .select('rol, personas(nombres, apellido_paterno, dni)')
        .eq('auth_id', user.id).single();

    if(cliente) {
        document.getElementById('p-nombre').innerText = cliente.personas.nombres + ' ' + cliente.personas.apellido_paterno;
        document.getElementById('p-dni').innerText = cliente.personas.dni;
        document.getElementById('p-rol').innerText = cliente.rol;
    }
}

async function cambiarPassword() {
    const nuevaPass = prompt("Ingresa tu nueva contraseña (mínimo 6 caracteres):");
    if(!nuevaPass) return;
    if(nuevaPass.length < 6) return alert("La contraseña es muy corta.");

    const { error } = await sbClient.auth.updateUser({ password: nuevaPass });
    
    if(error) alert("Error: " + error.message);
    else alert("Contraseña actualizada correctamente.");
}

async function logout() {
    await sbClient.auth.signOut();
    window.location.href = 'index.html';
}