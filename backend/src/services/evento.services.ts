import prisma from "./prisma.ts"

export interface evento {
    id: string;
    id_sesion: string;
    timestamp: Date;
    tipo_evento: string;  
}

export async function createEvento(data: evento) {
    try {
        return await prisma.evento.create({
            data: {
                id_sesion: data.id_sesion,
                timestamp: data.timestamp,
                tipo_evento: data.tipo_evento
            }
        });
    } catch (error) {
        console.error("Error al crear el evento", error);
        throw new Error("No se pudo crear el evento");
    }
}

export async function getEvento(id: string){
    try {
        return await prisma.evento.findUnique({
            where:{ id : id},
        });
    } catch (error) {
        console.error("Error al obtener el evento", error);
        throw new Error("No se pudo obtener el evento");
    }
}

export async function getAllEvento(idSesion: string){
    try {
        return await prisma.evento.findMany({
            where:{ id_sesion : idSesion},
        });
    } catch (error) {
        console.error("Error al obtener los eventos", error);
        throw new Error("No se pudo obtener los eventos");
    }
}

export async function deleteEvento(id: string){
    try {
        return await prisma.evento.delete({
            where:{ id : id}
        });
    } catch (error) {
        console.error("Error al eliminar el evento", error);
        throw new Error("No se pudo eliminar el evento");
    }
}