import prisma from "./prisma.js"

export interface parteExamen{
    id: string;
    id_examen: string;
    nombre: string;
    duracion_h: number;
    duracion_m: number;
}

export async function createParte(data: parteExamen) {
    try{
        return await prisma.parteExamen.create({
            data
        })
    }catch(error)
    {
        console.error("Error al crear la parte del examen", error);
        throw new Error("No se pudo crear la parte del examen");
    }
    
}

export async function getAllPartes(id: string){
    try {
        return await prisma.parteExamen.findMany({
            where:{ id_examen : id}
        });
    } catch (error) {
        console.error("Error al obtener todas las partes del examen", error);
        throw new Error("No se pudo obtener las partes del examen");
    }
}

export async function getParte(id: string){
    try {
        return await prisma.partesExamen.findUnique({
            where:{ id : id}
        });
    } catch (error) {
        console.error("Error al obtener todas las partes del examen", error);
        throw new Error("No se pudo obtener las partes del examen");
    }
}

export async function updateParte(id: string){
    try {
        return await prisma.partesExamen.update({
            where:{ id : id},
            data: {

            }
        });
    } catch (error) {
        console.error("Error al obtener todas las asignaturas", error);
        throw new Error("No se pudo obtener las asignaturas");
    }
}

export async function deleteParte(id: string){
    try {
        return await prisma.partesExamen.delete({
            where:{ id : id}
        });
    } catch (error) {
        console.error("Error al obtener todas las partes del examen", error);
        throw new Error("No se pudo obtener las partes del examen");
    }
}