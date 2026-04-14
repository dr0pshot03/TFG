const request = require('supertest');
const { app } = require('./app'); // Importamos la app sin arrancar el servidor

describe('Pruebas de Endpoints de Asignatura', () => {

  let id = ""
  
  test('Crear asignatura', async () => {
    const payload = {
      nombre: 'Matematicas',
      descripcion: 'Algebra y calculo',
      user_id: 'user_3A6kzPYRudNqqslBg2mRbTNoyKY',
    };

    const respuesta = await request(app)
      .post('/api/asignaturas')
      .send(payload);
    
    expect(respuesta.statusCode).toBe(201);
    expect(respuesta.body).toHaveProperty('id');
    id = respuesta.body.id;
    expect(id).toBeTruthy();
    
    expect(respuesta.body.nombre).toBe(payload.nombre);
    expect(respuesta.body.user_id).toBe(payload.user_id);
  });

  test('Obtener todas las asignaturas', async () => {
    const respuesta = await request(app)
      .get('/api/asignaturas/usuario/user_3A6kzPYRudNqqslBg2mRbTNoyKY')
    
    expect(respuesta.statusCode).toBe(200);
    expect(Array.isArray(respuesta.body)).toBe(true);
  });

  test('Obtener una asignatura', async () => {
    expect(id).toBeTruthy();
    const respuesta = await request(app)
      .get(`/api/asignaturas/${id}`)
    
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.id).toBe(id);
  });

  test('Actualizar asignatura', async () => {
    const payload = {
      nombre: 'Lengua',
      descripcion: 'Sintaxis',
    };

    const respuesta = await request(app)
      .put(`/api/asignaturas/${id}`)
      .send(payload);
    
    expect(respuesta.statusCode).toBe(200);  
    expect(respuesta.body.nombre).toBe(payload.nombre);
  });

  test('Actualizar asignatura', async () => {
    const respuesta = await request(app)
      .delete(`/api/asignaturas/${id}`)
    
    expect(respuesta.statusCode).toBe(200);  
  });
});