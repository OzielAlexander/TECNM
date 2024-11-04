// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-firestore.js";

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
const db = getFirestore(app);

// Obtener el ID del usuario desde localStorage
const usuarioID = localStorage.getItem('usuarioID');

// Función para buscar exámenes por código
document.getElementById('buscarExamen').addEventListener('click', async () => {
    const codigo = document.getElementById('codigoExamen').value.trim();
    if (codigo === '') {
        alert('Por favor, ingrese un código de examen.');
        return;
    }

    // Consultar Firebase para encontrar el examen con la clave proporcionada
    const examenesRef = collection(db, 'examen');
    const q = query(examenesRef, where('claveExamen', '==', codigo), where('estado', '==', 'Publicado'));
    const querySnapshot = await getDocs(q);

    const tablaBody = document.querySelector('#tablaExamenes tbody');
    tablaBody.innerHTML = ''; // Limpiar la tabla

    if (querySnapshot.empty) {
        alert('No se encontró ningún examen con ese código.');
        return;
    }

    querySnapshot.forEach(doc => {
        const examen = doc.data();
        const fila = document.createElement('tr');

        fila.innerHTML = `
            <td>${examen.titulo}</td>
            <td>${examen.intentos}</td>
            <td>${examen.duracion}</td>
            <td>
                <button class="ingresar-btn" data-id="${doc.id}">Ingresar al examen</button>
            </td>
        `;

        tablaBody.appendChild(fila);
    });

    // Manejar el clic en "Ingresar al examen"
    document.querySelectorAll('.ingresar-btn').forEach(boton => {
        boton.addEventListener('click', () => {
            const examenId = boton.getAttribute('data-id');
            // Guardar el examenId en el almacenamiento local y redirigir
            localStorage.setItem('examenId', examenId);
            window.location.href = '../paginaExamenEstudiante/indexExamenEstudiante.html';
        });
    });
});

// Enlace a "Exámenes Terminados"
document.getElementById('examenesTerminadosLink').addEventListener('click', () => {
    window.location.href = '../paginaResultadosEstudiante/indexResultadosEstudiante.html';
});

// Función para cerrar sesión
document.getElementById('cerrarSesionBtn').addEventListener('click', async () => {
    try {
        // Actualizar el estado de la sesión a "Inactivo"
        const sesionRef = doc(db, 'sesionesActivas', usuarioID);
        await updateDoc(sesionRef, {
            estado: 'Inactivo',
            horaFinSesion: new Date().toISOString()
        });

        // Eliminar datos de localStorage
        localStorage.removeItem('usuarioID');
        localStorage.removeItem('tipoUsuario');

        // Redirigir a la página de inicio de sesión
        window.location.href = '../index.html';
    } catch (error) {
        console.error("Error al cerrar la sesión: ", error);
        alert("Hubo un error al cerrar la sesión. Inténtalo de nuevo.");
    }
});

//nuevoooooooooooooooooooooooooooooooooooooooo
document.addEventListener("DOMContentLoaded", () => {
    const buscarBtn = document.getElementById("buscarExamen");

    // Animación de búsqueda al hacer clic
    buscarBtn.addEventListener("click", () => {
        const input = document.getElementById("codigoExamen");
        input.classList.add("shake");
        setTimeout(() => {
            input.classList.remove("shake");
        }, 500);

        // Ejemplo de alerta (puedes personalizar según los requisitos)
        if (input.value.trim() === "") {
            alert("Por favor, ingrese un código de examen.");
        } else {
            // Lógica de búsqueda
            console.log(`Buscando examen con código: ${input.value}`);
        }
    });
});

// Animación CSS para "shake"
const style = document.createElement("style");
style.innerHTML = `
    .shake {
        animation: shake 0.5s ease;
    }
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        50% { transform: translateX(5px); }
        75% { transform: translateX(-5px); }
    }
`;
document.head.appendChild(style);
