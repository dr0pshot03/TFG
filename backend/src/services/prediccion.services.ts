import prisma from "./prisma.js";
import { getSesionbyId } from "./sesion.services.js";
import { getHistorico } from "./historico.services.js";
import { getAllExamenes } from "./examen.services.js";
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface prediccion {
    id: string;
    id_sesion: string;
    curso?: string | null;
    convocatoria?: string | null;
    asistencia_estimada: number;
    aulas_necesarias: number;
    nivel_confianza: number;
}

export async function createPrediccion(data: prediccion) {
    try {
        const sesion = await getSesionbyId(data.id_sesion);

        if (!sesion) {
            throw new Error("Sesión no encontrada");
        }

        return await prisma.prediccion.create({
            data: {
                id_sesion: data.id_sesion,
                curso: data.curso ?? null,
                convocatoria: data.convocatoria ?? null,
                asistencia_estimada: data.asistencia_estimada,
                aulas_necesarias: data.aulas_necesarias,
                nivel_confianza: data.nivel_confianza,
            }
        });
    } catch (error) {
        if (
            error instanceof Error &&
            (
                error.message === "Sesión no encontrada"
            )
        ) {
            throw error;
        }

        console.error("Error al crear la prediccion", error);
        throw new Error("No se pudo crear la prediccion");
    }
}

export async function getPrediccion(id: string){
    try {
        const prediccion = await prisma.prediccion.findUnique({
            where:{ id : id},
        });

        if (!prediccion) {
            throw new Error("Prediccion no encontrada");
        }

        return prediccion;
    } catch (error) {
        if (error instanceof Error && error.message === "Prediccion no encontrada") {
            throw error;
        }

        console.error("Error al obtener la prediccion", error);
        throw new Error("No se pudo obtener la prediccion");
    }
}

export async function getAllPredicciones(idSesion: string){
    try {
        const sesion = await getSesionbyId(idSesion);

        if (!sesion) {
            throw new Error("Sesión no encontrada");
        }

        return await prisma.prediccion.findMany({
            where:{ id_sesion : idSesion},
        });
    } catch (error) {
        if (error instanceof Error && error.message === "Sesión no encontrada") {
            throw error;
        }

        console.error("Error al obtener las predicciones", error);
        throw new Error("No se pudo obtener las predicciones");
    }
}

async function savePrediccionesAsignatura(
    targets: Target[],
    resultados: Array<{ Pred?: number; pred_mean?: number; std?: number }>,
    aulasNecesariasPorConv: Map<string, number>,
    sessionIds: Array<string | null>
) {
    if (!targets.length || !resultados.length) return;

    const data = resultados.map((resultado, index) => {
        const target = targets[index];
        const idSesion = sessionIds[index] ?? null;
        const convocatoria = String(target?.convocatoria ?? '').toUpperCase();
        const asistenciaEstim = Number(resultado.Pred ?? resultado.pred_mean ?? 0);
        const confianza = resultado.std !== undefined
            ? Math.max(0, Math.min(100, Math.round((1 - Math.min(1, Number(resultado.std))) * 100)))
            : 0;

        return {
            id_sesion: idSesion,
            curso: String(target?.curso ?? ''),
            convocatoria: convocatoria || null,
            asistencia_estimada: Number.isFinite(asistenciaEstim) ? Math.round(asistenciaEstim) : 0,
            aulas_necesarias: (asistenciaEstim / 30) < 1 ? 1 : (asistenciaEstim / 30),
            nivel_confianza: confianza,
        };
    });

    await prisma.prediccion.createMany({ data });
}

export async function updatePrediccion(id: string, data: any) {
    try {
        const prediccion = await prisma.prediccion.findUnique({ where: { id } });

        if (!prediccion) {
            throw new Error("Prediccion no encontrada");
        }

        const {
            asistencia_estimada,
            aulas_necesarias,
            nivel_confianza
        } = data;

        if (
            asistencia_estimada === undefined &&
            aulas_necesarias === undefined &&
            nivel_confianza === undefined
        ) {
            throw new Error("No hay campos para actualizar");
        }

        return await prisma.prediccion.update({
            where:{ id : id},
            data: {
                asistencia_estimada,
                aulas_necesarias,
                nivel_confianza
            }
        });
    } catch (error) {
        if (
            error instanceof Error &&
            (error.message === "Prediccion no encontrada" || error.message === "No hay campos para actualizar")
        ) {
            throw error;
        }

        console.error("Error al actualizar la prediccion", error);
        throw new Error("No se pudo actualizar la prediccion");
    }
}

export async function deletePrediccion(id: string){
    try {
        const prediccion = await prisma.prediccion.findUnique({ where: { id } });

        if (!prediccion) {
            throw new Error("Prediccion no encontrada");
        }

        return await prisma.prediccion.delete({
            where:{ id : id}
        });
    } catch (error) {
        if (error instanceof Error && error.message === "Prediccion no encontrada") {
            throw error;
        }

        console.error("Error al obtener la prediccion", error);
        throw new Error("No se pudo eliminar la prediccion");
    }
}

export async function computePrediccion(payload: any) {
    try {
        const scriptPath = path.resolve(process.cwd(), 'prediccion_api.py');
        const venvPython = path.resolve(process.cwd(), '..', '.venv', 'bin', 'python3');
        const pythonExecutable = fs.existsSync(venvPython) ? venvPython : 'python3';
        const toSend = typeof payload === 'object' ? payload : { entradas: payload };
        const result = execFileSync(pythonExecutable, [scriptPath], {
            input: JSON.stringify(toSend),
            encoding: 'utf8',
            maxBuffer: 20 * 1024 * 1024,
        });

        return JSON.parse(result);
    } catch (error) {
        console.error('Error al ejecutar predicción', error);
        // intentar extraer stderr del error para depuración
        const errAny = error as any;
        const stderr = errAny?.stderr ?? errAny?.message ?? String(error);
        console.error('stderr:', stderr);
        throw new Error('Error al ejecutar predicción: ' + (typeof stderr === 'string' ? stderr.substring(0, 1000) : String(stderr)));
    }
}

// Transforma historial y targets crudos en entradas que entiende el modelo
export type HistRow = {
    id?: string;
    id_asignatura: string;
    nombre_p?: string;
    apellidos_p?: string;
    curso: string | number;
    n_matriculados: number;
    n_presentados: number;
    porcentaje_aprobados: number;
    convocatoria: string; // ENERO, JUNIO, SEPTIEMBRE, FEBRERO
    tipo_convocatoria?: string;
    semestre?: number;
}

export type Target = { id_asignatura: string; curso: number; convocatoria: string; cap?: number };

function normalizePct(p: number){
    if (!p) return 0;
    return p > 1 ? p / 100 : p;
}

function normalizeConvocatoria(convocatoria: string) {
    return String(convocatoria ?? '')
        .trim()
        .toUpperCase();
}

function semestreFromConvocatoria(convocatoria: string) {
    return normalizeConvocatoria(convocatoria) === 'SEPTIEMBRE' ? 2 : 1;
}

function periodoFrom(convocatoria: string, semestre: number){
    const normalizedConvocatoria = normalizeConvocatoria(convocatoria);
    if (semestre % 2 === 0) {
        return { 'JUNIO':'PRIMERA','SEPTIEMBRE':'SEGUNDA','ENERO':'TERCERA','FEBRERO':'TERCERA' }[normalizedConvocatoria];
    } else {
        return { 'ENERO':'PRIMERA','FEBRERO':'PRIMERA','JUNIO':'SEGUNDA','SEPTIEMBRE':'TERCERA' }[normalizedConvocatoria];
    }
}

function convOrder(convocatoria: string, semestre: number){
    const normalizedConvocatoria = normalizeConvocatoria(convocatoria);
    if (semestre % 2 === 0) {
        return { 'JUNIO': 1, 'SEPTIEMBRE': 2, 'ENERO': 3, 'FEBRERO': 3 }[normalizedConvocatoria];
    } else {
        return { 'ENERO': 1, 'FEBRERO': 1, 'JUNIO': 2, 'SEPTIEMBRE': 3 }[normalizedConvocatoria];
    }
}

export async function computeFromHistorial(historial: HistRow[], targets?: Target[], options?: { debug?: boolean }) {
    try {
        if (!Array.isArray(historial) || historial.length === 0) {
            throw new Error('Historial vacío o inválido');
        }

        if (targets !== undefined && !Array.isArray(targets)) {
            throw new Error('Targets inválidos: deben ser un array');
        }

        // 1) normalizar filas
        const rows = historial.map(r => {
            const CURSO = typeof r.curso === 'string' ? parseInt(r.curso as string, 10) : (r.curso as number);
            const PRESENTADOS = r.n_presentados || 0;
            const APROBADOS = Math.round(PRESENTADOS * normalizePct(r.porcentaje_aprobados || 0));
            const NP = (r.n_matriculados || 0) - PRESENTADOS;
            const PENDIENTES = (PRESENTADOS - APROBADOS) + NP;
            const SEMESTRE = r.semestre ?? semestreFromConvocatoria(r.convocatoria);
            return {
                ...r,
                CURSO,
                PRESENTADOS,
                APROBADOS,
                NP,
                PENDIENTES,
                SEMESTRE,
                PERIODO: periodoFrom(r.convocatoria, SEMESTRE),
                CONV_ORDER: convOrder(r.convocatoria, SEMESTRE),
            } as any;
        });

        // 2) ordenar y obtener último pendientes por asignatura
        rows.sort((a,b) => {
            if (a.id_asignatura !== b.id_asignatura) return String(a.id_asignatura).localeCompare(String(b.id_asignatura));
            if (a.CURSO !== b.CURSO) return a.CURSO - b.CURSO;
            return a.CONV_ORDER - b.CONV_ORDER;
        });

        const lastPendientesByAsig = new Map<string, number>();
        const lastMatriculadosByAsig = new Map<string, number>();
        for (const r of rows) {
            lastPendientesByAsig.set(r.id_asignatura, r.PENDIENTES || 0);
            lastMatriculadosByAsig.set(r.id_asignatura, r.n_matriculados || 0);
        }

        // 3) construir targets por defecto si no se proporcionan: siguiente convocatoria (ejemplo simple)
        const generatedTargets: Target[] = targets && targets.length ? targets : rows.length ? [{
            id_asignatura: rows[rows.length-1].id_asignatura,
            curso: rows[rows.length-1].CURSO + 1,
            convocatoria: 'JUNIO',
        }] : [];

        // 4) construir entradas que entiende el modelo
        const entradas = generatedTargets.map(t => {
            const asignatura = t.id_asignatura;
            const pendPrev = lastPendientesByAsig.get(asignatura) ?? 0;
            const semestre = semestreFromConvocatoria(t.convocatoria);
            const periodo = periodoFrom(t.convocatoria, semestre);
            return {
                ASIGNATURA: asignatura,
                PENDIENTES_PREV: pendPrev,
                PERIODO_SEGUNDA: periodo === 'SEGUNDA' ? 1 : 0,
                PERIODO_TERCERA: periodo === 'TERCERA' ? 1 : 0,
                CONVOCATORIA: String(t.convocatoria).toUpperCase(),
            };
        });

        // 5) Obtener todo el historico de la BD para entrenamiento global
        const allHist = await prisma.historico.findMany();
        const train = allHist.map(h => ({
            id_asignatura: h.id_asignatura,
            curso: h.curso,
            n_matriculados: h.n_matriculados,
            n_presentados: h.n_presentados,
            porcentaje_aprobados: h.porcentaje_aprobados,
            convocatoria: h.convocatoria,
            tipo_convocatoria: h.tipo_convocatoria,
            semestre: (h as any).semestre ?? undefined,
        }));

        // 6) Intentar obtener capacidad esperada desde los examenes existentes
        const examCapsByAsig = new Map<string, Map<string, number>>();
        for (const asig of Array.from(lastMatriculadosByAsig.keys())) {
            try {
                const exams = await getAllExamenes(asig).catch(() => []);
                const mapConv = new Map<string, number>();
                for (const ex of exams) {
                    const conv = String(ex.convocatoria ?? '').toUpperCase();
                    const sum = (ex.aulaAlumnos ?? []).reduce((s: number, a: any) => s + (a.n_esperados ?? 0), 0);
                    const sessionArr: any[] = (ex as any).sesion ?? [];
                    const sessionCap = (sessionArr.length && (sessionArr[0]?.n_esperados ?? 0)) ? Number(sessionArr[0].n_esperados) : 0;
                    const capVal = sessionCap > 0 ? sessionCap : Math.max(sum, mapConv.get(conv) ?? 0);
                    mapConv.set(conv, capVal);
                }
                examCapsByAsig.set(asig, mapConv);
            } catch (err) {
                // ignore per-asig errors
            }
        }

        // 7) construir caps alineado con entradas y delegar en computePrediccion enviando train + entradas + caps
        const caps: Array<number | null> = generatedTargets.map((t) => {
            const asign = t.id_asignatura;
            // prioridad: explicit target.cap
            if (t.cap && Number(t.cap) > 0) return Number(t.cap);
            const conv = String(t.convocatoria ?? '').toUpperCase();
            const convMap = examCapsByAsig.get(asign);
            if (convMap && conv) {
                const c = convMap.get(conv);
                if (c && c > 0) return c;
            }
            const last = lastMatriculadosByAsig.get(asign);
            return last ?? null;
        });

        const rawResults = await computePrediccion({ train, entradas, caps });

        // 8) Post-procesado: recortar predicciones usando capacidad del examen si existe, sino último n_matriculados
        const clipped = rawResults.map((r: any, idx: number) => {
            try {
                const asign = r.Asignatura ?? r.asignatura ?? null;
                if (!asign) return r;
                const entrada = entradas[idx] ?? {};
                const conv = String(entrada.CONVOCATORIA ?? '').toUpperCase();

                let cap: number | undefined = undefined;
                // Priorizar cap explícito pasado en targets si existe
                const explicitTarget = generatedTargets[idx] ?? undefined;
                if (explicitTarget && explicitTarget.cap && Number(explicitTarget.cap) > 0) {
                    cap = Number(explicitTarget.cap);
                }
                const convMap = examCapsByAsig.get(asign);
                if ((cap === undefined || cap === null) && convMap && conv) {
                    const c = convMap.get(conv);
                    if (c && c > 0) cap = c;
                }

                if (cap === undefined) cap = lastMatriculadosByAsig.get(asign);
                if (cap === undefined || cap === null) return r;

                const pred = typeof r.Pred === 'number' ? r.Pred : (r.pred_mean ?? null);
                if (pred === null || pred === undefined) return r;

                const newPred = Math.min(Math.round(pred), cap);
                const newIClow = Math.max(0, Math.min((r.IClow ?? 0), cap));
                const newIChigh = Math.max(0, Math.min((r.IChigh ?? cap), cap));

                return {
                    ...r,
                    Pred: newPred,
                    pred_mean: Math.min(r.pred_mean ?? newPred, cap),
                    IClow: newIClow,
                    IChigh: newIChigh
                };
            } catch (err) {
                return r;
            }
        });

        // Si solicitan debug, devolver datos intermedios para diagnóstico
        if (options?.debug) {
            const trainSample = train.slice(0, 50);
            const entradasCopy = entradas;
            const rawCopy = rawResults;
            // convertir examCapsByAsig (Map) a objeto serializable
            const capsObj: Record<string, Record<string, number>> = {};
            for (const [asig, map] of Array.from(examCapsByAsig.entries())) {
                capsObj[asig] = {};
                for (const [conv, val] of Array.from(map.entries())) {
                    capsObj[asig][conv] = val;
                }
            }

            return {
                debug: true,
                trainSample,
                entradas: entradasCopy,
                examCapsByAsig: capsObj,
                rawResults: rawCopy,
                clipped,
            };
        }

        return clipped;
    } catch (error) {
        console.error('Error al procesar historial para predicción', error);
        throw error;
    }
}



// Obtener historico por asignatura y devolver predicciones automáticamente
export async function computeForAsignatura(id_asignatura: string, options?: { targets?: Target[]; nFuture?: number; debug?: boolean }) {
    try {
        // Obtener historial desde el servicio existente
        const historial = await getHistorico(id_asignatura);
        if (!Array.isArray(historial) || historial.length === 0) {
            throw new Error('Historial no encontrado para la asignatura');
        }

        // Si se pasan targets en options, usar; si no, generar nFuture targets (por defecto 3)
        let targets = options?.targets;
        const nFuture = options?.nFuture ?? 3;
        if (!targets || targets.length === 0) {
            // tomar último registro para obtener curso
            const last = historial[historial.length - 1];
            const lastCurso = typeof last.curso === 'string' ? parseInt(last.curso, 10) : last.curso;

            // generar convocatorias simples: JUNIO, SEPTIEMBRE, ENERO repetidas
            const convs = ['JUNIO', 'SEPTIEMBRE', 'ENERO', 'FEBRERO'];
            targets = [];
            for (let i = 1; i <= nFuture; i++) {
                const idx = (i - 1) % convs.length;
                const curso = lastCurso + Math.floor((i - 1) / convs.length);
                targets.push({ id_asignatura, curso, convocatoria: convs[idx] });
            }
        }

        const examenesAsig = await getAllExamenes(id_asignatura).catch(() => []);
        const aulasNecesariasPorConv = new Map<string, number>();
        const sessionIdsByTarget: Array<string | null> = [];

        const latestSessionId = examenesAsig
            .flatMap((ex: any) => ex.sesion ?? [])
            .sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            [0]?.id ?? null;

        for (const ex of examenesAsig) {
            const conv = String(ex.convocatoria ?? '').toUpperCase();
            const roomCount = Math.max(1, ex.aulaAlumnos?.length ?? 0);
            const current = aulasNecesariasPorConv.get(conv) ?? 0;
            aulasNecesariasPorConv.set(conv, Math.max(current, roomCount));
        }

        for (const target of targets) {
            const targetConv = String(target.convocatoria ?? '').toUpperCase();
            const targetCurso = String(target.curso ?? '').trim();
            const matchedExam = examenesAsig.find((ex: any) => {
                const examYear = new Date(ex.fecha_examen).getFullYear();
                const examConv = String(ex.convocatoria ?? '').toUpperCase();
                return examConv === targetConv && String(examYear) === targetCurso;
            });

            const matchedSession = matchedExam?.sesion?.[0]?.id ?? null;
            sessionIdsByTarget.push(matchedSession ?? latestSessionId);
        }

        // Delega en computeFromHistorial
        const resultados = await computeFromHistorial(historial as any, targets as any, { debug: options?.debug });

        if (!options?.debug && Array.isArray(resultados) && resultados.length > 0) {
            await savePrediccionesAsignatura(targets, resultados as any, aulasNecesariasPorConv, sessionIdsByTarget);
        }

        return resultados;
    } catch (error) {
        console.error('Error en computeForAsignatura', error);
        throw error;
    }
}