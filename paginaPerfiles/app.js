import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

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

// Función para cargar estudiantes en tiempo real, filtrando solo aquellos con tipo "estudiante"
async function cargarEstudiantesTiempoReal() {
    const sesionesRef = collection(db, 'sesionesActivas'); // Referencia a la colección 'sesionesActivas'

    // Escuchar cambios en tiempo real
    onSnapshot(sesionesRef, async (querySnapshot) => {
        const tableBody = document.querySelector('#studentsTable tbody');
        tableBody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos

        for (const docSnapshot of querySnapshot.docs) {
            const sesion = docSnapshot.data();
            const usuarioID = sesion.usuarioID;

            // Consultar el tipo de usuario en 'tbl_usuarios' usando el usuarioID
            const usuarioRef = doc(db, 'tbl_usuarios', usuarioID);
            const usuarioSnapshot = await getDoc(usuarioRef);

            if (usuarioSnapshot.exists() && usuarioSnapshot.data().tipo === 'estudiante') {
                const estudiante = usuarioSnapshot.data();
                const row = document.createElement('tr');
                
                // Crear la celda de estado con una clase basada en el estado
                const estadoCelda = document.createElement('td');
                estadoCelda.textContent = sesion.estado;

                // Asignar la clase de color según el estado
                if (sesion.estado.toLowerCase() === 'activo') {
                    estadoCelda.classList.add('estado-activo');
                } else if (sesion.estado.toLowerCase() === 'inactivo') {
                    estadoCelda.classList.add('estado-inactivo');
                } else if (sesion.estado.toLowerCase() === 'resolviendo examen') {
                    estadoCelda.classList.add('estado-resolviendo');
                }

                row.innerHTML = `<td>${estudiante.nombre}</td>`;
                row.appendChild(estadoCelda);
                tableBody.appendChild(row);
            }
        }
    });
}

// Llamar a la función al cargar la página
window.onload = cargarEstudiantesTiempoReal;
