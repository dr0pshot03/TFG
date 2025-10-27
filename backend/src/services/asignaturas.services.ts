import prisma from "./prisma.js"

export interface asignatura{
    id: string;
    nombre: string;
    descripcion?: string;
    user_id: string;
}

export interface ICreateTaskInput extends Omit<ITask, 'id'> {}
export interface IUpdateTaskInput extends Partial<Omit<ITask, 'id'>> {
    id: string;
}

export async function createAsignatura(data: asignatura) {
    try{
        return await prisma.asignatura.create({
            data
        })
    }catch(error)
    {
        console.error("Error al crear la asignatura", error);
        throw new Error("No se pudo crear la asignatura");
    }
    
}

export async function getAllAsignaturas(userId: string){
    try {
        return await prisma.asignatura.findMany({
            where:{ userId : userId}
        });
    } catch (error) {
        console.error("Error al obtener todas las asignaturas", error);
        throw new Error("No se pudo obtener las asignaturas");
    }
}

export async function getAsignatura(id: string){
    try {
        return await prisma.asignatura.findUnique({
            where:{ id : id}
        });
    } catch (error) {
        console.error("Error al obtener todas las asignaturas", error);
        throw new Error("No se pudo obtener las asignaturas");
    }
}

export async function updateAsignatura(id: string){
    try {
        return await prisma.asignatura.update({
            where:{ id : id},
            data: {

            }
        });
    } catch (error) {
        console.error("Error al obtener todas las asignaturas", error);
        throw new Error("No se pudo obtener las asignaturas");
    }
}

export async function deleteAsignatura(id: string){
    try {
        return await prisma.asignatura.delete({
            where:{ id : id}
        });
    } catch (error) {
        console.error("Error al obtener todas las asignaturas", error);
        throw new Error("No se pudo obtener las asignaturas");
    }
}