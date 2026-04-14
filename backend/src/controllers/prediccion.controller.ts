import { type Request, type Response } from "express";
import * as prediccionService from "../services/prediccion.services.ts";

export async function createPrediccion(req: Request, res: Response){
    try{
        const data = {
            ...req.body,
        };
        const prediccion = await prediccionService.createPrediccion(data);
        res.status(201).json(prediccion);
    }catch(error)
    {
        console.error("Error al crear la prediccion", error);
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
        res.status(500).json({ error: "Error al obtener las predicciones" });
    }
}

export async function updatePrediccion(req: Request, res: Response){
    try{
        const id = req.params.id;
        const prediccion = await prediccionService.updatePrediccion(id, req.body);
        res.json(prediccion);
    }catch(error)
    {
        console.error("Error al actualizar la prediccion", error);
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
        res.status(500).json({ error: "Error al eliminar la prediccion" });
    }
}