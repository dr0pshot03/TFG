import { randomUUID } from "node:crypto";
import request from "supertest";
import { app } from "./app";

describe("Test de /api/partesExamen", () => {
  const userId = randomUUID();
  let parteExamenId = "";
  let asignaturaId = "";
  let examenId = "";

  beforeAll(async () => {
    const resAsignatura = await request(app).post("/api/asignaturas/").send({
      user_id: userId,
      nombre: "AAED",
      descripcion: "Asignatura para tests de examen",
    });

    expect(resAsignatura.statusCode).toBe(200);
    expect(resAsignatura.body.asignatura?.id).toBeDefined();

    asignaturaId = resAsignatura.body.asignatura.id;

    const resExamen = await request(app).post("/api/examen/").send({
      id_asign: asignaturaId,
      partes: 2,
      convocatoria: "Junio",
      fecha_examen: new Date().toISOString(),
      n_esperados: 40,
      duracion_h: 2,
      duracion_m: 30,
      aulaAlumnos: [
        { aula: "A-01", n_esperados: 20 },
        { aula: "A-02", n_esperados: 20 },
      ],
    });

    expect(resExamen.statusCode).toBe(201);
    expect(resExamen.body.id).toBeDefined();

    examenId = resExamen.body.id;
  });

  test("POST parte examen correcto, devuelve 201", async () => {
    const res = await request(app).post("/api/partesExamen/").send({
      id_examen: examenId,
      nombre: "Parte 1",
      num_parte: 1,
      duracion_h: 2,
      duracion_m: 10,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();

    parteExamenId = res.body.id;
  });

  test("GET asignatura correcta, devuelve 200", async () => {
    const res = await request(app).get(`/api/partesExamen/parte/${parteExamenId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(parteExamenId);
  });

  test("GET partes examen correcta, devuelve 200", async () => {
    const res = await request(app).get(`/api/partesExamen/${examenId}`);

    expect(res.statusCode).toBe(200);
  });

  test("PUT parte examen correcta, devuelve 200", async () => {
    const res = await request(app)
      .put(`/api/partesExamen/${parteExamenId}`)
      .send({ 
        nombre: "Parte 1 actualizada",
        duracion_h: 4,
        duracion_m: 10,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.nombre).toBe("Parte 1 actualizada");
  });

  test("DELETE parte examen correcta, devuelve 200", async () => {
    const res = await request(app).delete(`/api/partesExamen/${parteExamenId}`);

    expect(res.statusCode).toBe(200);
  });
});