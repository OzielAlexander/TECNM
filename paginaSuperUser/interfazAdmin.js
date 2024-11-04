import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

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

// Cargar usuarios al iniciar
async function cargarUsuarios() {
    const usuariosRef = collection(db, 'tbl_usuarios');
    const querySnapshot = await getDocs(usuariosRef);
    const userTableBody = document.querySelector('#userTable tbody');
    userTableBody.innerHTML = ''; // Limpiar la tabla antes de agregar

    querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const row = userTableBody.insertRow();
        row.innerHTML = `
            <td>${userData.nombre}</td>
            <td>${userData.correo}</td>
            <td>${userData.tipo || 'undefined'}</td>
            <td>
                <button onclick="editarUsuario('${doc.id}', '${userData.nombre}', '${userData.correo}', '${userData.tipo}')">Editar</button>
                <button onclick="eliminarUsuario('${doc.id}')">Eliminar</button>
            </td>
        `;
    });
}

// Función para filtrar usuarios
async function buscarUsuarios() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const filterValue = document.getElementById('filterSelect').value;

    const usuariosRef = collection(db, 'tbl_usuarios');
    const querySnapshot = await getDocs(usuariosRef);
    const userTableBody = document.querySelector('#userTable tbody');
    userTableBody.innerHTML = ''; // Limpiar la tabla antes de agregar

    querySnapshot.forEach((doc) => {
        const userData = doc.data();
        // Filtrar según el tipo seleccionado y el texto de búsqueda
        const tipoCoincide = (filterValue === 'maestros' && userData.tipo === 'maestro') || 
                             (filterValue === 'estudiantes' && userData.tipo === 'estudiante') || 
                             (filterValue === 'todos');
        const nombreCoincide = userData.nombre.toLowerCase().includes(searchInput) || 
                                userData.correo.toLowerCase().includes(searchInput);

        if (tipoCoincide && nombreCoincide) {
            const row = userTableBody.insertRow();
            row.innerHTML = `
                <td>${userData.nombre}</td>
                <td>${userData.correo}</td>
                <td>${userData.tipo}</td>
                <td>
                    <button onclick="editarUsuario('${doc.id}', '${userData.nombre}', '${userData.correo}', '${userData.tipo}')">Editar</button>
                    <button onclick="eliminarUsuario('${doc.id}')">Eliminar</button>
                </td>
            `;
        }
    });
}

// Evento de búsqueda
document.getElementById('searchButton').onclick = buscarUsuarios;
// Asignar la función editarUsuario al objeto global window
window.editarUsuario = function(userId, nombre, correo, tipo) {
    document.getElementById('newNombre').value = nombre;
    document.getElementById('newCorreo').value = correo;
    document.getElementById('newTipo').value = tipo;

    document.getElementById('addUserForm').onsubmit = async function(e) {
        e.preventDefault();
        await actualizarUsuario(userId);
    };

    document.getElementById('addUserModal').style.display = 'flex'; // Mostrar el modal
};

// Asignar la función eliminarUsuario al objeto global window
window.eliminarUsuario = async function(userId) {
    const confirmation = confirm("¿Estás seguro de que deseas eliminar este usuario?");
    if (confirmation) {
        const userRef = doc(db, 'tbl_usuarios', userId);
        try {
            await deleteDoc(userRef);
            cargarUsuarios(); // Recargar usuarios después de eliminar
            alert('Usuario eliminado exitosamente.');
        } catch (error) {
            console.error('Error al eliminar el usuario:', error);
            alert('No se pudo eliminar el usuario.');
        }
    } else {
        alert('Eliminación cancelada.');
    }
};

// Función para actualizar un usuario
async function actualizarUsuario(userId) {
    const nombre = document.getElementById('newNombre').value;
    const correo = document.getElementById('newCorreo').value;
    const tipo = document.getElementById('newTipo').value;

    try {
        const userRef = doc(db, 'tbl_usuarios', userId);
        await updateDoc(userRef, {
            nombre,
            correo,
            tipo
        });
        alert('Usuario actualizado exitosamente.');
        cargarUsuarios(); // Recargar la lista de usuarios
        closeModal(); // Cerrar el modal
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        alert('No se pudo actualizar el usuario.');
    }
}

// Agregar usuario
document.getElementById('addUserForm').onsubmit = async function(e) {
    e.preventDefault();
    const nombre = document.getElementById('newNombre').value;
    const correo = document.getElementById('newCorreo').value;
    const password = document.getElementById('newPassword').value;
    const tipo = document.getElementById('newTipo').value;

    try {
        await addDoc(collection(db, 'tbl_usuarios'), {
            nombre,
            correo,
            password,
            tipo
        });
        alert('Usuario agregado exitosamente.');
        cargarUsuarios(); // Recargar la lista de usuarios
        closeModal(); // Cerrar el modal después de agregar
    } catch (error) {
        console.error('Error al agregar usuario:', error);
        alert('No se pudo agregar el usuario.');
    }
};

// Mostrar modal al hacer clic en "Agregar Usuario"
document.getElementById('addUserButton').onclick = function() {
    document.getElementById('addUserModal').style.display = 'flex';
};

// Cerrar el modal
document.getElementById('closeAddUserModal').onclick = function() {
    closeModal();
};

function closeModal() {
    document.getElementById('addUserModal').style.display = 'none';
}

// Cargar usuarios al cargar la página
window.onload = cargarUsuarios;