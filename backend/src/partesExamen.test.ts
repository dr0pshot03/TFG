const request = require('supertest');
const { app } = require('./app'); // Importamos la app sin arrancar el servidor

describe('Pruebas de Endpoints de Partes de Examen', () => {

  let idAsignatura = "";
  let idExamen = "";
  let idParte1 = "";
  let idParte2 = "";
  
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

  test('Crear parte 1', async () => {
    expect(idExamen).toBeTruthy();

    const payloadParte = {
      id_examen: idExamen,
      nombre: 'Parte test 1',
      num_parte: 1,
      duracion_h: 1,
      duracion_m: 0,
    };

    const respuestaParte = await request(app)
      .post('/api/partesExamen')
      .send(payloadParte);

    expect(respuestaParte.statusCode).toBe(201);
    expect(respuestaParte.body).toHaveProperty('id');
    idParte1 = respuestaParte.body.id;
    expect(idParte1).toBeTruthy();
    expect(respuestaParte.body.id_examen).toBe(idExamen);
    expect(respuestaParte.body.num_parte).toBe(1);
  });

  test('Crear parte 2', async () => {
    expect(idExamen).toBeTruthy();

    const payloadParte = {
      id_examen: idExamen,
      nombre: 'Parte test 2',
      num_parte: 2,
      duracion_h: 1,
      duracion_m: 30,
    };

    const respuestaParte = await request(app)
      .post('/api/partesExamen')
      .send(payloadParte);

    expect(respuestaParte.statusCode).toBe(201);
    expect(respuestaParte.body).toHaveProperty('id');
    idParte2 = respuestaParte.body.id;
    expect(idParte2).toBeTruthy();
    expect(respuestaParte.body.id_examen).toBe(idExamen);
    expect(respuestaParte.body.num_parte).toBe(2);
  });

  test('Obtener todas las partes del examen', async () => {
    expect(idExamen).toBeTruthy();

    const respuesta = await request(app)
      .get(`/api/partesExamen/${idExamen}`);

    expect(respuesta.statusCode).toBe(200);
    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThanOrEqual(2);
  });

  test('Obtener una parte', async () => {
    expect(idParte1).toBeTruthy();

    const respuesta = await request(app)
      .get(`/api/partesExamen/parte/${idParte1}`);

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.id).toBe(idParte1);
  });

  test('Actualizar parte', async () => {
    expect(idParte1).toBeTruthy();

    const payloadParte = {
      nombre: 'Parte test 1 actualizada',
      duracion_h: 1,
      duracion_m: 15,
    };

    const respuestaParte = await request(app)
      .put(`/api/partesExamen/${idParte1}`)
      .send(payloadParte);

    expect(respuestaParte.statusCode).toBe(200);
    expect(respuestaParte.body.nombre).toBe(payloadParte.nombre);
    expect(respuestaParte.body.duracion_m).toBe(payloadParte.duracion_m);
  });

  test('Sumar tiempo a una parte', async () => {
    expect(idParte1).toBeTruthy();

    const respuesta = await request(app)
      .put(`/api/partesExamen/${idParte1}/sumarTiempo`)
      .send({ tiempoExtra: 30 });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.duracion_h).toBeGreaterThanOrEqual(1);
  });

  test('Mover parte hacia arriba', async () => {
    expect(idParte2).toBeTruthy();

    const respuesta = await request(app)
      .put(`/api/partesExamen/${idParte2}/moveUp`);

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.id).toBe(idParte2);
  });

  test('Mover parte hacia abajo', async () => {
    expect(idParte2).toBeTruthy();

    const respuesta = await request(app)
      .put(`/api/partesExamen/${idParte2}/moveDown`);

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.id).toBe(idParte2);
  });

  test('Eliminar una parte', async () => {
    expect(idParte2).toBeTruthy();

    const respuesta = await request(app)
      .delete(`/api/partesExamen/${idParte2}`);

    expect(respuesta.statusCode).toBe(200);
  });
});