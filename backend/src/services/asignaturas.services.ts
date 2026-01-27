import prisma from "./prisma.ts"

export interface asignatura{
    nombre: string;
    descripcion?: string;
    user_id: string;
}

export async function createAsignatura(data: asignatura) {
    try{
        return await prisma.asignatura.create({
            data : {
                nombre : data.nombre,
                descripcion: data.descripcion || "",
                user_id: data.user_id
            }
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
            where:{ user_id : userId}
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
        console.error("Error al obtener la asignatura", error);
        throw new Error("No se pudo obtener la asignatura");
    }
}

export async function updateAsignatura(id: string, data: Partial<asignatura>){
    try {
        const {
            nombre,
            descripcion,
            ...updateData
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

export async function deleteAsignatura(id: string){
    try {
        return await prisma.asignatura.delete({
            where:{ id : id}
        });
    } catch (error) {
        console.error("Error al eliminar la asignatura", error);
        throw new Error("No se pudo eliminar la asignatura");
    }
}