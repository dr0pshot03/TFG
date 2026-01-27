export interface Asignatura{
    id: String;
    user_id: string;
    nombre: string;
    descripcion: string;
    created_at: Date;
    updated_at: Date;
}

export interface AsignaturaForm{
    user_id: string;
    nombre: string;
    descripcion: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateAsignaturaInput extends Omit<Asignatura, 'id'> {}
export interface UpdateAsignaturaInput extends Partial<Omit<Asignatura, 'id'>> {
  id: string;
}