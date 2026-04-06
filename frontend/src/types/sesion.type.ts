export interface sesion {
    id: string;
    id_examen: string;
    id_usuario: string;
    fecha: Date;
    estado: string;
    n_present?: number;
    n_esperados?: number;
    n_aprobados?: number;
}

export interface CreateSesionInput extends Omit<sesion, 'id, fecha'> {}
export interface UpdateSesionInput extends Partial<Omit<sesion, 'id'>> {
  id: string;
}