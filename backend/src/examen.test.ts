import { randomUUID } from "node:crypto";
import request from "supertest";
import { app } from "./app";

describe("Test de /api/examen", () => {
  const userId = randomUUID();
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
  });

  test("POST examen correcta, devuelve 201", async () => {
    const res = await request(app).post("/api/examen/").send({
      id_asign: asignaturaId,
      partes: 2,
      convocatoria: "Junio",
      fecha_examen: new Date().toISOString(),
      duracion_h: 2,
      duracion_m: 30,
      aulaAlumnos: [
        { aula: "A-01", n_esperados: 20 },
        { aula: "A-02", n_esperados: 20 },
      ],
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();

    examenId = res.body.id;
  });

  test("GET examen correcta, devuelve 200", async () => {
    const res = await request(app).get(`/api/examen/${examenId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(examenId);
  });

  test("GET examenes por asignatura correcta, devuelve 200", async () => {
    const res = await request(app).get(`/api/examen/asignatura/${asignaturaId}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((examen: { id: string }) => examen.id === examenId)).toBe(true);
  });

  test("PATCH examen correcta, devuelve 200", async () => {
    const res = await request(app).patch(`/api/examen/${examenId}`).send({
      aulaAlumnos: [{ aula: "A-03", n_esperados: 45 }],
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.aulaAlumnos[0].aula).toBe("A-03");
  });

  test("DELETE examen correcta, devuelve 200", async () => {
    const res = await request(app).delete(`/api/examen/${examenId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Examen eliminado correctamente");
  });

  afterAll(async () => {
    if (asignaturaId) {
      await request(app).delete(`/api/asignaturas/${asignaturaId}`);
    }
  });
});