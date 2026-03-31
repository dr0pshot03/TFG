import prisma from "./prisma.ts"

export interface sesion {
    id: string;
    id_asignatura: string;
    curso: string;
    n_matriculados: number;
    n_presentados: number;
    porcentaje_aprobados: number;
    tipo_convocatoria: string;    
}

export async function createHistorico(data: historico) {
    try {
        return await prisma.historico.create({
            data: {
                id_asignatura: data.id_asignatura,
                curso: data.curso,
                n_matriculados: data.n_matriculados,
                n_presentados: data.n_presentados,
                porcentaje_aprobados: data.porcentaje_aprobados,
                tipo_convocatoria: data.tipo_convocatoria
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