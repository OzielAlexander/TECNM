import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-app.js";
import { getFirestore, collection, onSnapshot, updateDoc, doc, deleteDoc, query, where, getDoc } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-firestore.js";

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

// Obtener el `usuarioID` desde `localStorage`
const usuarioID = localStorage.getItem('usuarioID');
console.log(usuarioID)

// Cargar perfil del usuario al iniciar la página
const cargarPerfilUsuario = () => {
    const usuario = JSON.parse(localStorage.getItem('usuario')); // Obtener datos del usuario
    if (usuario) {
        document.getElementById('nombreMaestro').innerText = usuario.nombre;
        document.getElementById('emailMaestro').innerText = usuario.correo;
    }
};

// Función para convertir horas y minutos a segundos
const convertirHorasYMinutosASegundos = (horas, minutos) => {
    return (parseInt(horas, 10) * 3600) + (parseInt(minutos, 10) * 60);
};

// Función para convertir segundos a formato "HH:mm:ss"
const convertirSegundosAFormato = (segundos) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segundosRestantes = segundos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
};

// Función para manejar la cuenta regresiva correctamente
const iniciarCuentaRegresiva = (fila, duracionSegundos, examenId) => {
    let tiempoRestante = duracionSegundos;

    const intervalo = setInterval(async () => {
        if (tiempoRestante <= 0) {
            clearInterval(intervalo);
            fila.querySelector('.duracion').innerText = "Examen Finalizado";
            const botonesAccion = fila.querySelectorAll('button');
            botonesAccion.forEach(boton => boton.disabled = true);
            return;
        }

        tiempoRestante--;

        const horas = Math.floor(tiempoRestante / 3600);
        const minutos = Math.floor((tiempoRestante % 3600) / 60);
        const segundos = tiempoRestante % 60;

        const duracionActualizada = convertirSegundosAFormato(tiempoRestante);
        fila.querySelector('.duracion').innerText = duracionActualizada;

        if (segundos === 0) {
            const examenRef = doc(db, 'examen', examenId);
            await updateDoc(examenRef, { duracion: duracionActualizada });
        }
    }, 1000);
};

// Función para generar un código aleatorio de 4 caracteres
const generarCodigoExamen = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let codigo = '';
    for (let i = 0; i < 4; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
};

// Mostrar el modal del código del examen
const mostrarModalCodigo = (codigoExamen) => {
    const modal = document.getElementById('modalCodigo');
    const modalContentText = document.getElementById('modalCodigoContentText');
    modalContentText.innerText = `La clave del examen es: ${codigoExamen}`;
    modal.style.display = 'block';
};

// Publicar examen en Firestore
const publicarExamen = async (examenId) => {
    const confirmed = confirm('¿Estás seguro de que deseas publicar este examen?');
    if (confirmed) {
        const codigoExamen = generarCodigoExamen();
        const examenRef = doc(db, 'examen', examenId);

        try {
            await updateDoc(examenRef, {
                estado: 'Publicado',
                claveExamen: codigoExamen
            });
            mostrarModalCodigo(codigoExamen);
            alert(`Examen publicado exitosamente con la clave: ${codigoExamen}`);
        } catch (error) {
            console.error("Error al publicar el examen: ", error);
        }
    }
};

// Función para eliminar un examen de Firestore
const eliminarExamen = async (examenId) => {
    const confirmed = confirm('¿Estás seguro de que deseas eliminar este examen?');
    if (confirmed) {
        try {
            await deleteDoc(doc(db, 'examen', examenId));
            alert('Examen eliminado exitosamente.');
        } catch (error) {
            console.error('Error al eliminar el examen:', error);
        }
    }
};



// Cargar exámenes desde Firestore y actualizar la tabla
const loadExams = async () => {
    const examCollection = collection(db, 'examen');
    const q = query(examCollection, where("creadorID", "==", usuarioID)); // Filtrar por creadorID

    onSnapshot(q, (snapshot) => {
        const tabla = document.getElementById('examenesTabla');
        tabla.innerHTML = '';
        snapshot.forEach(doc => {
            const examen = doc.data();
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${examen.titulo}</td>
                <td>${examen.estado}</td>
                <td>${examen.intentos}</td>
                <td class="duracion">${examen.duracion}</td>
                <td>${examen.cierre}</td>
                <td class="action-btns">
                    <button class="btn btn-primary editar-btn" ${examen.estado === 'Publicado' ? 'disabled' : ''} 
                        onclick="location.href = '../paginaEditarExamen/indexEditarE.html?id=${doc.id}'">
                        Ver y Editar
                    </button>
                    ${examen.estado === 'Publicado' 
                        ? `<button class="btn btn-info ver-codigo-btn" data-id="${doc.id}" data-codigo="${examen.claveExamen}">Ver Código del Examen</button>` 
                        : `<button class="btn btn-success publicar-btn" data-id="${doc.id}">Publicar</button>`}
                    <button class="btn btn-danger borrar-btn" data-id="${doc.id}">Borrar</button>
                    <button class="btn btn-secondary perfil-btn" onclick="location.href='../paginaPerfiles/index.html'">Ir a Perfiles</button>
                </td>
            `;
            tabla.appendChild(fila);

            if (examen.estado === 'Publicado') {
                const duracionSegundos = convertirHorasYMinutosASegundos(...examen.duracion.split(':'));
                iniciarCuentaRegresiva(fila, duracionSegundos, doc.id);
            }
        });

        document.querySelectorAll('.publicar-btn').forEach(boton => {
            boton.addEventListener('click', (e) => {
                const examenId = e.target.getAttribute('data-id');
                publicarExamen(examenId);
            });
        });

        document.querySelectorAll('.ver-codigo-btn').forEach(boton => {
            boton.addEventListener('click', (e) => {
                const codigoExamen = e.target.getAttribute('data-codigo');
                mostrarModalCodigo(codigoExamen);
            });
        });

        document.querySelectorAll('.borrar-btn').forEach(boton => {
            boton.addEventListener('click', (e) => {
                const examenId = e.target.getAttribute('data-id');
                eliminarExamen(examenId);
            });
        });
    });
};



// Cargar exámenes al cargar la página
window.addEventListener('DOMContentLoaded', loadExams);

// Alternar la visibilidad del menú al hacer clic en el icono de perfil
const profileIcon = document.getElementById('profile-icon');
const profileMenu = document.getElementById('dropdown-menu');



profileIcon.addEventListener('click', function(event) {
    event.stopPropagation(); // Evita que el clic cierre inmediatamente el menú
    profileMenu.style.display = (profileMenu.style.display === 'block') ? 'none' : 'block';
});

// Cerrar el menú si se hace clic fuera de él
window.addEventListener('click', function(event) {
    if (!profileMenu.contains(event.target) && event.target !== profileIcon) {
        profileMenu.style.display = 'none'; // Cierra el menú si se hace clic fuera
    }
});

// Mostrar el modal de perfil al hacer clic en "Ver Perfil"
document.getElementById('verPerfil').addEventListener('click', async () => {
    try {
        // Obtener el usuarioID almacenado en localStorage
        const usuarioID = localStorage.getItem('usuarioID');
        if (usuarioID) {
            // Referencia al documento del usuario en Firestore
            const usuarioRef = doc(db, 'tbl_usuarios', usuarioID);
            const usuarioSnap = await getDoc(usuarioRef);

            if (usuarioSnap.exists()) {
                const usuarioData = usuarioSnap.data();
                document.getElementById('nombreMaestro').innerText = usuarioData.nombre;
                document.getElementById('emailMaestro').innerText = usuarioData.correo;
                document.getElementById('modalVerPerfil').style.display = 'block'; // Mostrar modal
            } else {
                console.error('No se encontró el usuario en la base de datos.');
                alert('No se encontró el usuario en la base de datos.');
            }
        } else {
            console.error('No se encontró el usuarioID en localStorage.');
            alert('No se encontró el usuarioID en localStorage.');
        }
    } catch (error) {
        console.error('Error al cargar el perfil:', error);
        alert('Ocurrió un error al cargar el perfil.');
    }

    // Cerrar el menú desplegable
    profileMenu.style.display = 'none';
});


// Cerrar el modal al hacer clic en "x"
document.getElementById('cerrarModalVerPerfil').addEventListener('click', () => {
    document.getElementById('modalVerPerfil').style.display = 'none';
});

// Evento para cerrar el modal al hacer clic en el botón "Cerrar"
document.getElementById('cerrarModalCodigo').addEventListener('click', () => {
    document.getElementById('modalCodigo').style.display = 'none';
});

document.getElementById('cerrarModalCodigoBoton').addEventListener('click', () => {
    document.getElementById('modalCodigo').style.display = 'none';
});


// Función para mostrar los datos actuales en el formulario de modificación de perfil
document.getElementById('modificarPerfil').addEventListener('click', async () => {
    try {
        if (usuarioID) {
            const usuarioRef = doc(db, 'tbl_usuarios', usuarioID);
            const usuarioSnap = await getDoc(usuarioRef);

            if (usuarioSnap.exists()) {
                const usuarioData = usuarioSnap.data();
                document.getElementById('nombreModificar').value = usuarioData.nombre;
                document.getElementById('emailModificar').value = usuarioData.correo;
                document.getElementById('modalModificarPerfil').style.display = 'block';
            } else {
                alert('No se encontró el usuario en la base de datos.');
            }
        } else {
            alert('No se encontró el usuarioID en localStorage.');
        }
    } catch (error) {
        console.error('Error al cargar el perfil para modificación:', error);
        alert('Ocurrió un error al cargar el perfil para modificación.');
    }
});

// Función para guardar los cambios del perfil en Firestore
document.getElementById('formModificarPerfil').addEventListener('submit', async function(e) {
    e.preventDefault(); // Evitar el envío del formulario

    const nuevoNombre = document.getElementById('nombreModificar').value;
    const nuevoEmail = document.getElementById('emailModificar').value;

    try {
        const usuarioRef = doc(db, 'tbl_usuarios', usuarioID);
        await updateDoc(usuarioRef, {
            nombre: nuevoNombre,
            correo: nuevoEmail
        });

        // Actualizar en localStorage
        const usuario = {
            id: usuarioID,
            nombre: nuevoNombre,
            correo: nuevoEmail
        };
        localStorage.setItem('usuario', JSON.stringify(usuario));

        alert('Perfil actualizado exitosamente');
        document.getElementById('modalModificarPerfil').style.display = 'none'; // Cerrar modal
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        alert('Ocurrió un error al actualizar el perfil.');
    }
});



// Cerrar el modal de modificación al hacer clic en "x"
document.getElementById('cerrarModalModificarPerfil').addEventListener('click', () => {
    document.getElementById('modalModificarPerfil').style.display = 'none';
});
// Evento para cerrar sesión al hacer clic en "Cerrar Sesión"
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        if (usuarioID) {
            console.log('Cerrando sesión para usuarioID:', usuarioID); // Verificar usuarioID
            // Referencia al documento de la sesión activa en Firestore
            const sesionRef = doc(db, 'sesionesActivas', usuarioID);
            console.log('Referencia de sesión:', sesionRef); // Verificar la referencia

            // Intentar la actualización del documento
            await updateDoc(sesionRef, {
                estado: 'Inactivo',
                horaUltimaActividad: new Date().toISOString() // Marcar la última actividad
            });

            console.log('Estado de sesión actualizado a Inactivo');

            // Limpiar localStorage y redirigir al usuario a la página de inicio de sesión
            localStorage.removeItem('usuarioID');
            localStorage.removeItem('usuario');
            window.location.href = '../index.html'; // Redirigir a la página de inicio de sesión
        } else {
            console.warn('No se encontró el usuarioID en localStorage.');
            alert('No se encontró el usuarioID. Asegúrate de haber iniciado sesión correctamente.');
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Ocurrió un error al cerrar sesión. Intenta de nuevo.');
    }
});



// Llamar a la función para cargar los datos del perfil al cargar la página
window.addEventListener('DOMContentLoaded', cargarPerfilUsuario);

