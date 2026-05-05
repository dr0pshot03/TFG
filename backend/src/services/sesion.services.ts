import prisma from "./prisma.js"
import { getExamen } from "./examen.services.js";
import { getUser } from "./user.service.js";

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

export async function createSesion(data: sesion) {
    try {
        const examen = await getExamen(data.id_examen);

        if (!examen) {
            throw new Error("Examen no encontrado");
        }

        const usuario = await getUser(data.id_usuario);

        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }

        return await prisma.sesion.create({
            data: {
                id_examen: data.id_examen,
                id_usuario: data.id_usuario,
                fecha: data.fecha,
                estado: data.estado,
                n_present: data.n_present || 0,
                n_aprobados: data.n_aprobados || 0,
                n_esperados: data.n_esperados || 0
            }
        });
    } catch (error) {
        if (
            error instanceof Error &&
            (error.message === "Examen no encontrado" || error.message === "Usuario no encontrado")
        ) {
            throw error;
        }

        console.error("Error al crear la sesion", error);
        throw new Error("No se pudo crear la sesion");
    }
}

export async function getSesionbyExamen(examenId: string){
    try {
        const examen = await getExamen(examenId);

        if (!examen) {
            throw new Error("Examen no encontrado");
        }

        return await prisma.sesion.findMany({
            where:{ id_examen : examenId},
        });
    } catch (error) {
        if (error instanceof Error && error.message === "Examen no encontrado") {
            throw error;
        }

        console.error("Error al obtener la sesión por examen", error);
        throw new Error("No se pudo obtener la sesion por examen");
    }
}

export async function getSesionbyUser(userId: string){
    try {
        const usuario = await getUser(userId);

        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }

        return await prisma.sesion.findMany({
            where:{ id_usuario : userId},
        });
    } catch (error) {
        if (error instanceof Error && error.message === "Usuario no encontrado") {
            throw error;
        }

        console.error("Error al obtener la sesión por usuario", error);
        throw new Error("No se pudo obtener la sesion por usuario");
    }
}

export async function getSesionbyId(id: string){
    try {
        const sesion = await prisma.sesion.findUnique({
            where:{ id : id},
        });

        if (!sesion) {
            throw new Error("Sesion no encontrada");
        }

        return sesion;
    } catch (error) {
        if (error instanceof Error && error.message === "Sesion no encontrada") {
            throw error;
        }

        console.error("Error al obtener la sesión por id", error);
        throw new Error("No se pudo obtener la sesion por id");
    }
}

export async function updateSesion(id: string, data: any) {
    try {
        const sesion = await prisma.sesion.findUnique({ where: { id } });

        if (!sesion) {
            throw new Error("Sesion no encontrada");
        }

        const {
            fecha,
            estado,
            n_present,
            n_aprobados,
            n_esperados
        } = data;

        if (
            fecha === undefined &&
            estado === undefined &&
            n_present === undefined &&
            n_aprobados === undefined &&
            n_esperados === undefined
        ) {
            throw new Error("No hay campos para actualizar");
        }

        return await prisma.sesion.update({
            where:{ id : id},
            data: {
                fecha,
                estado,
                n_present,
                n_aprobados,
                n_esperados
            }
        });
    } catch (error) {
        if (
            error instanceof Error &&
            (error.message === "Sesion no encontrada" || error.message === "No hay campos para actualizar")
        ) {
            throw error;
        }

        console.error("Error al actualizar la sesion", error);
        throw new Error("No se pudo actualizar la sesion");
    }
}

export async function deleteSesion(id: string){
    try {
        const sesion = await prisma.sesion.findUnique({ where: { id } });

        if (!sesion) {
            throw new Error("Sesion no encontrada");
        }

        return await prisma.sesion.delete({
            where:{ id : id}
        });
    } catch (error) {
        if (error instanceof Error && error.message === "Sesion no encontrada") {
            throw error;
        }

        console.error("Error al obtener la sesion", error);
        throw new Error("No se pudo eliminar la sesion");
    }
}