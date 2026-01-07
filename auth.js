// --- AUTENTICACIÓN Y REGISTRO ---

// 0. VERIFICAR SESIÓN AL CARGAR LA PÁGINA
async function verificarSesion() {
  try {
    const { data: { session } } = await sbClient.auth.getSession();
    if (session) {
      // Usuario ya está logueado
      console.log('Sesión encontrada:', session.user.email);
      cargarDashboard();
    } else {
      // No hay sesión, mostrar login
      mostrarVista('view-login');
    }
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    mostrarVista('view-login');
  }
}

// 1. INICIAR SESIÓN
async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorDiv = document.getElementById('login-error');
  
  // Limpiar errores previos
  if(errorDiv) errorDiv.style.display = 'none';
  
  // Validaciones
  if (!email || !password) {
    if(errorDiv) {
      errorDiv.innerText = "Por favor completa correo y contraseña.";
      errorDiv.style.display = 'block';
    }
    return;
  }

  if (!email.includes('@')) {
    if(errorDiv) {
      errorDiv.innerText = "Ingresa un correo válido.";
      errorDiv.style.display = 'block';
    }
    return;
  }

  try {
    const { data, error } = await sbClient.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error('Error de login:', error);
      if(errorDiv) {
        // Mensajes más útiles según el error
        if (error.message.includes('Invalid login credentials')) {
          errorDiv.innerText = "Credenciales incorrectas. Verifica tu email y contraseña.";
        } else if (error.message.includes('Email not confirmed')) {
          errorDiv.innerText = "Tu email aún no está verificado. Revisa tu bandeja de entrada.";
        } else {
          errorDiv.innerText = error.message || "Credenciales incorrectas o usuario no encontrado.";
        }
        errorDiv.style.display = 'block';
      }
      return;
    }
    
    // Login exitoso
    console.log('Login exitoso:', data.user.email);
    cargarDashboard();
    
  } catch (err) {
    console.error('Error inesperado:', err);
    if(errorDiv) {
      errorDiv.innerText = "Error al iniciar sesión. Intenta de nuevo.";
      errorDiv.style.display = 'block';
    }
  }
}

// 2. REGISTRO DE USUARIO (Supabase Auth)
async function toggleRegistro() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorDiv = document.getElementById('login-error');
  
  if(errorDiv) errorDiv.style.display = 'none';
  
  if (!email || !password) {
    alert("Ingresa un correo y contraseña para registrarte.");
    return;
  }

  if (password.length < 6) {
    alert("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  if (!email.includes('@')) {
    alert("Ingresa un correo válido.");
    return;
  }

  try {
    const { data, error } = await sbClient.auth.signUp({ email, password });
    
    if (error) {
      console.error('Error de registro:', error);
      
      // Mensajes específicos
      if (error.message.includes('already registered')) {
        alert("Este correo ya está registrado. Intenta con otro o inicia sesión.");
      } else if (error.message.includes('Password')) {
        alert("La contraseña no cumple con los requisitos. Debe tener al menos 6 caracteres.");
      } else {
        alert("Error al registrar: " + error.message);
      }
      return;
    }
    
    // Registro exitoso
    console.log('Registro exitoso, verificar email:', email);
    
    // Mostrar mensaje sobre verificación de email
    alert("¡Registro exitoso! Se ha enviado un email de confirmación a " + email + 
          ". Por favor, verifica tu bandeja de entrada y haz clic en el enlace de confirmación antes de iniciar sesión.");
    
    // Limpiar formulario
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    
    // Si la cuenta se crea con sesión automática (raro pero posible)
    if(data.session) {
      console.log('Sesión automática detectada');
      mostrarVista('view-registro-datos');
    }
    
  } catch (err) {
    console.error('Error inesperado en registro:', err);
    alert("Error al registrar: " + err.message);
  }
}

// 3. CERRAR SESIÓN
async function cerrarSesion() {
  try {
    await sbClient.auth.signOut();
    console.log('Sesión cerrada');
    mostrarVista('view-login');
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    alert('Error al cerrar sesión: ' + error.message);
  }
}

// 4. CREAR PERFIL BANCARIO
async function crearPerfilBancario() {
  const btn = document.querySelector('button[onclick="crearPerfilBancario()"]');
  if(btn) { btn.disabled = true; btn.innerText = "Procesando..."; }
  
  try {
    const { data: { session } } = await sbClient.auth.getSession();
    
    if (!session) {
      throw new Error("No hay sesión activa. Por favor, inicia sesión.");
    }
    
    const dni = document.getElementById('reg-dni').value.trim();
    const nombres = document.getElementById('reg-nombres').value.trim();
    const apellidos = document.getElementById('reg-apellidos').value.trim();
    
    // Validaciones
    if(!dni || !nombres || !apellidos) {
      throw new Error("Completa todos los campos (DNI, Nombres, Apellidos).");
    }
    
    if(dni.length < 8) {
      throw new Error("El DNI debe tener al menos 8 dígitos.");
    }
    
    console.log('Creando perfil bancario para:', session.user.email);
    
    // Llamada a la función SQL
    const { data, error } = await sbClient.rpc('aperturar_cuenta_digital', {
      p_dni: dni,
      p_nombres: nombres,
      p_apellidos: apellidos,
      p_email: session.user.email,
      p_celular: '000000000', // Valor por defecto si no hay campo celular
      p_doc_auth_id: session.user.id
    });
    
    if (error) {
      throw error;
    }
    
    if (data && data.status === 'ok') {
      alert("¡Bienvenido! Tu cuenta ha sido creada exitosamente.");
      cargarDashboard();
    } else if (data && data.status === 'error') {
      throw new Error(data.mensaje || "Error al crear la cuenta.");
    } else {
      throw new Error("Respuesta inesperada del servidor.");
    }
    
  } catch (err) {
    console.error('Error en crearPerfilBancario:', err);
    
    // Si el error es "duplicate key", significa que YA tiene cuenta
    if (err.message && err.message.includes("duplicate key")) {
      alert("Ya tienes una cuenta registrada. Cargando dashboard...");
      cargarDashboard();
    } else {
      alert("Error: " + err.message);
    }
    
  } finally {
    const btn = document.querySelector('button[onclick="crearPerfilBancario()"]');
    if(btn) { btn.disabled = false; btn.innerText = "Crear Cuenta"; }
  }
}

// 5. FUNCIONES AUXILIARES
function mostrarVista(vistaId) {
  // Ocultar todas las vistas
  document.getElementById('view-login')?.classList.add('hidden');
  document.getElementById('view-registro-datos')?.classList.add('hidden');
  document.getElementById('view-dashboard')?.classList.add('hidden');
  document.getElementById('view-loading')?.classList.add('hidden');
  
  // Mostrar la vista seleccionada
  document.getElementById(vistaId)?.classList.remove('hidden');
}

function cargarDashboard() {
  mostrarVista('view-dashboard');
  // Aquí irían las llamadas para cargar datos del dashboard
  // Por ejemplo: cargarSaldo(), cargarMovimientos(), etc.
}

// INICIALIZAR AL CARGAR LA PÁGINA
window.addEventListener('DOMContentLoaded', () => {
  console.log('Página cargada, verificando sesión...');
  verificarSesion();
});

// También escuchar cambios de autenticación en tiempo real
if (sbClient && sbClient.auth) {
  sbClient.auth.onAuthStateChange((event, session) => {
    console.log('Cambio de autenticación:', event);
    if (event === 'SIGNED_IN') {
      cargarDashboard();
    } else if (event === 'SIGNED_OUT') {
      mostrarVista('view-login');
    }
  });
}
