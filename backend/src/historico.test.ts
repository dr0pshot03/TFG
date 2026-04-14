const request = require('supertest');
const { app } = require('./app'); // Importamos la app sin arrancar el servidor

describe('Pruebas de Endpoints de Histórico', () => {

  let idAsignatura = "";
  let idHistorico = "";
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

  test('Crear histórico', async () => {
    expect(idAsignatura).toBeTruthy();

    const payloadHistorico = {
      id_asignatura: idAsignatura,
      curso: "2026",
      n_matriculados: 23,
      n_presentados: 14,
      porcentaje_aprobados: 50,
      tipo_convocatoria: "Ordinaria"
    };

    const respuestaHistorico = await request(app)
      .post('/api/historico')
      .send(payloadHistorico);
    
    expect(respuestaHistorico.statusCode).toBe(201);
    expect(respuestaHistorico.body).toHaveProperty('id');
    idHistorico = respuestaHistorico.body.id;
    expect(idHistorico).toBeTruthy();
    expect(respuestaHistorico.body.id_asignatura).toBe(payloadHistorico.id_asignatura);
  });

  test('Obtener todo el historico por asignatura', async () => {
    const respuesta = await request(app)
      .get(`/api/historico/${idAsignatura}`)
    
    expect(respuesta.statusCode).toBe(200);
    expect(Array.isArray(respuesta.body)).toBe(true);
  });

  test('Obtener un historico por su id', async () => {
    const respuesta = await request(app)
      .get(`/api/historico/historico/${idHistorico}`)
    
    expect(respuesta.statusCode).toBe(200);
  });

  test('Actualizar historico', async () => {
    const payloadHistorico = {
      id_asignatura: idAsignatura,
      curso: "2026/2027",
      n_matriculados: 50,
      porcentaje_aprobados: 50,
      tipo_convocatoria: "Ordinaria"
    };

    const respuesta = await request(app)
      .put(`/api/historico/${idHistorico}`)
      .send(payloadHistorico);
    
    expect(respuesta.statusCode).toBe(200);  
  });

  test('Eliminar historico', async () => {
    const respuesta = await request(app)
      .delete(`/api/historico/${idHistorico}`)

      expect(respuesta.statusCode).toBe(200);
  });  
});