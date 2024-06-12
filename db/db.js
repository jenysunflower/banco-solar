import  pg  from 'pg';
const {Pool} = pg;


// Se realiza conexión a la bd de datos creada 'banco'. Dejo como nota que se recomienda que vaya en un.env
export const pool = new Pool({ 
    user: 'postgres',
    host: 'localhost',
    password: '1112',  //cambiar contraseña según corresponda
    database : 'banco-solar',
    port: 5432
}); 

// Función nueva transacción con todo lo que implica
export const nuevaTransaccion = async (emisorId, receptorId ,emisorNombre, receptorNombre, monto) => {
    const client = await pool.connect(); // Obtiene una conexión del pool
    console.log(`Emisor nombre: ${emisorNombre}, receptornombre: ${receptorNombre}, emisorId: ${emisorId}, receptorid: ${receptorId} y monto: ${monto}`)
    try {
        await client.query("BEGIN");
    
        // Verificamos el saldo antes de actualizar
        const emisorResult = await client.query(
            "SELECT balance FROM usuarios WHERE id = $1",
            [emisorId]
        );
        if (emisorResult.rows[0].balance < monto) {
            throw new Error("Saldo insuficiente");
        }
    
        const actualizarEmisor = {
            name: "actualizar - emisor",
            text: "UPDATE usuarios SET balance = balance - $1 WHERE id = $2 RETURNING *",
            values: [monto, emisorId],
        };
    
        const actualizarReceptor = {
            name: "actualizar-receptor",
            text: "UPDATE usuarios SET balance = balance + $1 WHERE id = $2 RETURNING *",
            values: [monto, receptorId],
        };
    
        // Se actualiza y se hace la inserción
        await client.query(actualizarEmisor);
        await client.query(actualizarReceptor);
    
        // Insertar en tabla transferencias
        const insertarTransferencia = {
            name: "insertar-transferencia",
            text:
            "INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES ($1, $2, $3, NOW()) RETURNING *;",
            values: [emisorId, receptorId, monto],
        };
        const result = await client.query(insertarTransferencia);
    
        await client.query("COMMIT"); // Solo un COMMIT al final de la transacción
    
        console.log("Transacción realizada con éxito");
        return result.rows[0]; // Devolvemos los detalles de la transacción
        } catch (error) {
        await client.query("ROLLBACK");
        console.error(`Error en la transacción: ${error.message}`);
        throw error;
        } finally {
        client.release(); 
        }
};



//Eliminar usuario
export const eliminarUsuario = async (userId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); 
        const eliminarUsuarioQuery = {
        name: 'eliminar-usuario',
        text: 'DELETE FROM usuarios WHERE id = $1 RETURNING *', 
        values: [userId],
    };

        const result = await client.query(eliminarUsuarioQuery);

        if (result.rowCount === 0) { 
            throw new Error('Usuario no encontrado');
        }

        await client.query('COMMIT'); 
        //console.log('Usuario eliminado correctamente:', result.rows[0]); 
        return result.rows[0]; 
        } catch (error) {
        await client.query('ROLLBACK'); 
            console.error('Error al eliminar usuario:', error.message);
        throw error; 
        } finally {
        client.release(); 
        }
};



//Crear nuevo usuario del banco
export const nuevoUsuario = async (nombre, balance) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
    
        const agregarUsuarioQuery = {
        name: 'agregar-usuario',
        text: 'INSERT INTO usuarios (nombre, balance) VALUES ($1, $2) RETURNING *',
        values: [nombre, balance], 
    };

        const result = await client.query(agregarUsuarioQuery);
        //console.log('resultde', result);
        await client.query('COMMIT');
    
        console.log('Usuario agregado correctamente:', result.rows[0]);
        return result.rows[0];
        } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al agregar usuario:', error.message);
        throw error;
        } finally {
        client.release();
        }
};

export const editarUsuario = async (id, nombre, balance) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
    
        const actualizarUsuarioQuery = {
            name: 'actualizar-usuario',
            text: 'UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = $3 RETURNING *',
            values: [nombre, balance, id],
        };
    
        const result = await client.query(actualizarUsuarioQuery);
        await client.query('COMMIT');
    
        if (result.rowCount === 0) {
            throw new Error('Usuario no encontrado');
        }
    
        console.log('Usuario actualizado correctamente:', result.rows[0]);
        return result.rows[0];
        } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al actualizar usuario:', error.message);
        throw error; 
        } finally {
        client.release();
        }
};