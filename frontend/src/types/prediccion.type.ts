export interface prediccion {
    id: string;
    id_sesion: string;
    asistencia_estimada: number;
    aulas_necesarias: number;
    nivel_confianza: number;   
}

export interface CreatePrediccionInput extends Omit<prediccion, 'id'> {}
export interface UpdatePrediccionInput extends Partial<Omit<prediccion, 'id'>> {
  id: string;
}