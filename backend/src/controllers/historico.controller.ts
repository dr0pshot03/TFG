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
        const idAsign = req.params.idAsign;
        const historico = await historicoService.getHistorico(idAsign);
        res.json(historico);
    }catch(error)
    {
        console.error("Error al obtener el historico", error);
        res.status(500).json({ error: "Error al obtener el historico" });
    }
}

export async function searchHistoricoProfesor(req: Request, res: Response){
    try{
        const query = String(req.query.query ?? "");
        const historico = await historicoService.searchHistoricoProfesor(query);
        res.json(historico);
    }catch(error)
    {
        console.error("Error al buscar historico por profesor", error);
        res.status(500).json({ error: "Error al buscar historico por profesor" });
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