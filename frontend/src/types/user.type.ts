export interface Usuario{
    clerkId: string;
    nombre: string;
    apellidos: string;
    email: string;
}

export interface UpdateUsuario extends Partial<Omit<Usuario, 'clerkId'>> {
  clerkId: string;
}