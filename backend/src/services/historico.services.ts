import prisma from "./prisma.js"
import { getAsignatura } from "./asignaturas.services.js";

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
        const asignatura = await getAsignatura(data.id_asignatura);

        if (!asignatura) {
            throw new Error("Asignatura no encontrada");
        }

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
        if (error instanceof Error && error.message === "Asignatura no encontrada") {
            throw error;
        }

        console.error("Error al crear el historico", error);
        throw new Error("No se pudo crear el historico");
    }
}

export async function getHistorico(asignId: string){
    try {
        const asignatura = await getAsignatura(asignId);

        if (!asignatura) {
            throw new Error("Asignatura no encontrada");
        }

        return await prisma.historico.findMany({
            where:{ id_asignatura : asignId},
        });
    } catch (error) {
        if (error instanceof Error && error.message === "Asignatura no encontrada") {
            throw error;
        }

        console.error("Error al obtener el historico", error);
        throw new Error("No se pudo obtener el historico");
    }
}

export async function searchHistoricoProfesor(query: string){
    try {
        const normalizeText = (value: string) =>
            value
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .trim();

        const normalizedQuery = normalizeText(query);
        if (!normalizedQuery) return [];

        const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

        const historicos = await prisma.historico.findMany({
            orderBy: [
                { apellidos_p: "asc" },
                { nombre_p: "asc" },
                { curso: "desc" },
            ],
        });

        return historicos.filter((item) => {
            const nombre = normalizeText(item.nombre_p);
            const apellidos = normalizeText(item.apellidos_p);
            const fullName = `${nombre} ${apellidos}`.trim();

            return queryTokens.every(
                (token) =>
                    nombre.includes(token) ||
                    apellidos.includes(token) ||
                    fullName.includes(token)
            );
        });
    } catch (error) {
        console.error("Error al buscar historico por profesor", error);
        throw new Error("No se pudo buscar historico por profesor");
    }
}

export async function getOneHistorico(id: string){
    try {
        const historico = await prisma.historico.findUnique({
            where:{ id : id},
        });

        if (!historico) {
            throw new Error("Historico no encontrado");
        }

        return historico;
    } catch (error) {
        if (error instanceof Error && error.message === "Historico no encontrado") {
            throw error;
        }

        console.error("Error al obtener el historico por id", error);
        throw new Error("No se pudo obtener el historico por id");
    }
}

export async function updateHistorico(id: string, data: any) {
    try {
        const historico = await prisma.historico.findUnique({ where: { id } });

        if (!historico) {
            throw new Error("Historico no encontrado");
        }

        const {
            nombre_p,
            apellidos_p,
            curso,
            n_matriculados,
            n_presentados,
            porcentaje_aprobados,
            tipo_convocatoria,
            convocatoria,
        } = data;

        if (
            nombre_p === undefined &&
            apellidos_p === undefined &&
            curso === undefined &&
            n_matriculados === undefined &&
            n_presentados === undefined &&
            porcentaje_aprobados === undefined &&
            tipo_convocatoria === undefined &&
            convocatoria == undefined
        ) {
            throw new Error("No hay campos para actualizar");
        }

        return await prisma.historico.update({
            where:{ id : id},
            data: {
                nombre_p,
                apellidos_p,
                curso,
                n_matriculados,
                n_presentados,
                porcentaje_aprobados,
                tipo_convocatoria,
                convocatoria
            }
        });
    } catch (error) {
        if (error instanceof Error && (error.message === "Historico no encontrado" || error.message === "No hay campos para actualizar")) {
            throw error;
        }

        console.error("Error al actualizar toda el historico", error);
        throw new Error("No se pudo actualizar el historico");
    }
}

export async function deleteHistorico(id: string){
    try {
        const historico = await prisma.historico.findUnique({ where: { id } });

        if (!historico) {
            throw new Error("Historico no encontrado");
        }

        return await prisma.historico.delete({
            where:{ id : id}
        });
    } catch (error) {
        if (error instanceof Error && error.message === "Historico no encontrado") {
            throw error;
        }

        console.error("Error al obtener el historico", error);
        throw new Error("No se pudo eliminar el historico");
    }
}