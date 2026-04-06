import prisma from "./prisma.ts"

export interface prediccion {
    id: string;
    id_sesion: string;
    asistencia_estimada: number;
    aulas_necesarias: number;
    nivel_confianza: number;   
}

export async function createPrediccion(data: prediccion) {
    try {
        return await prisma.prediccion.create({
            data: {
                id_sesion: data.id_sesion,
                asistencia_estimada: data.asistencia_estimada,
                aulas_necesarias: data.aulas_necesarias,
                nivel_confianza: data.nivel_confianza,
            }
        });
    } catch (error) {
        console.error("Error al crear la prediccion", error);
        throw new Error("No se pudo crear la prediccion");
    }
}

export async function getPrediccion(id: string){
    try {
        return await prisma.prediccion.findUnique({
            where:{ id : id},
        });
    } catch (error) {
        console.error("Error al obtener la prediccion", error);
        throw new Error("No se pudo obtener la prediccion");
    }
}

export async function getAllPredicciones(idSesion: string){
    try {
        return await prisma.prediccion.findMany({
            where:{ id_sesion : idSesion},
        });
    } catch (error) {
        console.error("Error al obtener las predicciones", error);
        throw new Error("No se pudo obtener las predicciones");
    }
}

export async function updatePrediccion(id: string, data: any) {
    try {
        const {
            asistencia_estimada,
            aulas_necesarias,
            nivel_confianza
        } = data;
        return await prisma.prediccion.update({
            where:{ id : id},
            data: {
                asistencia_estimada,
                aulas_necesarias,
                nivel_confianza
            }
        });
    } catch (error) {
        console.error("Error al actualizar la prediccion", error);
        throw new Error("No se pudo actualizar la prediccion");
    }
}

export async function deletePrediccion(id: string){
    try {
        return await prisma.prediccion.delete({
            where:{ id : id}
        });
    } catch (error) {
        console.error("Error al obtener la prediccion", error);
        throw new Error("No se pudo eliminar la prediccion");
    }
}