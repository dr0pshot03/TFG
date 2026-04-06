export interface evento {
    id: string;
    id_sesion: string;
    timestamp: Date;
    tipo_evento: string;  
}

export interface CreateEventoInput extends Omit<evento, 'id'> {}
export interface UpdateEventoInput extends Partial<Omit<evento, 'id'>> {
  id: string;
}