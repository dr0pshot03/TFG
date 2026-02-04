export interface parteExamen{
    id: string;
    id_examen: string;
    num_parte: number;
    nombre: string;
    duracion_h: number;
    duracion_m: number;
}

export interface parteExamenForm{
    id_examen: string;
    duracion_h: number;
    duracion_m: number;
}

export interface CreateParteExamenInput extends Omit<parteExamen, 'id'> {}
export interface UpdateParteExamenInput extends Partial<Omit<parteExamen, 'id'>> {
  id: string;
}