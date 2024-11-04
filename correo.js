import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAitLyscvMb_nVIsgUO1UE2y443oQqZldU",
    authDomain: "proyectoooo-d8153.firebaseapp.com",
    projectId: "proyectoooo-d8153",
    storageBucket: "proyectoooo-d8153.firebasestorage.app",
    messagingSenderId: "706994211361",
    appId: "1:706994211361:web:7cfd94412057ab385a7160"
  };



// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    // Obtener el modal de "Olvidé mi contraseña"
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const openForgotPasswordBtn = document.getElementById('openForgotPassword');
    const closeForgotPasswordModal = forgotPasswordModal.querySelector('.close'); // Botón de cierre dentro del modal

    // Abrir el modal de "Olvidé mi contraseña"
    openForgotPasswordBtn.onclick = function(event) {
        event.preventDefault();
        forgotPasswordModal.style.display = 'flex';
    };

    // Cerrar el modal de "Olvidé mi contraseña"
    closeForgotPasswordModal.onclick = function() {
        forgotPasswordModal.style.display = 'none';
    };

    // Cerrar el modal si se hace clic fuera de él
    window.onclick = function(event) {
        if (event.target == forgotPasswordModal) {
            forgotPasswordModal.style.display = 'none';
        }
    };
});

// Función para verificar si el correo existe y enviar un correo con la contraseña
async function verificarCorreo(correo) {
    const usuariosRef = collection(db, 'tbl_usuarios');
    const q = query(usuariosRef, where("correo", "==", correo));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const userPassword = userData.password; // Obtener la contraseña desde Firestore
            const userName = userData.nombre; // Obtener el nombre desde Firestore
            enviarCorreo(correo, userPassword, userName); // Enviar correo con la contraseña y nombre
        });
    } else {
        alert('Correo electrónico no válido');
    }
}

// Función para enviar el correo electrónico con la contraseña y nombre del usuario
async function enviarCorreo(correo, password, nombre) {
    // Aquí usamos EmailJS para enviar el correo
    try {
        const serviceID = 'service_kfxujpd';
        const templateID = 'template_rdmjval';
        const userID = '6kJFgb51PV_aBIMtP'; // ID de usuario de EmailJS

        // Parámetros dinámicos para la plantilla de EmailJS
        const templateParams = {
            to_email: correo, // Este será el correo ingresado por el usuario
            to_name: nombre,  // Nombre dinámico del usuario
            message: `Hola, parece que has tenido problemas al recordar tu contraseña. No te preocupes, aquí está tu contraseña: ${password}`
        };

        // Envía el correo usando EmailJS
        await emailjs.send(serviceID, templateID, templateParams, userID);
        alert('Correo enviado exitosamente con tu contraseña');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        alert('No se pudo enviar el correo');
    }
}


// Manejador del formulario de "Olvidé mi contraseña"
document.getElementById('forgotPasswordForm').onsubmit = function (e) {
    e.preventDefault();
    
    const correo = document.getElementById('forgot-email').value;
    
    if (correo) {
        verificarCorreo(correo); // Verificar si el correo existe y enviar el correo
    } else {
        alert('Por favor, introduce tu correo electrónico');
    }
};
