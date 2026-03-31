import { type Request, type Response } from "express";
import * as historicoService from "../services/historico.services";

export async function createHistorico(req: Request, res: Response){
    try{
        const data = {
            ...req.body,
        };
        const parte = await historicoService.createHistorico(data);
        res.status(201).json(parte);
    }catch(error)
    {
        console.error("Error al crear el historico", error);
        res.status(500).json({ error: "Error al crear el historico" });
    }
}

export async function getHistorico(req: Request, res: Response){
    try{
        const id = req.params.id;
        const sesion = await historicoService.getHistorico(id);
        res.json(sesion);
    }catch(error)
    {
        console.error("Error al obtener la historico", error);
        res.status(500).json({ error: "Error al obtener el historico" });
    }
}

export async function updateHistorico(req: Request, res: Response){
    try{
        const id = req.params.id;
        const sesion = await historicoService.updateSesion(id, req.body);
        res.json(sesion);
    }catch(error)
    {
        console.error("Error al actualizar el historico", error);
        res.status(500).json({ error: "Error al actualizar el historico" });
    }
}

export async function deleteHistorico(req: Request, res: Response){
    try{
        const id = req.params.id;
        const sesion = await historicoService.deleteHistorico(id);
        res.json({ sesion, message: "Historico eliminado correctamente" });
    }catch(error)
    {
        console.error("Error al eliminar el historico", error);
        res.status(500).json({ error: "Error al eliminar el historico" });
    }
}