// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAitLyscvMb_nVIsgUO1UE2y443oQqZldU",
    authDomain: "proyectoooo-d8153.firebaseapp.com",
    projectId: "proyectoooo-d8153",
    storageBucket: "proyectoooo-d8153.firebasestorage.app",
    messagingSenderId: "706994211361",
    appId: "1:706994211361:web:7cfd94412057ab385a7160"
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Inicializar Firestore

document.addEventListener('DOMContentLoaded', () => {
    // Obtener el modal y los elementos del modal
    const modal = document.getElementById('modal');
    const openModalBtn = document.getElementById('openModal'); // Enlace para abrir el modal
    const closeModal = document.getElementsByClassName('close')[0]; // Cerrar el modal con "x"
    
    // Abrir modal cuando se hace clic en "Registrarme"
    openModalBtn.onclick = function(event) {
        event.preventDefault(); // Evitar comportamiento predeterminado del enlace
        modal.style.display = 'flex'; // Mostrar el modal
    };
  
    // Cerrar el modal cuando se hace clic en "x"
    closeModal.onclick = function() {
        modal.style.display = 'none';
    };
  
    // Cerrar el modal si se hace clic fuera de él
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // Manejador del formulario de registro
    document.getElementById('registerForm').onsubmit = async function(e) {
        e.preventDefault(); // Evitar que el formulario se envíe

        // Obtener los valores del formulario
        const nombre = document.getElementById('nombre').value;
        const correo = document.getElementById('correo').value;
        const password = document.getElementById('new-password').value;

        if (nombre && correo && password) {
            try {
                // Verificar si ya existe un usuario con el mismo correo
                const usuariosRef = collection(db, 'tbl_usuarios');
                const q = query(usuariosRef, where("correo", "==", correo));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    // Guardar los datos en la colección 'tbl_usuarios'
                    const docRef = await addDoc(collection(db, 'tbl_usuarios'), {
                        nombre: nombre,
                        correo: correo,
                        password: password,
                        tipo: 'estudiante' // Establecer el rol como estudiante
                    });
                    alert('Registro exitoso'); // Mostrar mensaje de éxito
                    modal.style.display = 'none'; // Cerrar el modal después del registro
                    document.getElementById('registerForm').reset(); // Limpiar el formulario
                    console.log("ID del usuario registrado:", docRef.id);
                } else {
                    alert('Ya existe un usuario con este correo.');
                }
            } catch (error) {
                console.error('Error al registrar el usuario:', error);
                alert('No se pudo continuar con el registro'); // Mostrar mensaje de error
            }
        } else {
            alert('Por favor, rellena todos los campos');
        }
    };

    // Manejador del formulario de inicio de sesión
    document.querySelector('form').onsubmit = async function(e) {
        e.preventDefault(); // Evitar el envío del formulario
    
        const nombre = document.getElementById('control-number').value;
        const password = document.getElementById('password').value;
    
        // Verificar si el usuario es Admin
        if (nombre === 'Admin' && password === 'Password') {
            mostrarInterfazAdmin(); // Mostrar interfaz para el administrador
        } else {
            // Verificar si el usuario es maestro o estudiante
            const usuario = await verificarUsuario(nombre, password);
            if (usuario) {
                // Guardar el ID y tipo de usuario en localStorage
                localStorage.setItem('usuarioID', usuario.id);
                localStorage.setItem('tipoUsuario', usuario.tipo);

                // Registrar sesión activa, pasando el nombre del usuario
                await registrarSesionActiva(usuario.id, usuario.nombre);

                if (usuario.tipo === 'estudiante') {
                    window.location.href = 'paginaEstudiante/indexEstudiante.html'; // Redirigir a la página de estudiante
                } else if (usuario.tipo === 'maestro') {
                    window.location.href = 'paginaDocente/indexPanel.html'; // Redirigir a la página de docente
                }
            } else {
                alert('Usuario o contraseña incorrectos.'); // Mensaje de error
            }
        }
    };

    // Función para registrar o actualizar una sesión activa
    async function registrarSesionActiva(usuarioID, nombreUsuario) {
        const sesionRef = doc(db, 'sesionesActivas', usuarioID);
        const sesionSnap = await getDoc(sesionRef);

        if (sesionSnap.exists()) {
            // Actualizar el estado y la última actividad si la sesión ya existe
            await updateDoc(sesionRef, {
                estado: 'Activo',
                horaUltimaActividad: new Date().toISOString()
            });
        } else {
            // Crear un nuevo documento si no existe, incluyendo el nombre del usuario
            await setDoc(sesionRef, {
                usuarioID,
                nombre: nombreUsuario, // Guardar el nombre del usuario en la sesión activa
                estado: 'Activo',
                horaInicioSesion: new Date().toISOString(),
                horaUltimaActividad: new Date().toISOString()
            });
        }
    }

    // Función para verificar si el usuario existe en Firestore y obtener su tipo
    async function verificarUsuario(nombre, password) {
        const usuariosRef = collection(db, 'tbl_usuarios');
        const q = query(usuariosRef, where("nombre", "==", nombre), where("password", "==", password));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const userData = doc.data();
            userData.id = doc.id; // Añadir el ID del documento al objeto del usuario
            return userData; // Retorna el objeto usuario completo con su ID
        }
        return null; // Retorna null si el usuario no existe
    }
});

// Función para mostrar la interfaz del administrador
function mostrarInterfazAdmin() {
    window.location.href = 'paginaSuperUser/paginaAdmin.html'; // Ajusta la ruta según sea necesario
}
