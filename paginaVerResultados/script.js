import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-firestore.js";

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

// Obtener el `maestroID` desde `localStorage`
const maestroID = localStorage.getItem('usuarioID');

// Función para cargar los exámenes y mostrarlos como burbujas
const cargarExamenes = async () => {
    const examenesContainer = document.getElementById('examenesContainer');
    examenesContainer.innerHTML = ''; // Limpiar el contenedor

    // Consulta para obtener los exámenes creados por el maestro
    const examenesRef = collection(db, 'examen');
    const q = query(examenesRef, where('creadorID', '==', maestroID));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        examenesContainer.innerHTML = '<p>No has creado ningún examen aún.</p>';
        return;
    }

    for (const examenDoc of querySnapshot.docs) {
        const examenData = examenDoc.data();

        // Crear la burbuja para cada examen
        const examenBurbuja = document.createElement('div');
        examenBurbuja.classList.add('examen-burbuja');
        examenBurbuja.textContent = examenData.titulo;

        // Añadir evento de clic para cargar los estudiantes en un modal
        examenBurbuja.addEventListener('click', () => {
            mostrarResultadosEstudiantes(examenDoc.id, examenData.titulo);
        });

        examenesContainer.appendChild(examenBurbuja);
    }
};

// Función para mostrar la lista de estudiantes en un modal
const mostrarResultadosEstudiantes = async (examenId, tituloExamen) => {
    const resultadosRef = collection(db, 'resultadosEstudiantes');
    const q = query(resultadosRef, where('examenId', '==', examenId));
    const querySnapshot = await getDocs(q);

    const listaEstudiantes = document.getElementById('listaEstudiantes');
    listaEstudiantes.innerHTML = ''; // Limpiar la tabla

    if (querySnapshot.empty) {
        listaEstudiantes.innerHTML = '<tr><td colspan="4">No hay resultados para este examen.</td></tr>';
        return;
    }

    document.getElementById('tituloExamenResultados').textContent = `Resultados del Examen: ${tituloExamen}`;
    document.getElementById('modalResultados').style.display = 'block'; // Mostrar modal de resultados

    // Objeto para almacenar el resultado más reciente de cada estudiante
    const resultadosRecientes = {};

    for (const resultadoDoc of querySnapshot.docs) {
        const resultadoData = resultadoDoc.data();
        const estudianteId = resultadoData.estudianteId;

        // Si el estudiante no está en el objeto o el resultado actual es más reciente, lo actualizamos
        if (!resultadosRecientes[estudianteId] || resultadosRecientes[estudianteId].fecha < resultadoData.fecha) {
            resultadosRecientes[estudianteId] = {
                ...resultadoData,
                docId: resultadoDoc.id // Guardar el ID del documento para referencia
            };
        }
    }

    // Crear filas en la tabla con los resultados más recientes
    for (const estudianteId in resultadosRecientes) {
        const resultadoData = resultadosRecientes[estudianteId];

        // Obtener el nombre del estudiante desde `tbl_usuarios`
        const estudianteRef = doc(db, 'tbl_usuarios', estudianteId);
        const estudianteSnap = await getDoc(estudianteRef);
        const estudianteNombre = estudianteSnap.exists() ? estudianteSnap.data().nombre : 'Desconocido';

        // Calcular el porcentaje de puntuación
        const porcentajePuntuacion = ((resultadoData.puntuacion / resultadoData.totalPreguntas) * 100).toFixed(2);

        // Crear fila para el estudiante
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${estudianteNombre}</td>
            <td>${resultadoData.puntuacion}/${resultadoData.totalPreguntas}</td>
            <td>${resultadoData.respuestasEstudiante.filter(r => r.esCorrecta).length}</td>
            <td>
                <button class="generar-certificado-btn" data-id="${resultadoData.docId}"><i class="fas fa-certificate"></i> Generar Certificado</button>
            </td>
        `;

        // Agregar evento al botón para generar certificado
        fila.querySelector('.generar-certificado-btn').addEventListener('click', () => {
            generarCertificado(estudianteNombre, porcentajePuntuacion);
        });

        listaEstudiantes.appendChild(fila);
    }
};

// Función para generar el certificado en PDF
const generarCertificado = (nombreEstudiante, porcentajePuntuacion) => {
    // Establecer los datos en el certificado
    document.getElementById('certificado-nombre').textContent = nombreEstudiante;
    document.getElementById('certificado-puntuacion').textContent = `${porcentajePuntuacion}%`;
    document.getElementById('certificado-fecha').textContent = new Date().toLocaleDateString();

    // Mostrar el certificado (por si está oculto)
    document.getElementById('certificado').style.display = 'block';

    // Esperar un pequeño retraso para que el navegador renderice los cambios
    setTimeout(() => {
        const certificadoDiv = document.getElementById('certificado');
        
        html2canvas(certificadoDiv, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            
            // Crear el PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' para orientación horizontal (landscape)
            
            // Calcular las dimensiones de la imagen en el PDF
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            
            // Descargar el PDF
            pdf.save(`Certificado_${nombreEstudiante}.pdf`);
            
            // Ocultar el certificado nuevamente
            document.getElementById('certificado').style.display = 'none';
        });
    }, 500); // Ajusta el retraso si es necesario
};

// Cerrar modales
document.getElementById('cerrarModalResultados').addEventListener('click', () => {
    document.getElementById('modalResultados').style.display = 'none';
});

// Llamar a la función para cargar los exámenes al iniciar la página
window.addEventListener('DOMContentLoaded', cargarExamenes);