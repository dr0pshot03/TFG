const request = require('supertest');
const { app } = require('./app'); // Importamos la app sin arrancar el servidor

describe('Pruebas de Endpoints de Evento', () => {

  let idAsignatura = "";
  let idExamen = "";
  let idSesion = "";
  let idEvento = "";
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

  test('Crear sesión base', async () => {
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
  });

  test('Crear evento', async () => {
    expect(idSesion).toBeTruthy();

    const payloadEvento = {
      id_sesion: idSesion,
      timestamp: new Date().toISOString(),
      tipo_evento: "Hola"
    };

    const respuestaEvento = await request(app)
      .post('/api/evento')
      .send(payloadEvento);
    
    expect(respuestaEvento.statusCode).toBe(201);
    expect(respuestaEvento.body).toHaveProperty('id');
    idEvento= respuestaEvento.body.id;
    expect(idEvento).toBeTruthy();
  });

  test('Obtener todas las predicciones por evento', async () => {
    const respuesta = await request(app)
      .get(`/api/evento/sesion/${idSesion}`)
    
    expect(respuesta.statusCode).toBe(200);
    expect(Array.isArray(respuesta.body)).toBe(true);
  });

  test('Obtener una evento', async () => {
    const respuesta = await request(app)
      .get(`/api/evento/${idEvento}`)
    
    expect(respuesta.statusCode).toBe(200);
  });

  test('Eliminar evento', async () => {
    const respuesta = await request(app)
      .delete(`/api/evento/${idEvento}`)

      expect(respuesta.statusCode).toBe(200);
  });  
});