import prisma from "./prisma.ts"

export interface parteExamen{
    id: string;
    id_examen: string;
    nombre: string;
    num_parte: number;
    duracion_h: number;
    duracion_m: number;
}

export interface CreateParteExamenInput extends Omit<parteExamen, 'id'> {}

export async function createParte(data: CreateParteExamenInput) {
    try{
        return await prisma.partesExamen.create({
            data : {
                id_examen : data.id_examen,
                nombre: data.nombre,
                num_parte: data.num_parte,
                duracion_h: data.duracion_h,
                duracion_m: data.duracion_m,
            }
        })
    }catch(error)
    {
        console.error("Error al crear la parte del examen", error);
        throw new Error("No se pudo crear la parte del examen");
    }
    
}

export async function getAllPartes(id: string){
    try {
        return await prisma.partesExamen.findMany({
            where:{ id_examen : id},
            orderBy: { num_parte: "asc" },
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

export async function updateParte(id: string, data : Partial<parteExamen>){
    try {
        const {
            nombre,
            duracion_h,
            duracion_m,
        } = data
        return await prisma.partesExamen.update({
            where:{ id : id},
            data: {
                nombre,
                duracion_h,
                duracion_m
            }
        });
    } catch (error) {
        console.error("Error al actualizar la parte del examen", error);
        throw new Error("No se pudo actualizar la parte del examen");
    }
}

export async function moveUpParte(id: string){
    try {
        return await prisma.$transaction(async (tx) => {
            const current = await tx.partesExamen.findUnique({
                where: { id },
            });

            if (!current) {
                throw new Error("Parte de examen no encontrada");
            }

            const upper = await tx.partesExamen.findFirst({
                where: {
                    id_examen: current.id_examen,
                    num_parte: { lt: current.num_parte },
                },
                orderBy: { num_parte: "desc" },
            });

            if (!upper) {
                return current;
            }

            const tempOrder = -999999;
            await tx.partesExamen.update({
                where: { id: current.id },
                data: { num_parte: tempOrder },
            });

            await tx.partesExamen.update({
                where: { id: upper.id },
                data: { num_parte: current.num_parte },
            });

            return await tx.partesExamen.update({
                where: { id: current.id },
                data: { num_parte: upper.num_parte },
            });
        });
    } catch (error) {
        console.error("Error al mover hacia arriba la parte del examen", error);
        throw new Error("No se pudo mover hacia arriba la parte del examen");
    }
}

export async function moveDownParte(id: string){
    try {
        return await prisma.$transaction(async (tx) => {
            const current = await tx.partesExamen.findUnique({
                where: { id },
            });

            if (!current) {
                throw new Error("Parte de examen no encontrada");
            }

            const lower = await tx.partesExamen.findFirst({
                where: {
                    id_examen: current.id_examen,
                    num_parte: { gt: current.num_parte },
                },
                orderBy: { num_parte: "asc" },
            });

            if (!lower) {
                return current;
            }

            const tempOrder = -999999;
            await tx.partesExamen.update({
                where: { id: current.id },
                data: { num_parte: tempOrder },
            });

            await tx.partesExamen.update({
                where: { id: lower.id },
                data: { num_parte: current.num_parte },
            });

            return await tx.partesExamen.update({
                where: { id: current.id },
                data: { num_parte: lower.num_parte },
            });
        });
    } catch (error) {
        console.error("Error al mover hacia abajo la parte del examen", error);
        throw new Error("No se pudo mover hacia abajo la parte del examen");
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