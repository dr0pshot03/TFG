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
                fecha: data.fecha,
                estado: data.estado,
                n_present: data.n_present || 0,
                n_aprobados: data.n_aprobados || 0,
                n_esperados: data.n_esperados || 0
            }
        });
    } catch (error) {
        console.error("Error al crear la sesion", error);
        throw new Error("No se pudo crear la sesion");
    }
}

export async function getSesionbyExamen(examenId: string){
    try {
        return await prisma.sesion.findFirst({
            where:{ id_examen : examenId},
        });
    } catch (error) {
        console.error("Error al obtener la sesión por examen", error);
        throw new Error("No se pudo obtener la sesion por examen");
    }
}

export async function getSesionbyUser(userId: string){
    try {
        return await prisma.sesion.findFirst({
            where:{ id_usuario : userId},
        });
    } catch (error) {
        console.error("Error al obtener la sesión por usuario", error);
        throw new Error("No se pudo obtener la sesion por usuario");
    }
}

export async function updateSesion(id: string, data: any) {
    try {
        const {
            
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