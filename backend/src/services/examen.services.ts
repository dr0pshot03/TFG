import prisma from "./prisma.ts"

export const Convocatoria = {
    Febrero: "Febrero",
    Junio: "Junio",
    Septiembre: "Septiembre",
    Diciembre: "Diciembre",
} as const;

export type Convocatoria = typeof Convocatoria[keyof typeof Convocatoria];

export interface examen {
    id: string;
    id_asign: string;
    partes: number;
    convocatoria: Convocatoria;
    fecha_examen: Date;
    aula: string;
    n_present?: number;
    n_esperados: number;
    n_aprobados?: number;
    finalizado?: boolean;
    duracion_h: number;
    duracion_m: number;
}

export async function createExamen(data: examen) {
    try{
        return await prisma.examen.create({
            data : {
                id_asign : data.id_asign,
                partes : data.partes,
                convocatoria : data.convocatoria,
                fecha_examen : data.fecha_examen,
                duracion_h : data.duracion_h,
                duracion_m : data.duracion_m,
                aula: data.aula,
                n_esperados: data.n_esperados,
            }
        })
    }catch(error)
    {
        console.error("Error al crear el examen", error);
        throw new Error("No se pudo crear el examen");
    }
    
}

export async function getAllExamenes(asignId: string){
    try {
        return await prisma.examen.findMany({
            where:{ id_asign : asignId}
        });
    } catch (error) {
        console.error("Error al obtener los examenes", error);
        throw new Error("No se pudo obtener los examenes");
    }
}

export async function getExamen(id: string){
    try {
        return await prisma.examen.findUnique({
            where:{ id : id}
        });
    } catch (error) {
        console.error("Error al obtener el examen", error);
        throw new Error("No se pudo obtener el examen");
    }
}

export async function updateExamen(id: string, body : any){
    try {
        const allowedFields = [
            "convocatoria",
            "fecha_examen",
            "aula",
            "n_present",
            "n_aprobados",
            "finalizado",
            "partes"
        ];

        const data: Record<string, any> = {};

        for (const key of allowedFields) {
            if (body[key] !== undefined) data[key] = body[key];
        }

        if (Object.keys(data).length === 0) {
            throw new Error("No hay campos para actualizar");
        }

        return prisma.examen.update({
            where: { id },
            data
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