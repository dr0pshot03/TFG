import type { sesion as Sesion } from "./sesion.type";

export interface Examen {
  id: string;
  id_asign: string;
  partes: number;
  convocatoria: Convocatoria;
  fecha_examen: Date;
  aula: string;
  finalizado?: boolean;
  duracion_h: number;
  duracion_m: number;
  tipo_convocatoria: Tipo_Convocatoria;
  sesion?: Sesion[];

  aulaAlumnos: {
    id?: string;
    aula: string;
    n_esperados: number;
  }[];
}

export interface ExamenForm {
  id_asign: string;
  partes: number;
  convocatoria: Convocatoria;
  fecha_examen: Date;
  duracion_h: number;
  duracion_m: number;
}

export interface CreateExamenInput extends Omit<Examen, "id" | "sesion"> {}
export interface UpdateExamenInput extends Partial<Omit<Examen, "id" | "sesion">> {
  id: string;
}

export type Convocatoria = "Diciembre" | "Febrero" | "Junio" | "Septiembre";

export type Tipo_Convocatoria = "Ordinaria" | "Extraordinaria";