import { Models } from "@rematch/core";

import { toastModel } from "./toast.model.ts";
import asignaturaModel from "./asignatura.model.ts";
import examenModel from "./examen.model.ts";
import parteExamenModel from "./partesExamen.model.ts";

export interface IRootModel extends Models<IRootModel> {
  asignaturaModel: typeof asignaturaModel;
  examenModel: typeof examenModel;
  parteExamenModel: typeof parteExamenModel;
  toastModel: typeof toastModel;
}

export const models: IRootModel = {
  asignaturaModel,
  examenModel,
  parteExamenModel,
  toastModel,
};
