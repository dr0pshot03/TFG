const request = require('supertest');
const { app } = require('./app'); // Importamos la app sin arrancar el servidor

describe('Pruebas de Endpoints de Examen', () => {

  let idAsignatura = "";
  let idExamen = "";
  
  test('Crear asignatura base', async () => {
    const payloadAsignatura = {
      nombre: 'Matematicas',
      descripcion: 'Algebra y calculo',
      user_id: 'user_3A6kzPYRudNqqslBg2mRbTNoyKY',
    };

    const respuestaAsignatura = await request(app)
      .post('/api/asignaturas')
      .send(payloadAsignatura);
    
    expect(respuestaAsignatura.statusCode).toBe(201);
    expect(respuestaAsignatura.body).toHaveProperty('id');
    idAsignatura = respuestaAsignatura.body.id;
    expect(idAsignatura).toBeTruthy();
  });

  test('Crear examen', async () => {
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
        { aula: 'A1', n_esperados: 60 },
        { aula: 'A2', n_esperados: 60 },
      ],
    };

    const respuestaExamen = await request(app)
      .post('/api/examen')
      .send(payloadExamen);
    
    expect(respuestaExamen.statusCode).toBe(201);
    expect(respuestaExamen.body).toHaveProperty('id');
    idExamen = respuestaExamen.body.id;
    expect(idExamen).toBeTruthy();
    expect(respuestaExamen.body.id_asign).toBe(payloadExamen.id_asign);
    expect(respuestaExamen.body.partes).toBe(payloadExamen.partes);
    expect(respuestaExamen.body.convocatoria).toBe(payloadExamen.convocatoria);
  });

  test('Obtener todos los examenes de la asignatura', async () => {
    expect(idAsignatura).toBeTruthy();
    const respuesta = await request(app)
      .get(`/api/examen/asignatura/${idAsignatura}`)
    
    expect(respuesta.statusCode).toBe(200);
    expect(Array.isArray(respuesta.body)).toBe(true);
  });

  test('Obtener un examen', async () => {
    expect(idExamen).toBeTruthy();
    const respuesta = await request(app)
      .get(`/api/examen/${idExamen}`)
    
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.id).toBe(idExamen);
  });

  test('Actualizar examen', async () => {
    expect(idExamen).toBeTruthy();

    const payloadExamen = {
      convocatoria: 'Septiembre',
      fecha_examen: new Date().toISOString(),
      tipo_convocatoria: 'Extraordinaria',
      aulaAlumnos: [
        { aula: 'A1', n_esperados: 60 },
        { aula: 'A2', n_esperados: 90 },
      ],
    };

    const respuestaExamen = await request(app)
      .patch(`/api/examen/${idExamen}`)
      .send(payloadExamen);
    
    expect(respuestaExamen.statusCode).toBe(200);
    expect(respuestaExamen.body.convocatoria).toBe(payloadExamen.convocatoria);
  });

  test('Eliminar un examen', async () => {
    expect(idExamen).toBeTruthy();
    const respuesta = await request(app)
      .delete(`/api/examen/${idExamen}`)
    
    expect(respuesta.statusCode).toBe(200);
  });
});