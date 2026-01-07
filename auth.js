// --- AUTENTICACIÓN Y REGISTRO ---

// 1. INICIAR SESIÓN
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    // Limpiar errores previos
    if(errorDiv) errorDiv.style.display = 'none';

    if (!email || !password) return alert("Por favor completa correo y contraseña.");

    const { data, error } = await sbClient.auth.signInWithPassword({ email, password });

    if (error) {
        if(errorDiv) {
            errorDiv.innerText = "Credenciales incorrectas o usuario no encontrado.";
            errorDiv.style.display = 'block';
        } else {
            alert(error.message);
        }
    } else {
        window.location.reload();
    }
}

// 2. REGISTRO DE USUARIO (Supabase Auth)
async function toggleRegistro() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) return alert("Ingresa un correo y contraseña para registrarte.");

    const { data, error } = await sbClient.auth.signUp({ email, password });

    if (error) {
        alert("Error al registrar: " + error.message);
    } else {
        alert("¡Registro exitoso! Si no entras automáticamente, inicia sesión.");
        // Intentar login automático tras registro si Supabase lo permite
        if(data.session) window.location.reload();
    }
}

// 3. CERRAR SESIÓN
async function cerrarSesion() {
    await sbClient.auth.signOut();
    window.location.reload();
}

// 4. CREAR PERFIL BANCARIO (¡ESTA FALTABA!)
async function crearPerfilBancario() {
    const btn = document.querySelector('button[onclick="crearPerfilBancario()"]');
    if(btn) { btn.disabled = true; btn.innerText = "Procesando..."; }

    try {
        const { data: { session } } = await sbClient.auth.getSession();
        if (!session) throw new Error("No hay sesión activa.");

        const dni = document.getElementById('reg-dni').value;
        const nombres = document.getElementById('reg-nombres').value;
        const apellidos = document.getElementById('reg-apellidos').value;

        if(!dni || !nombres || !apellidos) throw new Error("Completa todos los campos.");

        // Llamada a la función SQL
        const { data, error } = await sbClient.rpc('aperturar_cuenta_digital', {
            p_dni: dni,
            p_nombres: nombres,
            p_apellidos: apellidos,
            p_email: session.user.email,
            p_celular: '000000000', // Valor por defecto si no hay campo celular
            p_doc_auth_id: session.user.id
        });

        if (error) throw error;

        if (data.status === 'ok') {
            alert("¡Bienvenido! Tu cuenta ha sido creada.");
            window.location.reload();
        } else {
            throw new Error(data.mensaje);
        }

    } catch (err) {
        console.error(err);
        // Si el error es "duplicate key", significa que YA tiene cuenta. Lo dejamos pasar.
        if (err.message && err.message.includes("duplicate key")) {
            alert("Ya tienes una cuenta registrada. Redirigiendo al inicio...");
            window.location.reload();
        } else {
            alert("Error: " + err.message);
            if(btn) { btn.disabled = false; btn.innerText = "Crear Cuenta"; }
        }
    }
}