import { type Request, type Response } from "express";
import * as prediccionService from "../services/prediccion.services.js";

export async function createPrediccion(req: Request, res: Response){
    try{
        const data = {
            ...req.body,
        };
        await prediccionService.createPrediccion(data);
        res.status(201).json({"message" : "Predicción creada correctamente"});
    }catch(error)
    {
        console.error("Error al crear la prediccion", error);

        if (error instanceof Error && error.message === "Sesión no encontrada") {
            res.status(404).json({ error: "Sesión no encontrada" });
            return;
        }

        res.status(500).json({ error: "Error al crear la prediccion" });
    }
}

export async function getPrediccion(req: Request, res: Response){
    try{
        const id = req.params.id;
        const prediccion = await prediccionService.getPrediccion(id);
        res.json(prediccion);
    }catch(error)
    {
        console.error("Error al obtener la prediccion", error);

        if (error instanceof Error && error.message === "Prediccion no encontrada") {
            res.status(404).json({ error: "Prediccion no encontrada" });
            return;
        }

        res.status(500).json({ error: "Error al obtener la prediccion" });
    }
}

export async function getAllPredicciones(req: Request, res: Response){
    try{
        const idSesion = req.params.idSesion;
        const predicciones = await prediccionService.getAllPredicciones(idSesion);
        res.json(predicciones);
    }catch(error)
    {
        console.error("Error al obtener las predicciones", error);

        if (error instanceof Error && error.message === "Sesión no encontrada") {
            res.status(404).json({ error: "Sesión no encontrada" });
            return;
        }

        res.status(500).json({ error: "Error al obtener las predicciones" });
    }
}

export async function updatePrediccion(req: Request, res: Response){
    try{
        const id = req.params.id;
        const prediccion = await prediccionService.updatePrediccion(id, req.body);
        res.status(200).json({"message" : "Predicción actualizada correctamente"});
    }catch(error)
    {
        console.error("Error al actualizar la prediccion", error);

        if (error instanceof Error && error.message === "Prediccion no encontrada") {
            res.status(404).json({ error: "Prediccion no encontrada" });
            return;
        }

        if (error instanceof Error && error.message === "No hay campos para actualizar") {
            res.status(400).json({ error: "No hay campos para actualizar" });
            return;
        }

        res.status(500).json({ error: "Error al actualizar la prediccion" });
    }
}

export async function deletePrediccion(req: Request, res: Response){
    try{
        const id = req.params.id;
        const prediccion = await prediccionService.deletePrediccion(id);
        res.json({ prediccion, message: "Prediccion eliminada correctamente" });
    }catch(error)
    {
        console.error("Error al eliminar la prediccion", error);

        if (error instanceof Error && error.message === "Prediccion no encontrada") {
            res.status(404).json({ error: "Prediccion no encontrada" });
            return;
        }

        res.status(500).json({ error: "Error al eliminar la prediccion" });
    }
}

export async function computeForAsignatura(req: Request, res: Response){
    try{
        const idAsign = req.params.idAsign;
        const { targets, nFuture } = req.body ?? {};
        const debug = String(req.query.debug ?? '').toLowerCase() === 'true';
        const resultados = await prediccionService.computeForAsignatura(idAsign, { targets, nFuture, debug });
        res.json(resultados);
    }catch(error){
        console.error('Error al obtener prediccion por asignatura', error);
        if (error instanceof Error && error.message.includes('Historial no encontrado')) {
            res.status(404).json({ error: 'Historial no encontrado para la asignatura' });
            return;
        }
        res.status(500).json({
            error: 'Error al obtener prediccion por asignatura',
            detail: error instanceof Error ? error.message : String(error),
        });
    }
}