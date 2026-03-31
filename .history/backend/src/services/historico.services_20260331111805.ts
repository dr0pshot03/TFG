import prisma from "./prisma.ts"

export interface historico {
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
            
        } = data;
        return await prisma.asignatura.update({
            where:{ id : id},
            data: {
                nombre,
                descripcion,
            }
        });
    } catch (error) {
        console.error("Error al actualizar toda la asignatura", error);
        throw new Error("No se pudo actualizar las asignatura");
    }
}

export async function updateConvocatoriaExamen(id: string, convocatoria : Convocatoria){
    try {
        return await prisma.examen.update({
            where:{ id : id},
            data: {
                convocatoria : convocatoria
            }
        });
    } catch (error) {
        console.error("Error al actualizar la convocatoria del examen", error);
        throw new Error("No se pudo actualizar la convocatoria del examen");
    }
}

export async function updateTiempoExamen(id: string, data : Partial<examen>){
    try {
        return await prisma.examen.update({
            where:{ id : id},
            data: {
                duracion_h : data.duracion_h,
                duracion_m: data.duracion_m,
                partes: data.partes,
            }
        });
    } catch (error) {
        console.error("Error al actualizar la duración del examen", error);
        throw new Error("No se pudo actualizar la duración del examen");
    }
}

export async function updateEstadoExamen(id: string){
    try {
        return await prisma.examen.update({
            where:{ id : id},
            data: {
                finalizado: true
            }
        });
    } catch (error) {
        console.error("Error al actualizar el estado finalizado del examen", error);
        throw new Error("No se pudo actualizar el estado finalizado del examen");
    }
}

export async function deleteExamen(id: string){
    try {
        return await prisma.examen.delete({
            where:{ id : id}
        });
    } catch (error) {
        console.error("Error al obtener el examen", error);
        throw new Error("No se pudo eliminar el examen");
    }
}