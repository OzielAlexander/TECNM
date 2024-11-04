// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, addDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-firestore.js";

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

// Obtener el `estudianteId` desde `localStorage`
const estudianteId = localStorage.getItem('usuarioID'); // Cambiar a la variable correcta

// Función para cargar los resultados
const cargarResultados = async () => {
    const resultadosRef = collection(db, 'resultadosEstudiantes');
    const q = query(resultadosRef, where('estudianteId', '==', estudianteId));
    const querySnapshot = await getDocs(q);

    const tablaBody = document.querySelector('#resultadosTabla tbody');
    tablaBody.innerHTML = '';

    if (querySnapshot.empty) {
        tablaBody.innerHTML = '<tr><td colspan="3">No has realizado ningún examen aún.</td></tr>';
        return;
    }

    const resultadosExamenes = {}; // Almacenar resultados por título del examen

    querySnapshot.forEach(doc => {
        const resultado = doc.data();

        if (!resultadosExamenes[resultado.tituloExamen] || (resultadosExamenes[resultado.tituloExamen].fechaRealizacion < resultado.fechaRealizacion)) {
            resultadosExamenes[resultado.tituloExamen] = {
                puntuacion: resultado.puntuacion,
                totalPreguntas: resultado.totalPreguntas,
                id: doc.id,
                fechaRealizacion: resultado.fechaRealizacion
            };
        }
    });

    // Llenar la tabla con los resultados
    Object.keys(resultadosExamenes).forEach(titulo => {
        const resultado = resultadosExamenes[titulo];
        const fila = document.createElement('tr');

        fila.innerHTML = `
            <td>${titulo}</td>
            <td>${resultado.puntuacion}/${resultado.totalPreguntas}</td>
            <td>
                <button class="ver-detalles-btn" data-id="${resultado.id}"><i class="fas fa-eye"></i> Ver Detalles</button>
            </td>
        `;

        tablaBody.appendChild(fila);
    });

    // Agregar `click` event a los botones "Ver Detalles"
    document.querySelectorAll('.ver-detalles-btn').forEach(boton => {
        boton.addEventListener('click', async () => {
            const resultadoId = boton.getAttribute('data-id');
            const resultadoRef = doc(db, 'resultadosEstudiantes', resultadoId);
            const resultadoSnap = await getDoc(resultadoRef);
            const resultadoData = resultadoSnap.data();

            mostrarDetalles(resultadoData);
        });
    });
};

// Función para mostrar detalles del examen en el modal
const mostrarDetalles = (resultadoData) => {
    const modal = document.getElementById('modalDetalles');
    const tituloExamenDetalle = document.getElementById('tituloExamenDetalle');
    const detallesExamen = document.getElementById('detallesExamen');

    tituloExamenDetalle.innerText = `Detalles del Examen: ${resultadoData.tituloExamen}`;
    detallesExamen.innerHTML = '';

    resultadoData.respuestasEstudiante.forEach((respuesta, index) => {
        const correctas = respuesta.correctAnswers.sort();
        const estado = JSON.stringify(correctas) === JSON.stringify(respuesta.respuestasSeleccionadas.sort()) ? '✔️' : '❌';

        detallesExamen.innerHTML += `
            <p><strong>${index + 1}. ${respuesta.pregunta}</strong> ${estado}</p>
            <p>Tu respuesta: ${respuesta.respuestasSeleccionadas.join(', ')}</p>
            <p>Respuesta correcta: ${respuesta.correctAnswers.join(', ')}</p>
            <hr>
        `;
    });

    // Mostrar el modal
    modal.style.display = 'block';

    // Manejar cierre del modal
    const span = document.getElementsByClassName('close')[0];
    span.onclick = () => {
        modal.style.display = 'none';
    };

    // Descargar PDF
    document.getElementById('descargarPDF').onclick = () => {
        generarPDF(resultadoData);
    };
};

// Función para generar un PDF con diseño mejorado
const generarPDF = async (resultadoData) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Agregar el logo de la página
    const logoImg = new Image();
    logoImg.src = '/imagenes/LOGO.png';

    // Esperar a que el logo cargue antes de continuar
    await new Promise((resolve) => {
        logoImg.onload = resolve;
    });

    // Dibujar el logo en la parte superior del PDF
    doc.addImage(logoImg, 'PNG', 10, 5, 30, 30);

    

    // Mostrar la fecha actual en la esquina superior derecha
    const fechaActual = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.setFontSize(12);
    doc.setTextColor(12, 50, 69);
    doc.text(fechaActual, 200, 10, { align: 'right' });

    // Título principal con fondo de color
    doc.setFillColor(70, 130, 180);
    doc.rect(0, 40, 210, 15, 'F'); // Fondo azul debajo del logo
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255); // Texto blanco
    doc.setFont('helvetica', 'bold');
    doc.text(`Detalles del Examen: ${resultadoData.tituloExamen}`, 50, 50);

    // Línea de separación debajo del título
    doc.setDrawColor(33, 150, 243);
    doc.setLineWidth(0.5);
    doc.line(10, 60, 200, 60);

    let y = 70;

    resultadoData.respuestasEstudiante.forEach((respuesta, index) => {
        const estado = JSON.stringify(respuesta.correctAnswers.sort()) === JSON.stringify(respuesta.respuestasSeleccionadas.sort()) ? 'Correcto' : 'Incorrecto';
        const colorEstado = estado === 'Correcto' ? [56, 142, 60] : [211, 47, 47]; // Verde para correcto, rojo para incorrecto

        // Estilo para el encabezado de la pregunta
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0); // Negro para la pregunta
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${respuesta.pregunta}`, 10, y);
        y += 10;

        // Estado (Correcto o Incorrecto) al lado de la pregunta
        doc.setFontSize(12);
        doc.setTextColor(...colorEstado);
        doc.setFont('helvetica', 'italic');
        doc.text(`(${estado})`, 150, y - 10);

        // Sección de respuesta del usuario
        doc.setFillColor(245, 245, 245); // Fondo gris claro para la respuesta
        doc.roundedRect(10, y, 190, 8, 2, 2, 'F');
        doc.setTextColor(0, 0, 0); // Negro para el texto
        doc.setFont('helvetica', 'normal');
        doc.text(`Tu respuesta: ${respuesta.respuestasSeleccionadas.join(', ')}`, 12, y + 6);
        y += 12;

        // Sección de respuesta correcta
        doc.setFillColor(93, 196, 96); // Fondo azul claro para la respuesta correcta
        doc.roundedRect(10, y, 190, 8, 2, 2, 'F');
        doc.text(`Respuesta correcta: ${respuesta.correctAnswers.join(', ')}`, 12, y + 6);
        y += 15;

        // Línea de separación entre preguntas
        doc.setDrawColor(200);
        doc.line(10, y, 200, y);
        y += 10;

        // Crear nueva página si es necesario
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
    });

    // Pie de página con información adicional
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Generado automáticamente con ExamApp', 10, 290); // Texto en el pie de página a la izquierda
        
        doc.text(`Página ${i} de ${pageCount}`, 200, 290, { align: 'right' }); // Número de página a la derecha
    }

    doc.save('resultado_examen.pdf');
};



// Cargar los resultados al iniciar la página
window.addEventListener('DOMContentLoaded', cargarResultados);

// Cerrar el modal al hacer clic fuera de él
window.onclick = (event) => {
    const modal = document.getElementById('modalDetalles');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};