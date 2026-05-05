import prisma from "./prisma.js"
import { getSesionbyId } from "./sesion.services.js";

export interface evento {
    id: string;
    id_sesion: string;
    timestamp: Date;
    tipo_evento: string;  
}

export async function createEvento(data: evento) {
    try {
        const sesion = await getSesionbyId(data.id_sesion);

        if (!sesion) {
            throw new Error("Sesión no encontrada");
        }

        return await prisma.evento.create({
            data: {
                id_sesion: data.id_sesion,
                timestamp: data.timestamp,
                tipo_evento: data.tipo_evento
            }
        });
    } catch (error) {
        if (error instanceof Error && error.message === "Sesión no encontrada") {
            throw error;
        }

        console.error("Error al crear el evento", error);
        throw new Error("No se pudo crear el evento");
    }
}

export async function getEvento(id: string){
    try {
        const evento = await prisma.evento.findUnique({
            where:{ id : id},
        });

        if (!evento) {
            throw new Error("Evento no encontrado");
        }

        return evento;
    } catch (error) {
        if (error instanceof Error && error.message === "Evento no encontrado") {
            throw error;
        }

        console.error("Error al obtener el evento", error);
        throw new Error("No se pudo obtener el evento");
    }
}

export async function getAllEvento(idSesion: string){
    try {
        const sesion = await getSesionbyId(idSesion);

        if (!sesion) {
            throw new Error("Sesión no encontrada");
        }

        return await prisma.evento.findMany({
            where:{ id_sesion : idSesion},
            orderBy: { timestamp: "asc" },
        });
    } catch (error) {
        if (error instanceof Error && error.message === "Sesión no encontrada") {
            throw error;
        }

        console.error("Error al obtener los eventos", error);
        throw new Error("No se pudo obtener los eventos");
    }
}

export async function deleteEvento(id: string){
    try {
        const evento = await prisma.evento.findUnique({
            where:{ id : id}
        });

        if (!evento) {
            throw new Error("Evento no encontrado");
        }

        return await prisma.evento.delete({
            where:{ id : id}
        });
    } catch (error) {
        if (error instanceof Error && error.message === "Evento no encontrado") {
            throw error;
        }

        console.error("Error al eliminar el evento", error);
        throw new Error("No se pudo eliminar el evento");
    }
}