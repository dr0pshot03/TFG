export interface Examen{
    id: string;
    id_asign: string;
    partes: number;
    convocatoria: Convocatoria;
    fecha_examen: Date;
    aula: string;
    n_present?: number;
    n_esperados: number;
    n_aprobados?: number;
    finalizado?: boolean;
    duracion_h: number;
    duracion_m: number;
}

export interface ExamenForm{
    id_asign: string;
    partes: number;
    convocatoria: Convocatoria;
    fecha_examen: Date;
    aula: string;
    n_present: number;
    duracion_h: number;
    duracion_m: number;
}

export interface CreateExamenInput extends Omit<Examen, 'id'> {}
export interface UpdateExamenInput extends Partial<Omit<Examen, 'id'>> {
  id: string;
}

export type Convocatoria = "Diciembre" | "Febrero" | "Junio" | "Septiembre";