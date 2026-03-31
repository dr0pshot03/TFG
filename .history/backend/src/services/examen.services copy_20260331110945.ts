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
                n_presentados: data.n_presentados
                porcenta
            }
        });
    } catch (error) {
        console.error("Error al crear el examen", error);
        throw new Error("No se pudo crear el examen");
    }
}

export async function getAllExamenes(asignId: string){
    try {
        return await prisma.examen.findMany({
            where:{ id_asign : asignId},
            include: {
                aulaAlumnos: true
            }
        });
    } catch (error) {
        console.error("Error al obtener los examenes", error);
        throw new Error("No se pudo obtener los examenes");
    }
}

export async function getExamen(id: string){
    try {
        return await prisma.examen.findUnique({
            where:{ id : id},
            include: {
                aulaAlumnos: true // Esto trae la lista de pares aula/alumnos
            }
        });
    } catch (error) {
        console.error("Error al obtener el examen", error);
        throw new Error("No se pudo obtener el examen");
    }
}

export async function updateExamen(id: string, body: any) {
    try {
        const allowedFields = [
            "convocatoria", "fecha_examen", "n_present", 
            "n_aprobados", "n_esperados", "finalizado", "partes", "aulaAlumnos"
        ];

        const data: Record<string, any> = {};

        for (const key of allowedFields) {
            if (body[key] !== undefined) data[key] = body[key];
        }

        if (body.aulaAlumnos && Array.isArray(body.aulaAlumnos)) {
            data.aulaAlumnos = {
                deleteMany: {}, 
                create: body.aulaAlumnos.map((item: any) => ({
                    aula: item.aula,
                    n_esperados: item.n_esperados
                }))
            };
        }

        if (Object.keys(data).length === 0) {
            throw new Error("No hay campos para actualizar");
        }

        return await prisma.examen.update({
            where: { id },
            data,
            include: { aulaAlumnos: true } // Para devolver el examen actualizado con sus aulas
        });
    } catch (error) {
        console.error("Error al actualizar el examen", error);
        throw new Error("No se pudo actualizar el examen");
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