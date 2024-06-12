import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = 3000;
import { pool, nuevaTransaccion, eliminarUsuario, nuevoUsuario, editarUsuario } from "./db/db.js";

app.use(express.json()); 

// GET: Devuelve la aplicación cliente disponible en el apoyo de la prueba.
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

// usuario POST: Recibe los datos de un nuevo usuario y los almacena en PostgreSQL.
app.post('/usuario', async (req, res) => {
    const { nombre, balance } = req.body;

    try {
        const nuevoUsuarioCreado = await nuevoUsuario(nombre, balance);
        res.status(201).json({ message: 'Usuario creado correctamente', usuario: nuevoUsuarioCreado });
        } catch (error) {
        console.error('Error al crear usuario:', error);
        if (error.code === '23505') { // Código de error de PostgreSQL para duplicado único
            res.status(409).json({ error: 'Ya existe un usuario con ese nombre' });
        } else {
            res.status(500).json({ error: 'Error en el servidor' });
        }
        }
});


//transferencia POST: Recibe los datos para realizar una nueva transferencia. 
//Se debe ocupar una transacción SQL en la consulta a la base de datos
app.post("/transferencia", async (req, res) => {
        const { emisorId, emisorNombre, receptorId, receptorNombre, monto } = req.body;
        //console.log('BODYUYYYYYYYYYY',req.body)
        try {
            const result = await nuevaTransaccion(emisorId, receptorId, emisorNombre, receptorNombre, monto);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
});


//usuarios GET: Devuelve todos los usuarios registrados con sus balances.
app.get('/usuarios', async (req, res) => {
        try {
        const result = await pool.query('SELECT * FROM usuarios'); // Realizar la consulta
        res.json(result.rows); // Enviar los resultados como JSON
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({ error: 'Error interno del servidor' }); // Enviar un error 500 en caso de fallo
        }
});

// /usuario PUT: Recibe los datos modificados de un usuario registrado y los actualiza.
app.put('/usuario/:id', async (req, res) => {
    const userId = req.params.id;
    const { nombre, balance } = req.body; 
        try {
        const usuarioActualizado = await editarUsuario(userId, nombre, balance); // Llamar a la función
        res.json({ message: 'Usuario actualizado correctamente', usuario: usuarioActualizado });
        } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// usuario DELETE: Recibe el id de un usuario registrado y lo elimina .
app.delete('/usuario/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const eliminado = await eliminarUsuario(userId);
        if (eliminado) {
        res.json({ message: 'Usuario eliminado correctamente' });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
        } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});



// /transferencias GET: Devuelve todas las transferencias almacenadas en la base de datos en formato de arreglo
//La consulta de la constante result debería estar en el archivo db.js
app.get('/transferencias', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT transferencias.fecha, u1.nombre AS emisor, u2.nombre AS receptor, transferencias.monto FROM transferencias JOIN usuarios AS u1 ON transferencias.emisor = u1.id JOIN usuarios AS u2 ON transferencias.receptor = u2.id;'); // Consulta para obtener todas las transferencias
        res.json(result.rows);
        } catch (error) {
        console.error('Error al obtener transferencias:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});


app.listen(PORT, () => console.log('Servidor encendido'))