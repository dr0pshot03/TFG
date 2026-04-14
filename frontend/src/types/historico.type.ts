import type { Convocatoria } from "./examen.type";

export interface historico {
    id: string;
    id_asignatura: string;
    nombre_p: string,
    apellidos_p: string;
    curso: string;
    n_matriculados: number;
    n_presentados: number;
    porcentaje_aprobados: number;
    convocatoria: Convocatoria;
    tipo_convocatoria: string;    
}

export interface CreateHistoricoInput extends Omit<historico, 'id'> {}
export interface UpdateHistoricoInput extends Partial<Omit<historico, 'id'>> {
  id: string;
}