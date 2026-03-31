import prisma from "./prisma"

export interface sesion {
    id: string;
    id_examen: string;
    id_usuario: string;
    fecha: Date;
    n_present?: number;
    n_esperados: number;
    n_aprobados?: number;
}

export async function createSesion(data: sesion) {
    try {
        return await prisma.sesion.create({
            data: {
                id_examen: data.id_examen,
                id_usuario: data.id_usuario,
                fecha: data.fecha,
                n_esperados: data.n_esperados
            }
        });
    } catch (error) {
        console.error("Error al crear la sesion", error);
        throw new Error("No se pudo crear la sesion");
    }
}

export async function getAllSesiones(examenId: string){
    try {
        return await prisma.sesion.findMany({
            where:{ id_examen : examenId},
        });
    } catch (error) {
        console.error("Error al obtener las sesiones", error);
        throw new Error("No se pudo obtener las sesiones");
    }
}

export async function getSesion(id: string){
    try {
        return await prisma.sesion.findUnique({
            where:{ id : id},
        });
    } catch (error) {
        console.error("Error al obtener la sesion", error);
        throw new Error("No se pudo obtener la sesion");
    }
}

export async function updateSesion(id: string, data: any) {
    try {
        const {
            fecha,
            n_present,
            n_aprobados,
            n_esperados,
        } = data;
        return await prisma.sesion.update({
            where:{ id : id},
            data: {
                fecha,
                n_aprobados,
                n_esperados,
                n_present
            }
        });
    } catch (error) {
        console.error("Error al actualizar la sesion", error);
        throw new Error("No se pudo actualizar la sesion");
    }
}


export async function deleteSesion(id: string){
    try {
        return await prisma.sesion.delete({
            where:{ id : id}
        });
    } catch (error) {
        console.error("Error al eliminar la sesion", error);
        throw new Error("No se pudo eliminar la sesion");
    }
}