import { type Request, type Response } from "express";
import * as historicoService from "../services/historico.services.ts";

export async function createHistorico(req: Request, res: Response){
    try{
        const data = {
            ...req.body,
        };
        const historico = await historicoService.createHistorico(data);
        res.status(201).json(historico);
    }catch(error)
    {
        console.error("Error al crear el historico", error);
        res.status(500).json({ error: "Error al crear el historico" });
    }
}

export async function getHistorico(req: Request, res: Response){
    try{
        const id = req.params.idAsign;
        const historico = await historicoService.getHistorico(id);
        res.json(historico);
    }catch(error)
    {
        console.error("Error al obtener el historico", error);
        res.status(500).json({ error: "Error al obtener el historico" });
    }
}

export async function getOneHistorico(req: Request, res: Response){
    try{
        const id = req.params.id;
        const historico = await historicoService.getOneHistorico(id);
        res.json(historico);
    }catch(error)
    {
        console.error("Error al obtener el examen", error);
        res.status(500).json({ error: "Error al obtener el examen" });
    }
}

export async function updateConvocatoriaExamen(req: Request, res: Response){
    try{
        const id = req.params.id;
        const examen = await examenService.updateConvocatoriaExamen(id, req.body);
        res.json(examen);
    }catch(error)
    {
        console.error("Error al actualizar el examen", error);
        res.status(500).json({ error: "Error al actualizar el examen" });
    }
}

export async function updateTiempoExamen(req: Request, res: Response){
    try{
        const id = req.params.id;
        const examen = await examenService.updateTiempoExamen(id, req.body);
        res.json(examen);
    }catch(error)
    {
        console.error("Error al actualizar el tiempo de examen", error);
        res.status(500).json({ error: "Error al actualizar el tiempo de examen" });
    }
}

export async function updateEstadoExamen(req: Request, res: Response){
    try{
        const id = req.params.id;
        const examen = await examenService.updateEstadoExamen(id);
        res.json(examen);
    }catch(error)
    {
        console.error("Error al actualizar el examen", error);
        res.status(500).json({ error: "Error al actualizar el examen" });
    }
}

export async function updateExamen(req: Request, res: Response){
    try{
        const id = req.params.id;
        const examen = await examenService.updateExamen(id, req.body);
        res.json(examen);
    }catch(error)
    {
        console.error("Error al actualizar el examen", error);
        res.status(500).json({ error: "Error al actualizar el examen" });
    }
}

export async function deleteExamen(req: Request, res: Response){
    try{
        const id = req.params.id;
        const examen = await examenService.deleteExamen(id);
        res.json({ examen, message: "Examen eliminado correctamente" });
    }catch(error)
    {
        console.error("Error al eliminar el examen", error);
        res.status(500).json({ error: "Error al eliminar el examen" });
    }
}