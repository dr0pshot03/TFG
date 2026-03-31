import { randomUUID } from "node:crypto";
import request from "supertest";
import { app } from "./app";

describe("Test de /api/asignaturas", () => {
  const userId = randomUUID();
  let asignaturaId = "";

  test("POST asignatura correcta, devuelve 200", async () => {
    const res = await request(app).post("/api/asignaturas/").send({
      user_id: userId,
      nombre: "AAED",
      descripcion: "Complicada",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.asignatura?.id).toBeDefined();

    asignaturaId = res.body.asignatura.id;
  });

  test("GET asignatura correcta, devuelve 200", async () => {
    const res = await request(app).get(`/api/asignaturas/${asignaturaId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(asignaturaId);
  });

  test("GET asignaturas correcta, devuelve 200", async () => {
    const res = await request(app).get(`/api/asignaturas/usuario/${userId}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((asignatura: { id: string }) => asignatura.id === asignaturaId)).toBe(true);
  });

  test("PUT asignatura correcta, devuelve 200", async () => {
    const res = await request(app)
      .put(`/api/asignaturas/${asignaturaId}`)
      .send({ nombre: "EDNL", descripcion: "Aun mas complicada" });

    expect(res.statusCode).toBe(200);
    expect(res.body.nombre).toBe("EDNL");
  });

  test("DELETE asignatura correcta, devuelve 200", async () => {
    const res = await request(app).delete(`/api/asignaturas/${asignaturaId}`);

    expect(res.statusCode).toBe(200);
  });
});