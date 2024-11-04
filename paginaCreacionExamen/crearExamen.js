// Importar las funciones necesarias de Firebase (fuera de cualquier bloque)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-firestore.js";

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

// Obtener el ID del usuario actual (maestro) desde localStorage
const usuarioID = localStorage.getItem('usuarioID');

document.addEventListener('DOMContentLoaded', () => {
    const questionsContainer = document.getElementById('questionsContainer');
    const addQuestionButton = document.getElementById('addQuestionButton');
    const examenForm = document.getElementById('examenForm');
    let questionCount = 0;

    // Function to dynamically add questions to the form
    addQuestionButton.addEventListener('click', () => {
        questionCount++;
        const questionHTML = `
            <div class="question-group">
                <h4 class="question-title">Pregunta ${questionCount}</h4>
                <label for="question${questionCount}">Pregunta:</label>
                <input type="text" id="question${questionCount}" name="question${questionCount}" required>

                <label for="optionA${questionCount}">Opción A:</label>
                <input type="text" id="optionA${questionCount}" name="optionA${questionCount}" required>

                <label for="optionB${questionCount}">Opción B:</label>
                <input type="text" id="optionB${questionCount}" name="optionB${questionCount}" required>

                <label for="optionC${questionCount}">Opción C:</label>
                <input type="text" id="optionC${questionCount}" name="optionC${questionCount}" required>

                <label for="optionD${questionCount}">Opción D:</label>
                <input type="text" id="optionD${questionCount}" name="optionD${questionCount}" required>

                <label><input type="checkbox" id="multipleCorrect${questionCount}" name="multipleCorrect${questionCount}"> Permitir múltiples respuestas correctas</label>

                <label>Selecciona la Opción Correcta:</label>
                <div id="correctOptions${questionCount}" class="correct-option-container">
                    <select id="correctSelect${questionCount}" class="correct-select">
                        <option value="A">Opción A</option>
                        <option value="B">Opción B</option>
                        <option value="C">Opción C</option>
                        <option value="D">Opción D</option>
                    </select>
                </div>
            </div>
        `;
        questionsContainer.insertAdjacentHTML('beforeend', questionHTML);

        // Add event listener to toggle multiple correct answers
        const multipleCorrect = document.getElementById(`multipleCorrect${questionCount}`);
        multipleCorrect.addEventListener('change', function() {
            toggleCorrectAnswerInput(questionCount, this.checked);
        });
    });

    // Function to toggle between checkboxes or select dropdown for correct answers
    const toggleCorrectAnswerInput = (questionId, isMultiple) => {
        const correctOptionsContainer = document.getElementById(`correctOptions${questionId}`);

        if (isMultiple) {
            // Replace select dropdown with checkboxes for multiple answers
            correctOptionsContainer.innerHTML = `
                <input type="checkbox" id="correctA${questionId}" name="correctA${questionId}"> Opción A<br>
                <input type="checkbox" id="correctB${questionId}" name="correctB${questionId}"> Opción B<br>
                <input type="checkbox" id="correctC${questionId}" name="correctC${questionId}"> Opción C<br>
                <input type="checkbox" id="correctD${questionId}" name="correctD${questionId}"> Opción D<br>
            `;
        } else {
            // Replace checkboxes with select dropdown for single answer
            correctOptionsContainer.innerHTML = `
                <select id="correctSelect${questionId}" class="correct-select">
                    <option value="A">Opción A</option>
                    <option value="B">Opción B</option>
                    <option value="C">Opción C</option>
                    <option value="D">Opción D</option>
                </select>
            `;
        }
    };

    // Function to gather all questions and return them in a structured format
    const getQuestions = () => {
        const questions = [];
        for (let i = 1; i <= questionCount; i++) {
            const questionText = document.getElementById(`question${i}`).value;
            const options = {
                A: document.getElementById(`optionA${i}`).value,
                B: document.getElementById(`optionB${i}`).value,
                C: document.getElementById(`optionC${i}`).value,
                D: document.getElementById(`optionD${i}`).value,
            };

            // Determine the correct answers
            let correctAnswers = [];
            const multipleCorrect = document.getElementById(`multipleCorrect${i}`).checked;

            if (multipleCorrect) {
                if (document.getElementById(`correctA${i}`).checked) correctAnswers.push('A');
                if (document.getElementById(`correctB${i}`).checked) correctAnswers.push('B');
                if (document.getElementById(`correctC${i}`).checked) correctAnswers.push('C');
                if (document.getElementById(`correctD${i}`).checked) correctAnswers.push('D');
            } else {
                correctAnswers.push(document.getElementById(`correctSelect${i}`).value);
            }

            questions.push({
                question: questionText,
                options: options,
                correctAnswers: correctAnswers
            });
        }
        return questions;
    };

    examenForm.addEventListener('submit', async (event) => {
        event.preventDefault();
    
        // Obtener valores del formulario
        const titulo = document.getElementById('titulo').value;
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;
        const duracionHoras = document.getElementById('duracionHoras').value;
        const duracionMinutos = document.getElementById('duracionMinutos').value;
        const intentos = document.getElementById('intentos').value;
        const preguntas = getQuestions();
    
        const duracion = `${duracionHoras}:${duracionMinutos}`;
        const cierre = `${fecha} ${hora}`;
        const estado = 'En proceso';
    
        // Guardar el examen en Firestore, incluyendo el campo `creadorID`
        try {
            await addDoc(collection(db, 'examen'), {
                titulo,
                estado,
                intentos,
                duracion,
                cierre,
                preguntas,
                creadorID: usuarioID  // Asociar el examen al maestro que lo creó
            });
            alert('Examen agregado correctamente.');
            examenForm.reset();
            questionsContainer.innerHTML = '';
            questionCount = 0;
        } catch (error) {
            console.error('Error al guardar el examen:', error);
        }
    });
});
