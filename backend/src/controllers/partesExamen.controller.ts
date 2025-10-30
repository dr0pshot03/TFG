import { type Request, type Response } from "express";
import * as partesExamenService from "../services/partesExamen.services.js";

export async function createParte(req: Request, res: Response){
    try{
        const data = {
            ...req.body,
        };
        const parte = await partesExamenService.createParte(data);
        res.status(201).json(parte);
    }catch(error)
    {
        console.error("Error al crear la parte del examen", error);
        res.status(500).json({ error: "Error al crear la parte del examen" });
    }
}

export async function getAllPartes(req: Request, res: Response){
    try{
        const id = req.body.idExamen;
        const partes = await partesExamenService.getAllPartes(id);
        res.json(partes);
    }catch(error)
    {
        console.error("Error al obtener todas las partes", error);
        res.status(500).json({ error: "Error al obtener todas las partes" });
    }
}

export async function getParte(req: Request, res: Response){
    try{
        const idParte = req.body.idParte;
        const parte = await partesExamenService.getParte(idParte);
        res.json(parte);
    }catch(error)
    {
        console.error("Error al obtener la parte del examen", error);
        res.status(500).json({ error: "Error al obtener la parte del examen" });
    }
}

export async function updateParte(req: Request, res: Response){
    try{
        const parte = await partesExamenService.updateParte(req.params.idParte, res);
        res.json(parte);
    }catch(error)
    {
        console.error("Error al actualizar la parte del examen", error);
        res.status(500).json({ error: "Error al actualizar la parte del examen" });
    }
}

export async function deleteParte(req: Request, res: Response){
    try{
        const id = req.body.idParte;
        await partesExamenService.deleteParte(id);
        res.status(200);
    }catch(error)
    {
        console.error("Error al eliminar la parte del examen", error);
        res.status(500).json({ error: "Error al eliminar la parte del examen" });
    }
}