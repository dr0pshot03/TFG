import prisma from "./prisma.ts"

export const Convocatoria = {
    Febrero: "Febrero",
    Junio: "Junio",
    Septiembre: "Septiembre",
    Diciembre: "Diciembre",
} as const;

export const Tipo_Convocatoria = {
    Ordinaria: "Ordinaria",
    Extraordinaria: "Extraordinaria"
} as const;

export type Convocatoria = typeof Convocatoria[keyof typeof Convocatoria];

export type Tipo_Convocatoria = typeof Tipo_Convocatoria[keyof typeof Tipo_Convocatoria];

export interface historico {
    id: string;
    id_asignatura: string;
    nombre_p: string,
    apellidos_p: string;
    curso: string;
    n_matriculados: number;
    n_presentados: number;
    porcentaje_aprobados: number;
    tipo_convocatoria: Tipo_Convocatoria;   
    convocatoria: Convocatoria; 
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
                tipo_convocatoria: data.tipo_convocatoria,
                convocatoria: data.convocatoria,
                nombre_p: data.nombre_p,
                apellidos_p: data.apellidos_p
            }
        });
    } catch (error) {
        console.error("Error al crear el historico", error);
        throw new Error("No se pudo crear el historico");
    }
}

export async function getHistorico(asignId: string){
    try {
        return await prisma.historico.findMany({
            where:{ id_asignatura : asignId},
        });
    } catch (error) {
        console.error("Error al obtener el historico", error);
        throw new Error("No se pudo obtener el historico");
    }
}

export async function searchHistoricoProfesor(query: string){
    try {
        const normalizedQuery = query.trim();
        if (!normalizedQuery) return [];

        return await prisma.historico.findMany({
            where: {
                OR: [
                    { nombre_p: { contains: normalizedQuery, mode: "insensitive" } },
                    { apellidos_p: { contains: normalizedQuery, mode: "insensitive" } },
                    {
                        AND: normalizedQuery.split(/\s+/).filter(Boolean).map((token) => ({
                            OR: [
                                { nombre_p: { contains: token, mode: "insensitive" } },
                                { apellidos_p: { contains: token, mode: "insensitive" } },
                            ],
                        })),
                    },
                ],
            },
            orderBy: [
                { apellidos_p: "asc" },
                { nombre_p: "asc" },
                { curso: "desc" },
            ],
        });
    } catch (error) {
        console.error("Error al buscar historico por profesor", error);
        throw new Error("No se pudo buscar historico por profesor");
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