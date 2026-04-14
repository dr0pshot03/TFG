const request = require('supertest');
const { app } = require('./app'); // Importamos la app sin arrancar el servidor

describe('Pruebas de Endpoints de Sesión', () => {

  let idAsignatura = "";
  let idExamen = "";
  let idSesion = "";
  const idUsuario = 'user_3A6kzPYRudNqqslBg2mRbTNoyKY';
  
  test('Crear asignatura base', async () => {
    const payloadAsignatura = {
      nombre: 'Matematicas',
      descripcion: 'Algebra y calculo',
      user_id: idUsuario,
    };

    const respuestaAsignatura = await request(app)
      .post('/api/asignaturas')
      .send(payloadAsignatura);
    
    expect(respuestaAsignatura.statusCode).toBe(201);
    expect(respuestaAsignatura.body).toHaveProperty('id');
    idAsignatura = respuestaAsignatura.body.id;
    expect(idAsignatura).toBeTruthy();
  });

  test('Crear examen base', async () => {
    expect(idAsignatura).toBeTruthy();

    const payloadExamen = {
      id_asign: idAsignatura,
      partes: 2,
      convocatoria: 'Junio',
      fecha_examen: new Date().toISOString(),
      duracion_h: 2,
      duracion_m: 0,
      tipo_convocatoria: 'Ordinaria',
      aulaAlumnos: [
        { aula: 'A1', n_esperados: 50 },
        { aula: 'A2', n_esperados: 50 },
      ],
    };

    const respuestaExamen = await request(app)
      .post('/api/examen')
      .send(payloadExamen);

    expect(respuestaExamen.statusCode).toBe(201);
    expect(respuestaExamen.body).toHaveProperty('id');
    idExamen = respuestaExamen.body.id;
    expect(idExamen).toBeTruthy();
  });

  test('Crear sesión', async () => {
    expect(idExamen).toBeTruthy();

    const payloadSesion = {
      id_examen: idExamen,
      id_usuario: idUsuario,
      fecha: new Date().toISOString(),
      estado: 'iniciada',
      n_present: 0,
      n_esperados: 100,
      n_aprobados: 0,
    };

    const respuestaSesion = await request(app)
      .post('/api/sesion')
      .send(payloadSesion);
    
    expect(respuestaSesion.statusCode).toBe(201);
    expect(respuestaSesion.body).toHaveProperty('id');
    idSesion = respuestaSesion.body.id;
    expect(idSesion).toBeTruthy();
    expect(respuestaSesion.body.id_examen).toBe(payloadSesion.id_examen);
    expect(respuestaSesion.body.id_usuario).toBe(payloadSesion.id_usuario);
    expect(respuestaSesion.body.estado).toBe(payloadSesion.estado);
  });

  test('Obtener todas las sesiones por usuario', async () => {
    const respuesta = await request(app)
      .get('/api/sesion/usuario/user_3A6kzPYRudNqqslBg2mRbTNoyKY')
    
    expect(respuesta.statusCode).toBe(200);
    expect(Array.isArray(respuesta.body)).toBe(true);
  });

  test('Obtener todas las sesiones por examen', async () => {
    const respuesta = await request(app)
      .get(`/api/sesion/examen/${idExamen}`)
    
    expect(respuesta.statusCode).toBe(200);
    expect(Array.isArray(respuesta.body)).toBe(true);
  });

  test('Obtener una sesión por id', async () => {
    expect(idSesion).toBeTruthy();
    const respuesta = await request(app)
      .get(`/api/sesion/${idSesion}`)
    
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.id).toBe(idSesion);
  });

  test('Actualizar sesion', async () => {
    const payloadSesion = {
      
      fecha: new Date().toISOString(),
      estado: 'iniciada',
      n_present: 0,
      n_esperados: 100,
      n_aprobados: 0,
    };

    const respuesta = await request(app)
      .put(`/api/sesion/${idSesion}`)
      .send(payloadSesion);
    
    expect(respuesta.statusCode).toBe(200);  
    
  });

  test('Eliminar sesion', async () => {
    const respuesta = await request(app)
      .delete(`/api/sesion/${idSesion}`)

      expect(respuesta.statusCode).toBe(200);
  });  
});