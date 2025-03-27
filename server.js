// Requiriendo las dependencias necesarias
var express = require('express');
var cors = require('cors');
var path = require('path');
var mysql = require('mysql2');

// Crear una instancia de la aplicación Express
var app = express();

// Usar CORS para permitir solicitudes desde el puerto 5500 (o el origen de tu frontend)
app.use(cors({
  origin: 'http://127.0.0.1:5500', // Aquí puedes ajustar esto al origen de tu frontend
}));

// Middlewares para la configuración básica de Express
app.use(express.json()); // Para parsear JSON en las solicitudes
app.use(express.urlencoded({ extended: false })); // Para parsear formularios

// Rutas del servidor
app.get('/', (req, res) => {
  res.send('¡Hola desde mi backend en Express!');
});

// Rutas adicionales
app.get('/hola', (req, res) => {
  res.send('¡Hola MUNDO GATO!');
});


//-------------------------------------------------------------------------------------
// CONSULTAS A MI BASE DE DATOS SQL EN MYSQL SERVER

const db = mysql.createConnection({

	host: 'localhost',
	user: 'root',
	password: 'Patitos.123', //modificar las credenciales de acuerdo a su sql
	database: 'examenLaboratorio2'
  
  })
  
  db.connect((err) => {
  
	if(err){
	  console.error('Error de conexión a la base de datos: ', err);
	  return;
	}
	console.log('Conexión a la base de datos establecida');
  
  });


  //CONSULTAR A LA TABLA GRADOS PARA EL SELECT
  app.get('/grados', (req, res) => {

	
	db.query('SELECT id, nombre FROM grados', (err, results) => {
	if (err) {
		console.error('Error al ejecutar la consulta: ', err);
		res.status(500).send('Error en la consulta');
	return;
	}

		res.json(results);
  
	});
  
  });


  //CONSULTA PARA EL REGISTRO

  app.post('/agregarMaestro', (req, res) => {
	let { nombre, email, password } = req.body;
	
	// Validar que los campos necesarios estén presentes
	if (!nombre || !email || !password) {
	  return res.status(400).json({ error: 'Todos los campos son obligatorios' });
	}
	
	// Crear la consulta SQL para insertar los datos
	let query = 'INSERT INTO maestros (nombre, email, password) VALUES (?, ?, ?)';
	
	// Ejecutar la consulta en la base de datos
	db.query(query, [nombre, email, password], (err, result) => {
	  if (err) {
		console.error('Error al insertar el usuario: ', err);
		return res.status(500).json({ error: 'Error al guardar el usuario' });
	  }
	  
	  // Responder con el ID del nuevo usuario insertado
	  res.status(201).json({ id: result.insertId, nombre, email, password });
	});
  });

  //CONSULTAR MAESTROS

  app.get('/maestros', (req, res) => {

	
	db.query('SELECT id, nombre, email, password FROM maestros', (err, results) => {
	if (err) {
		console.error('Error al ejecutar la consulta: ', err);
		res.status(500).send('Error en la consulta');
	return;
	}

		res.json(results);
  
	});
  
  });


  //CONSULTAR ALUMNOS

  app.get('/alumnos', (req, res) => {

	
	db.query('SELECT id, clave, nombre, email, grados_id FROM alumnos', (err, results) => {
	if (err) {
		console.error('Error al ejecutar la consulta: ', err);
		res.status(500).send('Error en la consulta');
	return;
	}

		res.json(results);
  
	});
  
  });


  //COMPARAR GRADOS CON ALUMNOS

  app.get('/comparacionGrados/:idGradoSel', (req, res) => {

	let alumno = req.params.idGradoSel;
  
  
	// Utiliza la variable de los grados sel en la consulta SQL
	db.query('SELECT * FROM alumnos WHERE  grados_id = ?', [alumno], (err, results) => {

	  if (err) {
		console.error('Error al ejecutar la consulta: ', err);
		res.status(500).send('Error en la consulta');
		return;
	  }
	  // Enviar los resultados de la consulta como respuesta en formato JSON
	  res.json(results);
	});
  });


  // AÑADIR DATOS A ASISTENCIA


  app.post('/agregarAsistencia', (req, res) => {
    let { maestros_id, grados_id, alumnos_id, fecha, asistencia, observaciones } = req.body;

    // Verificamos que los campos obligatorios sean proporcionados
    if (!maestros_id || !grados_id || !alumnos_id || !fecha || asistencia === undefined) {
        return res.status(400).json({ error: 'Todos los campos obligatorios (maestros_id, grados_id, alumnos_id, fecha, asistencia) deben ser proporcionados' });
    }

    // Si no se proporciona 'observaciones', podemos asignar un valor por defecto (NULL en este caso)
    if (!observaciones) {
        observaciones = null;
    }

    // Consulta SQL para insertar los datos en la tabla de asistencia
    let query = 'INSERT INTO asistencia (maestros_id, grados_id, alumnos_id, fecha, asistencia, observaciones) VALUES (?, ?, ?, ?, ?, ?)';

    db.query(query, [maestros_id, grados_id, alumnos_id, fecha, asistencia, observaciones], (err, result) => {
        if (err) {
            console.error('Error al insertar la asistencia: ', err);
            return res.status(500).json({ error: 'Error al guardar la asistencia' });
        }

        // Retornamos la respuesta con los datos insertados, incluyendo el id generado
        res.status(201).json({
            id: result.insertId,
            maestros_id,
            grados_id,
            alumnos_id,
            fecha,
            asistencia,
            observaciones
        });
    });
});

  




// Configurar el puerto en el que se escucharán las solicitudes
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

module.exports = app;