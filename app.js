const db = new loki("usuarios.db");
const usuarios = db.addCollection("usuarios");
// Cargar usuarios desde JSON
fetch("usuarios.json")
.then(res => res.json())
.then(data => {
 data.forEach(u => usuarios.insert(u));
 mostrarUsuarios(); // Mostrar usuarios después de cargarlos 
});
function mostrarUsuarios(dataToShow = null) {
 const tabla = document.querySelector("#tablaUsuarios tbody");
 tabla.innerHTML = ""; // Limpiar la tabla antes de renderizar 
 const usuariosAMostrar = dataToShow || usuarios.find(); // Usa los datos pasados o todos los usuarios
 if (usuariosAMostrar.length === 0 && dataToShow !== null) {
   showMessage("No se encontraron resultados para su búsqueda.", "error");
 } else {
 showMessage("", ""); // Limpiar mensaje si hay resultados
}
usuariosAMostrar.forEach(u => {
 const row = tabla.insertRow();
 row.innerHTML = `
 <td>${u.id}</td>
 <td>${u.nombre}</td>
 <td>${u.apellido}</td>
 <td>${u.correo}</td>
 <td>${u.activo ? 'Sí' : 'No'}</td>
 <td>
 <button onclick="editarUsuario(${u.id})">Editar</button>
 <button onclick="eliminarUsuario(${u.id})">Eliminar</button>
 </td>
 `;
});
}
function showMessage(message, type) {
 const resultadoTexto = document.getElementById("resultadoTexto");
 resultadoTexto.textContent = message;
 resultadoTexto.className = `message ${type}`; // Añadir clase para estilos
}
function limpiarFormulario() {
 document.getElementById("formUsuario").reset();
 document.getElementById("id").value = ''; // Asegurar que el ID también se limpie
 document.getElementById("id").focus(); // Pone el foco en el campo ID
}
// Envuelve el código que interactúa con el DOM dentro de DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
 document.getElementById("formUsuario").addEventListener("submit", e => {
   e.preventDefault();
   const id = parseInt(document.getElementById("id").value);
   const nombre = document.getElementById("nombre").value.trim();
   const apellido = document.getElementById("apellido").value.trim();
   const correo = document.getElementById("correo").value.trim();
   const activo = document.getElementById("activo").checked;
   if (!id || !nombre || !apellido || !correo) {
     showMessage("Por favor, complete todos los campos obligatorios.", "error");
     return;
   }
   let usuario = usuarios.findOne({ id });
   if (usuario) {
 // Actualizar usuario existente 
     usuario.nombre = nombre;
     usuario.apellido = apellido;
     usuario.correo = correo;
     usuario.activo = activo;
     usuarios.update(usuario);
     showMessage("Usuario actualizado con éxito.", "success");
   } else {
 // Insertar nuevo usuario 
 // Verificar si el ID ya existe para evitar duplicados al insertar
     if (usuarios.findOne({ id })) {
       showMessage(`El ID ${id} ya existe. Por favor, use un ID diferente.`, 
        "error");
       return;
     }
     usuarios.insert({ id, nombre, apellido, correo, activo });
     showMessage("Usuario agregado con éxito.", "success");
   }
   mostrarUsuarios();
 e.target.reset(); // Limpiar el formulario después de guardar 
 document.getElementById("id").value = ''; // Asegurar que el ID se limpie
});
 // Adjuntar event listeners a los botones de búsqueda y mostrar todos
 document.getElementById("btnBuscar").addEventListener("click", buscarUsuario);
 document.getElementById("btnMostrarTodos").addEventListener("click", () => {
 mostrarUsuarios(); // Muestra todos los usuarios de nuevo
 limpiarFormularioBusqueda(); // Limpia los campos de búsqueda
 showMessage("", ""); // Limpia cualquier mensaje
});
 document.getElementById("btnClearForm").addEventListener("click", limpiarFormulario);
 // Búsqueda dinámica al escribir (Opcional, se puede añadir un debounce para mejor 
 rendimiento)
document.getElementById("busquedaGeneral").addEventListener("keyup", buscarUsuario);
document.getElementById("filtroActivo").addEventListener("change", buscarUsuario);
});
function editarUsuario(id) {
 const u = usuarios.findOne({ id }); // Encuentra el usuario por ID 
 if (u) {
   document.getElementById("id").value = u.id;
   document.getElementById("nombre").value = u.nombre;
   document.getElementById("apellido").value = u.apellido;
   document.getElementById("correo").value = u.correo;
 document.getElementById("activo").checked = u.activo; // Establece el estado del 
 checkbox 
 showMessage("Editando usuario...", "info"); // Mensaje informativo
 // Resaltar la fila que se está editando
 const tabla = document.querySelector("#tablaUsuarios tbody");
 const rows = tabla.rows;
 for (let i = 0; i < rows.length; i++) {
   if (parseInt(rows[i].cells[0].textContent) === id) {
     rows[i].classList.add('highlight-row');
     setTimeout(() => {
       rows[i].classList.remove('highlight-row');
 }, 1500); // Quita el resaltado después de 1.5 segundos
     break;
   }
 }
}
}
function eliminarUsuario(id) {
 const usuarioAEliminar = usuarios.findOne({ id });
 if (usuarioAEliminar) {
   if (confirm(`¿Estás seguro de que quieres eliminar a ${usuarioAEliminar.nombre}
    ${usuarioAEliminar.apellido}?`)) {
 usuarios.remove(usuarioAEliminar); // Elimina el usuario 
 mostrarUsuarios(); // Actualiza la tabla 
 showMessage("Usuario eliminado con éxito.", "success");
}
} else {
 showMessage("No se pudo encontrar el usuario para eliminar.", "error");
}
}
function buscarUsuario() {
 const busquedaGeneralValor = 
 document.getElementById("busquedaGeneral").value.toLowerCase();
 const filtroActivoValor = document.getElementById("filtroActivo").value;
 let resultados = usuarios.chain();
 // Aplicar filtro por estado activo si no es 'all'
 if (filtroActivoValor !== 'all') {
   const activoBoolean = filtroActivoValor === 'true';
   resultados = resultados.find({ activo: activoBoolean });
 }
 // Aplicar búsqueda general si hay un valor
 if (busquedaGeneralValor) {
   resultados = resultados.where(u =>
     u.nombre.toLowerCase().includes(busquedaGeneralValor) ||
     u.apellido.toLowerCase().includes(busquedaGeneralValor) ||
     u.correo.toLowerCase().includes(busquedaGeneralValor)
     );
 }
 mostrarUsuarios(resultados.data()); // Muestra los resultados de la búsqueda 
}
function limpiarFormularioBusqueda() {
 document.getElementById("busquedaGeneral").value = '';
 document.getElementById("filtroActivo").value = 'all';
}
