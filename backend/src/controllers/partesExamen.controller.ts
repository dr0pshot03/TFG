import { type Request, type Response } from "express";
import * as partesExamenService from "../services/partesExamen.services.ts";

export async function createParte(req: Request, res: Response){
    try{
        const parte = await partesExamenService.createParte(req.body);
        res.status(201).json(parte);
    }catch(error)
    {
        console.error("Error al crear la parte del examen", error);
        res.status(500).json({ error: "Error al crear la parte del examen" });
    }
}

export async function getAllPartes(req: Request, res: Response){
    try{
        const {idExamen} = req.params;
        const partes = await partesExamenService.getAllPartes(idExamen);
        res.json(partes);
    }catch(error)
    {
        console.error("Error al obtener todas las partes", error);
        res.status(500).json({ error: "Error al obtener todas las partes" });
    }
}

export async function getParte(req: Request, res: Response){
    try{
        const {idParte} = req.params;
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
        const {idParte} = req.params;
        const parte = await partesExamenService.updateParte(idParte, req.body);
        res.json(parte);
    }catch(error)
    {
        console.error("Error al actualizar la parte del examen", error);
        res.status(500).json({ error: "Error al actualizar la parte del examen" });
    }
}

export async function deleteParte(req: Request, res: Response){
    try{
        const {idParte} = req.params;
        await partesExamenService.deleteParte(idParte);
        res.status(200).json({ message: "Parte de examen eliminada correctamente" });
    }catch(error)
    {
        console.error("Error al eliminar la parte del examen", error);
        res.status(500).json({ error: "Error al eliminar la parte del examen" });
    }
}