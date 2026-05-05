import prisma from "./prisma.js"
import { getSesionbyId } from "./sesion.services.js";

export interface prediccion {
    id: string;
    id_sesion: string;
    asistencia_estimada: number;
    aulas_necesarias: number;
    nivel_confianza: number;   
}

export async function createPrediccion(data: prediccion) {
    try {
        const sesion = await getSesionbyId(data.id_sesion);

        if (!sesion) {
            throw new Error("Sesión no encontrada");
        }

        return await prisma.prediccion.create({
            data: {
                id_sesion: data.id_sesion,
                asistencia_estimada: data.asistencia_estimada,
                aulas_necesarias: data.aulas_necesarias,
                nivel_confianza: data.nivel_confianza,
            }
        });
    } catch (error) {
        if (error instanceof Error && error.message === "Sesión no encontrada") {
            throw error;
        }

        console.error("Error al crear la prediccion", error);
        throw new Error("No se pudo crear la prediccion");
    }
}

export async function getPrediccion(id: string){
    try {
        const prediccion = await prisma.prediccion.findUnique({
            where:{ id : id},
        });

        if (!prediccion) {
            throw new Error("Prediccion no encontrada");
        }

        return prediccion;
    } catch (error) {
        if (error instanceof Error && error.message === "Prediccion no encontrada") {
            throw error;
        }

        console.error("Error al obtener la prediccion", error);
        throw new Error("No se pudo obtener la prediccion");
    }
}

export async function getAllPredicciones(idSesion: string){
    try {
        const sesion = await getSesionbyId(idSesion);

        if (!sesion) {
            throw new Error("Sesión no encontrada");
        }

        return await prisma.prediccion.findMany({
            where:{ id_sesion : idSesion},
        });
    } catch (error) {
        if (error instanceof Error && error.message === "Sesión no encontrada") {
            throw error;
        }

        console.error("Error al obtener las predicciones", error);
        throw new Error("No se pudo obtener las predicciones");
    }
}

export async function updatePrediccion(id: string, data: any) {
    try {
        const prediccion = await prisma.prediccion.findUnique({ where: { id } });

        if (!prediccion) {
            throw new Error("Prediccion no encontrada");
        }

        const {
            asistencia_estimada,
            aulas_necesarias,
            nivel_confianza
        } = data;

        if (
            asistencia_estimada === undefined &&
            aulas_necesarias === undefined &&
            nivel_confianza === undefined
        ) {
            throw new Error("No hay campos para actualizar");
        }

        return await prisma.prediccion.update({
            where:{ id : id},
            data: {
                asistencia_estimada,
                aulas_necesarias,
                nivel_confianza
            }
        });
    } catch (error) {
        if (
            error instanceof Error &&
            (error.message === "Prediccion no encontrada" || error.message === "No hay campos para actualizar")
        ) {
            throw error;
        }

        console.error("Error al actualizar la prediccion", error);
        throw new Error("No se pudo actualizar la prediccion");
    }
}

export async function deletePrediccion(id: string){
    try {
        const prediccion = await prisma.prediccion.findUnique({ where: { id } });

        if (!prediccion) {
            throw new Error("Prediccion no encontrada");
        }

        return await prisma.prediccion.delete({
            where:{ id : id}
        });
    } catch (error) {
        if (error instanceof Error && error.message === "Prediccion no encontrada") {
            throw error;
        }

        console.error("Error al obtener la prediccion", error);
        throw new Error("No se pudo eliminar la prediccion");
    }
}