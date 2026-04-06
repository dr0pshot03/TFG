export interface historico {
    id: string;
    id_asignatura: string;
    curso: string;
    n_matriculados: number;
    n_presentados: number;
    porcentaje_aprobados: number;
    tipo_convocatoria: string;    
}

export interface CreateHistoricoInput extends Omit<historico, 'id'> {}
export interface UpdateHistoricoInput extends Partial<Omit<historico, 'id'>> {
  id: string;
}