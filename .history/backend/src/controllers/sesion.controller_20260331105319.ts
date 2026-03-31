import { type Request, type Response } from "express";
import * as sesionService from "../services/sesion.services.ts";

export async function createSesion(req: Request, res: Response){
    try{
        const data = {
            ...req.body,
        };
        const sesion = await sesionService.createSesion(data);
        res.status(201).json(sesion);
    }catch(error)
    {
        console.error("Error al crear la sesion", error);
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
        console.error("Error al obtener el historico por id", error);
        res.status(500).json({ error: "Error al obtener el historico por id" });
    }
}

export async function updateHistorico(req: Request, res: Response){
    try{
        const id = req.params.id;
        const historico = await historicoService.updateHistorico(id, req.body);
        res.json(historico);
    }catch(error)
    {
        console.error("Error al actualizar el historico", error);
        res.status(500).json({ error: "Error al actualizar el historico" });
    }
}

export async function deleteHistorico(req: Request, res: Response){
    try{
        const id = req.params.id;
        const historico = await historicoService.deleteHistorico(id);
        res.json({ historico, message: "Historico eliminado correctamente" });
    }catch(error)
    {
        console.error("Error al eliminar el historico", error);
        res.status(500).json({ error: "Error al eliminar el historico" });
    }
}