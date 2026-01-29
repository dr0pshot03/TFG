export interface Asignatura{
    id: string;
    user_id: string;
    nombre: string;
    descripcion: string;
}

export interface AsignaturaForm{
    user_id: string;
    nombre: string;
    descripcion: string;
}

export interface CreateAsignaturaInput extends Omit<Asignatura, 'id'> {}
export interface UpdateAsignaturaInput extends Partial<Omit<Asignatura, 'id'>> {
  id: string;
}