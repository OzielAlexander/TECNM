// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-app.js";
import { getFirestore, doc, getDoc, collection, addDoc, getDocs, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-firestore.js";

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

// Variables globales obtenidas de localStorage
const examenId = localStorage.getItem('examenId');
const usuarioID = localStorage.getItem('usuarioID');

// Función para iniciar la cámara
const iniciarCamara = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            const video = document.getElementById('video');
            video.srcObject = stream;
        })
        .catch(err => {
            console.error("Error al acceder a la cámara: ", err);
            alert("No se pudo acceder a la cámara. Por favor, permite el acceso para continuar.");
        });
};

// Función para actualizar el estado de la sesión
const actualizarEstadoSesion = async (estado) => {
    try {
        const sesionRef = doc(db, 'sesionesActivas', usuarioID);
        await updateDoc(sesionRef, {
            estado,
            horaUltimaActividad: new Date().toISOString()
        });
        console.log(`Estado de sesión actualizado a: ${estado}`);
    } catch (error) {
        console.error("Error al actualizar el estado de la sesión: ", error);
    }
};

// Función para contar intentos de un usuario específico en un examen específico
const contarIntentos = async (estudianteId, examenId) => {
    const resultadosRef = collection(db, 'resultadosEstudiantes');
    const q = query(resultadosRef, where("estudianteId", "==", estudianteId), where("examenId", "==", examenId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size; // Retorna el número de intentos realizados
};

// Función para cargar el examen
const cargarExamen = async () => {
    if (!examenId) {
        alert('No se encontró el examen.');
        window.location.href = '../paginaEstudiante/indexEstudiante.html';
        return;
    }

    const examenRef = doc(db, 'examen', examenId);
    const examenSnap = await getDoc(examenRef);

    if (!examenSnap.exists()) {
        alert('El examen no existe.');
        window.location.href = '../paginaEstudiante/indexEstudiante.html';
        return;
    }

    const examenData = examenSnap.data();
    document.getElementById('tituloExamen').innerText = examenData.titulo;

    // Cambiar el estado de la sesión a "Resolviendo examen"
    await actualizarEstadoSesion("Resolviendo examen");

    // Aquí consultamos cuántos intentos ha realizado el estudiante
    const intentosRealizados = await contarIntentos(usuarioID, examenId);

    // Comprobar si se superó el número de intentos permitidos
    if (intentosRealizados >= examenData.intentos) {
        alert(`Has alcanzado el número máximo de intentos (${examenData.intentos}). No puedes realizar este examen nuevamente.`);
        // Cambiar el estado de la sesión a "Activo" ya que el usuario no puede continuar
        await actualizarEstadoSesion("Activo");
        window.location.href = '../paginaEstudiante/indexEstudiante.html';
        return;
    }

    const preguntasContainer = document.getElementById('preguntasContainer');

    examenData.preguntas.forEach((pregunta, index) => {
        const preguntaDiv = document.createElement('div');
        preguntaDiv.classList.add('pregunta');

        let opcionesHTML = '';
        const multipleCorrect = pregunta.correctAnswers.length > 1;

        if (multipleCorrect) {
            for (const [key, value] of Object.entries(pregunta.options)) {
                opcionesHTML += `
                    <label>
                        <input type="checkbox" name="pregunta${index}" value="${key}">
                        ${key}: ${value}
                    </label>
                `;
            }
        } else {
            for (const [key, value] of Object.entries(pregunta.options)) {
                opcionesHTML += `
                    <label>
                        <input type="radio" name="pregunta${index}" value="${key}" required>
                        ${key}: ${value}
                    </label>
                `;
            }
        }

        preguntaDiv.innerHTML = `
            <p><strong>${index + 1}. ${pregunta.question}</strong></p>
            ${opcionesHTML}
        `;

        preguntasContainer.appendChild(preguntaDiv);
    });

    // Iniciar la cámara
    iniciarCamara();
};

  // Obtener el enlace "Volver" y agregarle un event listener
  document.querySelector('.nav-links a').addEventListener('click', async (event) => {
    event.preventDefault(); // Prevenir el comportamiento predeterminado del enlace

    // Actualizar el estado de la sesión a "Activo"
    await actualizarEstadoSesion("Activo");

    // Redirigir a la página de estudiante
    window.location.href = '../paginaEstudiante/indexEstudiante.html';
});


// Agregar event listener para el formulario de envío de respuestas solo después de cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('examenEstudianteForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const respuestasEstudiante = [];
        const examenRef = doc(db, 'examen', examenId);
        const examenSnap = await getDoc(examenRef);
        const examenData = examenSnap.data();

        examenData.preguntas.forEach((pregunta, index) => {
            const opcionesSeleccionadas = Array.from(document.getElementsByName(`pregunta${index}`))
                .filter(input => input.checked)
                .map(input => input.value);

            respuestasEstudiante.push({
                pregunta: pregunta.question,
                respuestasSeleccionadas: opcionesSeleccionadas,
                correctAnswers: pregunta.correctAnswers
            });
        });

        // Calcular la puntuación
        let puntuacion = 0;
        respuestasEstudiante.forEach((respuesta) => {
            const correctas = respuesta.correctAnswers.sort();
            const seleccionadas = respuesta.respuestasSeleccionadas.sort();
            if (JSON.stringify(correctas) === JSON.stringify(seleccionadas)) {
                puntuacion++;
                respuesta.esCorrecta = true;
            } else {
                respuesta.esCorrecta = false;
            }
        });

        // Guardar el resultado
        const resultado = {
            estudianteId: usuarioID,
            examenId,
            tituloExamen: examenData.titulo,
            fechaRealizacion: new Date().toISOString(),
            puntuacion,
            totalPreguntas: examenData.preguntas.length,
            respuestasEstudiante
        };

        await addDoc(collection(db, 'resultadosEstudiantes'), resultado);

        // Cambiar el estado de la sesión a "Activo" nuevamente después de completar el examen
        await actualizarEstadoSesion("Activo");

              

        alert(`Examen enviado. Obtuviste una puntuación de ${puntuacion}/${examenData.preguntas.length}.`);
        window.location.href = '../paginaResultadosEstudiante/indexResultadosEstudiante.html';
    });

    // Cargar el examen al iniciar la página
    cargarExamen();
});
