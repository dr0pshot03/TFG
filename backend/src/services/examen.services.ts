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
    nombre: string;
    partes: string;
    convocatoria: Convocatoria;
    anno: string;
    duracion_h: number;
    duracion_m: number;
}

export async function createExamen(data: examen) {
    try{
        return await prisma.examen.create({
            data
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
            where:{ asignId : asignId}
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

export async function updateExamen(id: string, data : Partial<examen>){
    try {
        const {
            id_asign,
            nombre,
            partes,
            convocatoria,
            anno,
            duracion_h,
            duracion_m,
            ...updateData
        } = data;
        return await prisma.examen.update({
            where:{ id : id},
            data: {
                id_asign,
                nombre,
                partes,
                convocatoria,
                anno,
                duracion_h,
                duracion_m
            }
        });
    } catch (error) {
        console.error("Error al actualizar el examen", error);
        throw new Error("No se pudo actualizar los examenes");
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