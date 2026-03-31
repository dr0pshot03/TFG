import prisma from "./prisma.ts"

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
        return await prisma.sesion.create({
            data: {
                id_examen: data.id_examen,
                id_usuario: data.id_usuario,
                
            }
        });
    } catch (error) {
        console.error("Error al crear el historico", error);
        throw new Error("No se pudo crear el historico");
    }
}

export async function getHistorico(asignId: string){
    try {
        return await prisma.historico.findFirst({
            where:{ id_asignatura : asignId},
        });
    } catch (error) {
        console.error("Error al obtener el historico", error);
        throw new Error("No se pudo obtener el historico");
    }
}

export async function getOneHistorico(id: string){
    try {
        return await prisma.historico.findUnique({
            where:{ id : id},
        });
    } catch (error) {
        console.error("Error al obtener el historico por id", error);
        throw new Error("No se pudo obtener el historico por id");
    }
}

export async function updateHistorico(id: string, data: any) {
    try {
        const {
            curso,
            n_matriculados,
            n_presentados,
            porcentaje_aprobados,
            tipo_convocatoria,
        } = data;
        return await prisma.historico.update({
            where:{ id : id},
            data: {
                curso,
                n_matriculados,
                n_presentados,
                porcentaje_aprobados,
                tipo_convocatoria,
            }
        });
    } catch (error) {
        console.error("Error al actualizar toda el historico", error);
        throw new Error("No se pudo actualizar el historico");
    }
}

export async function deleteHistorico(id: string){
    try {
        return await prisma.historico.delete({
            where:{ id : id}
        });
    } catch (error) {
        console.error("Error al obtener el historico", error);
        throw new Error("No se pudo eliminar el historico");
    }
}