// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-firestore.js";

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

// Obtener el ID del examen de la URL
const urlParams = new URLSearchParams(window.location.search);
const examenId = urlParams.get('id');

// Referencias a los elementos del formulario
const tituloInput = document.getElementById('titulo');
const fechaInput = document.getElementById('fecha');
const horaInput = document.getElementById('hora');
const duracionHorasInput = document.getElementById('duracionHoras');
const duracionMinutosInput = document.getElementById('duracionMinutos');
const intentosInput = document.getElementById('intentos');
const questionsContainer = document.getElementById('questionsContainer');
const adminQuestionsTable = document.getElementById('adminQuestionsTable');
let totalQuestions = 0; // Lleva el conteo total de preguntas para manejar índices

// Cargar los datos del examen para editar
const loadExamen = async () => {
    if (examenId) {
        const examenRef = doc(db, 'examen', examenId);
        const examenSnap = await getDoc(examenRef);
        
        if (examenSnap.exists()) {
            const examenData = examenSnap.data();

            // Rellenar el formulario con los datos del examen
            tituloInput.value = examenData.titulo;
            fechaInput.value = examenData.cierre.split(' ')[0]; // Solo la fecha
            horaInput.value = examenData.cierre.split(' ')[1]; // Solo la hora
            duracionHorasInput.value = examenData.duracion.split(':')[0];
            duracionMinutosInput.value = examenData.duracion.split(':')[1];
            intentosInput.value = examenData.intentos;

            // Cargar las preguntas en el formulario
            examenData.preguntas.forEach((pregunta, index) => {
                addQuestion(pregunta, index + 1);
            });

            totalQuestions = examenData.preguntas.length; // Actualizar el total de preguntas
            // Cargar las preguntas en la tabla
            loadQuestionsTable(examenData.preguntas);
        }
    }
};

// Función para agregar una nueva pregunta vacía
const addNewQuestion = () => {
    // Utilizar el número actual de preguntas para asignar el nuevo índice
    const newIndex = questionsContainer.children.length + 1;
    
    const newQuestion = {
        question: "",
        options: { A: "", B: "", C: "", D: "" },
        correctAnswers: []
    };
    
    addQuestion(newQuestion, newIndex);
};

// Función para agregar una pregunta al formulario
const addQuestion = (pregunta, index) => {
    const multipleCorrect = pregunta.correctAnswers.length > 1;

    const questionHTML = `
        <div class="question-group">
            <h4>Pregunta ${index}</h4>
            <label for="question${index}">Pregunta:</label>
            <input type="text" id="question${index}" name="question${index}" value="${pregunta.question}" required>

            <label for="optionA${index}">Opción A:</label>
            <input type="text" id="optionA${index}" name="optionA${index}" value="${pregunta.options.A}" required>

            <label for="optionB${index}">Opción B:</label>
            <input type="text" id="optionB${index}" name="optionB${index}" value="${pregunta.options.B}" required>

            <label for="optionC${index}">Opción C:</label>
            <input type="text" id="optionC${index}" name="optionC${index}" value="${pregunta.options.C}" required>

            <label for="optionD${index}">Opción D:</label>
            <input type="text" id="optionD${index}" name="optionD${index}" value="${pregunta.options.D}" required>

            <div class="checkbox-group">
                <input type="checkbox" id="multipleCorrect${index}" name="multipleCorrect${index}" ${multipleCorrect ? 'checked' : ''}>
                <label for="multipleCorrect${index}">Permitir múltiples respuestas correctas</label>
            </div>

            <div id="correctOptionsContainer${index}">
                ${multipleCorrect ? getCheckboxOptions(index, pregunta) : getSelectOptions(index, pregunta)}
            </div>
        </div>
    `;
    
    questionsContainer.insertAdjacentHTML('beforeend', questionHTML);

    // Añadir event listener para cambiar entre selección múltiple y única
    const multipleCorrectCheckbox = document.getElementById(`multipleCorrect${index}`);
    multipleCorrectCheckbox.addEventListener('change', () => {
        const container = document.getElementById(`correctOptionsContainer${index}`);
        if (multipleCorrectCheckbox.checked) {
            container.innerHTML = getCheckboxOptions(index, pregunta);
        } else {
            container.innerHTML = getSelectOptions(index, pregunta);
        }
    });
};

// Función para obtener las opciones en formato de checkbox
const getCheckboxOptions = (index, pregunta) => {
    return `
        <label>Selecciona las Opciones Correctas:</label>
        <div>
            <input type="checkbox" id="correctA${index}" name="correctA${index}" value="A" ${pregunta.correctAnswers.includes('A') ? 'checked' : ''}> Opción A<br>
            <input type="checkbox" id="correctB${index}" name="correctB${index}" value="B" ${pregunta.correctAnswers.includes('B') ? 'checked' : ''}> Opción B<br>
            <input type="checkbox" id="correctC${index}" name="correctC${index}" value="C" ${pregunta.correctAnswers.includes('C') ? 'checked' : ''}> Opción C<br>
            <input type="checkbox" id="correctD${index}" name="correctD${index}" value="D" ${pregunta.correctAnswers.includes('D') ? 'checked' : ''}> Opción D<br>
        </div>
    `;
};

// Función para obtener las opciones en formato de select
const getSelectOptions = (index, pregunta) => {
    return `
        <label for="correctOption${index}">Selecciona la Opción Correcta:</label>
        <select id="correctOption${index}" name="correctOption${index}" required>
            <option value="A" ${pregunta.correctAnswers.includes('A') ? "selected" : ""}>Opción A</option>
            <option value="B" ${pregunta.correctAnswers.includes('B') ? "selected" : ""}>Opción B</option>
            <option value="C" ${pregunta.correctAnswers.includes('C') ? "selected" : ""}>Opción C</option>
            <option value="D" ${pregunta.correctAnswers.includes('D') ? "selected" : ""}>Opción D</option>
        </select>
    `;
};

const loadQuestionsTable = (preguntas) => {
    adminQuestionsTable.innerHTML = ''; // Limpiar la tabla antes de llenarla de nuevo
    questionsContainer.innerHTML = ''; // Limpiar el formulario

    preguntas.forEach((pregunta, index) => {
        // Cargar en la tabla
        const newRow = adminQuestionsTable.insertRow();

        const idCell = newRow.insertCell(0);
        const questionCell = newRow.insertCell(1);
        const optionACell = newRow.insertCell(2);
        const optionBCell = newRow.insertCell(3);
        const optionCCell = newRow.insertCell(4);
        const optionDCell = newRow.insertCell(5);
        const correctAnswersCell = newRow.insertCell(6);
        const deleteCell = newRow.insertCell(7);

        idCell.innerHTML = index + 1;
        questionCell.innerHTML = pregunta.question;
        optionACell.innerHTML = pregunta.options.A;
        optionBCell.innerHTML = pregunta.options.B;
        optionCCell.innerHTML = pregunta.options.C;
        optionDCell.innerHTML = pregunta.options.D;
        correctAnswersCell.innerHTML = pregunta.correctAnswers.join(', ');

        // Cargar en el formulario
        addQuestion(pregunta, index + 1);

        // Crear botón de eliminar
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Eliminar';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', async () => {
            const confirmed = confirm('¿Estás seguro de que deseas eliminar esta pregunta?');
            if (confirmed) {
                adminQuestionsTable.deleteRow(newRow.rowIndex);
                preguntas.splice(index, 1);

                const examenRef = doc(db, 'examen', examenId);
                await updateDoc(examenRef, { preguntas });

                loadQuestionsTable(preguntas); // Recargar tabla y formulario con preguntas actualizadas
                alert('Pregunta eliminada exitosamente.');
            }
        });
        deleteCell.appendChild(deleteButton);
    });
};

// Función para guardar los cambios sin eliminar la vista de la página
document.getElementById('editExamenForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Obtener los valores actualizados
    const titulo = tituloInput.value;
    const fecha = fechaInput.value;
    const hora = horaInput.value;
    const duracionHoras = duracionHorasInput.value;
    const duracionMinutos = duracionMinutosInput.value;
    const intentos = intentosInput.value;
    const cierre = `${fecha} ${hora}`;
    const duracion = `${duracionHoras}:${duracionMinutos}`;

    const preguntas = [];
    const questionGroups = document.querySelectorAll('.question-group');

    // Recolectar las preguntas desde el formulario
    questionGroups.forEach((group, index) => {
        const question = document.getElementById(`question${index + 1}`).value;
        const optionA = document.getElementById(`optionA${index + 1}`).value;
        const optionB = document.getElementById(`optionB${index + 1}`).value;
        const optionC = document.getElementById(`optionC${index + 1}`).value;
        const optionD = document.getElementById(`optionD${index + 1}`).value;
        const correctOptions = [];
        
        if (document.getElementById(`multipleCorrect${index + 1}`).checked) {
            if (document.getElementById(`correctA${index + 1}`).checked) correctOptions.push('A');
            if (document.getElementById(`correctB${index + 1}`).checked) correctOptions.push('B');
            if (document.getElementById(`correctC${index + 1}`).checked) correctOptions.push('C');
            if (document.getElementById(`correctD${index + 1}`).checked) correctOptions.push('D');
        } else {
            correctOptions.push(document.getElementById(`correctOption${index + 1}`).value);
        }

        preguntas.push({
            question: question,
            options: { A: optionA, B: optionB, C: optionC, D: optionD },
            correctAnswers: correctOptions
        });
    });

    // Actualizar el examen en Firebase sin eliminar nada de la página
    const examenRef = doc(db, 'examen', examenId);
    await updateDoc(examenRef, {
        titulo,
        cierre,
        duracion,
        intentos,
        preguntas
    });

    // Actualizar la tabla con las preguntas guardadas
    loadQuestionsTable(preguntas);

    alert('Examen guardado exitosamente.');
});

// Listener para el botón "Añadir Pregunta"
document.getElementById('addQuestionButton').addEventListener('click', addNewQuestion);

// Cargar el examen al abrir la página
loadExamen();